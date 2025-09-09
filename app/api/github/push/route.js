import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConfig from "@/utils/dbConfig";
import Project from "@/utils/models/Project";
import User from "@/utils/models/User";
import { sendError, sendResponse, sendUnauthorized } from "@/utils/nextResponse";
import { decrypt, encrypt } from "@/utils/crypto";
import { Octokit } from "@octokit/rest";

const slugify = (value = "") =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
        .substring(0, 60) || `webgenie-project`;

const ensureRepository = async (octokit, owner, repo, description) => {
    try {
        await octokit.repos.get({ owner, repo });
    } catch (error) {
        if (error.status === 404) {
            await octokit.repos.createForAuthenticatedUser({
                name: repo,
                private: false,
                description,
            });
        } else {
            throw error;
        }
    }
};

const pushFiles = async ({ octokit, owner, repo, files, branch }) => {
    for (const file of files) {
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            branch,
            path: file.path,
            message: `chore: add ${file.path} via WebGenie`,
            content: Buffer.from(file.contents || "", "utf8").toString("base64"),
        });
    }
};

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return sendUnauthorized();
    }

    await dbConfig();

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

    const ownerId = await resolveOwnerId();
    if (!ownerId) {
        return sendError("Unable to resolve user record.", 400);
    }

    const { projectId, repositoryName, token, rememberToken = false, branch = "main" } = await request.json();

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        return sendError("Valid projectId is required", 400);
    }

    const project = await Project.findOne({ _id: projectId, owner: ownerId });
    if (!project) {
        return sendError("Project not found", 404);
    }

    if (!project.projectBundle?.files?.length) {
        return sendError("Generate the project in Step 3 before pushing to GitHub.", 400);
    }

    const user = await User.findById(ownerId);
    let githubToken = token;

    if (!githubToken && user?.githubTokenEncrypted) {
        try {
            githubToken = decrypt(user.githubTokenEncrypted);
        } catch (error) {
            console.error("Failed to decrypt GitHub token:", error);
        }
    }

    if (!githubToken) {
        return sendError("A GitHub Personal Access Token is required.", 400);
    }

    const octokit = new Octokit({ auth: githubToken });
    const { data: ghUser } = await octokit.users.getAuthenticated();
    const owner = ghUser.login;
    const repo = slugify(repositoryName || project.name || `webgenie-${project._id.toString().slice(-4)}`);

    try {
        await ensureRepository(octokit, owner, repo, project.description || "Created via WebGenie");
        await pushFiles({
            octokit,
            owner,
            repo,
            files: project.projectBundle.files,
            branch,
        });
    } catch (error) {
        console.error("GitHub push failed:", error);
        return sendError(error?.message || "Unable to push files to GitHub.", 500);
    }

    if (rememberToken && token) {
        user.githubTokenEncrypted = encrypt(token);
        user.githubTokenUpdatedAt = new Date();
        await user.save();
    }

    const repoUrl = `https://github.com/${owner}/${repo}`;
    project.repoUrl = repoUrl;
    await project.save();

    return sendResponse({
        message: "Repository updated",
        data: {
            repoUrl,
            repositoryName: repo,
            branch,
        },
    });
}

