import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConfig from "@/utils/dbConfig";
import mongoose from "mongoose";
import Project from "@/utils/models/Project";
import openai from "@/utils/openAiConfig";
import { logTokenUsage } from "@/utils/tokenUsage";
import { sendError, sendResponse, sendUnauthorized } from "@/utils/nextResponse";
import User from "@/utils/models/User";

const SYSTEM_PROMPT = `You are WebGenie's project bootstrapper.
Given a finalized build brief and a chosen tech stack, you must output a ready-to-run project skeleton as JSON with this schema:
{
  "summary": "Short overview of what you generated",
  "instructions": ["ordered build instructions"],
  "commands": ["terminal commands to run locally"],
  "files": [
    {
      "path": "relative/path.ext",
      "purpose": "Short reason this file exists",
      "contents": "full file contents"
    }
  ]
}
Guidelines:
- Focus on scaffolding a production-grade app with sensible defaults.
- Keep files concise but functional.
- Include environment examples when relevant (.env.example).
- Prefer Typescript when stack references Next.js/Node.
- Make sure commands align with the generated project (e.g., npm install, npm run dev).`;

const buildTreeFromFiles = (files = []) => {
    const root = {};
    files.forEach((file) => {
        if (!file?.path) return;
        const parts = file.path.split("/").filter(Boolean);
        let node = root;
        parts.forEach((part, index) => {
            if (!node[part]) {
                node[part] = {
                    name: part,
                    isFile: index === parts.length - 1,
                    children: {},
                };
            }
            node = node[part].children;
        });
    });

    const buildArray = (obj, depth = 0, prefix = "") =>
        Object.entries(obj).map(([key, value]) => {
            const nodePath = prefix ? `${prefix}/${key}` : key;
            if (value.isFile) {
                return {
                    type: "file",
                    name: key,
                    path: nodePath,
                };
            }
            return {
                type: "folder",
                name: key,
                path: nodePath,
                children: buildArray(value.children, depth + 1, nodePath),
            };
        });

    return buildArray(root);
};

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return sendUnauthorized();
    }

    await dbConfig();

    const body = await request.json();
    const {
        projectId,
        prompt: promptOverride,
        stack: stackOverride,
        regenerate = false,
    } = body || {};

    if (!projectId) {
        return sendError("Project ID is required to initialize code.", 400);
    }

    const resolveOwnerId = async () => {
        if (session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
            return session.user.id;
        }
        if (session.user.email) {
            const dbUser = await User.findOne({ email: session.user.email }).select("_id");
            if (dbUser) {
                return dbUser._id.toString();
            }
        }
        return null;
    };

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return sendError("Invalid projectId provided.", 400);
    }

    const ownerId = await resolveOwnerId();

    if (!ownerId) {
        return sendError("Unable to resolve user record for project owner.", 400);
    }

    const project = await Project.findOne({ _id: projectId, owner: ownerId });

    if (!project) {
        return sendError("Project not found.", 404);
    }

    const prompt = promptOverride || project.acceptedPrompt;
    const stack = stackOverride || project.selectedStack;

    if (!prompt || !stack) {
        return sendError("Prompt and tech stack must be finalized before generation.", 400);
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4.1",
            temperature: 0.15,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Build Brief:\n${prompt}` },
                { role: "user", content: `Chosen Tech Stack:\n${JSON.stringify(stack, null, 2)}` },
            ],
        });

        const reply = completion?.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            return sendError("Model response was empty. Try again.", 502);
        }

        let parsed;
        try {
            parsed = JSON.parse(reply);
        } catch (error) {
            console.error("Failed to parse code generation response:", error);
            return sendError("Could not parse the generated project. Try regenerating.", 502);
        }

        const files = Array.isArray(parsed.files) ? parsed.files : [];
        const tree = parsed.fileTree || buildTreeFromFiles(files);

        const baseRevision = project.projectBundle?.revision || 0;
        const tokensUsed = completion?.usage?.total_tokens ?? 0;

        const bundle = {
            revision: baseRevision + 1,
            generatedAt: new Date(),
            model: completion?.model,
            summary: parsed.summary || "Generated starter project",
            instructions: parsed.instructions || [],
            commands: parsed.commands || [],
            files,
            fileTree: tree,
            stackSnapshot: stack,
            promptSnapshot: prompt,
            tokensUsed,
        };

        if (project.projectBundle) {
            project.projectRevisions = [
                ...(project.projectRevisions || []),
                {
                    revision: project.projectBundle.revision,
                    generatedAt: project.projectBundle.generatedAt,
                    model: project.projectBundle.model,
                    stackSnapshot: project.projectBundle.stackSnapshot,
                    summary: project.projectBundle.summary,
                    tokensUsed: project.projectBundle.tokensUsed,
                    bundle: project.projectBundle,
                },
            ].slice(-5);
        }

        project.projectBundle = bundle;
        project.tokensUsed = (project.tokensUsed || 0) + tokensUsed;
        project.finalOutput = bundle.summary;
        project.lastUpdated = new Date();
        await project.save();

        if (tokensUsed) {
            await logTokenUsage({
                userId: session.user.id,
                email: session.user.email,
                tokensUsed,
            });
        }

        return sendResponse({
            message: regenerate ? "Project regenerated" : "Project initialized",
            data: {
                projectBundle: bundle,
                revisions: project.projectRevisions || [],
            },
        });
    } catch (error) {
        console.error("Project generation failed:", error);
        return sendError("Failed to generate source code. Please try again in a bit.", 500);
    }
}

