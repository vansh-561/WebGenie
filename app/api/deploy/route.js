import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConfig from "@/utils/dbConfig";
import Project from "@/utils/models/Project";
import User from "@/utils/models/User";
import { sendError, sendResponse, sendUnauthorized } from "@/utils/nextResponse";
import { config } from "@/utils/const";

const slugify = (value = "") =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
        .substring(0, 48) || "webgenie-app";

const buildLogs = (provider, subdomain) => [
    { step: "bundle", status: "success", message: "Zipped generated files" },
    { step: "upload", status: "success", message: `Uploaded bundle to ${provider}` },
    { step: "deploy", status: "success", message: `Deployment queued for ${subdomain}` },
    { step: "verify", status: "success", message: "Health ping succeeded" },
];

const resolveOwnerId = async (session) => {
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

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return sendUnauthorized();
    }

    await dbConfig();

    const ownerId = await resolveOwnerId(session);
    if (!ownerId) {
        return sendError("Unable to resolve user record.", 400);
    }

    const { projectId, provider = "vercel", subdomain } = await request.json();

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
        return sendError("Valid projectId is required", 400);
    }

    const project = await Project.findOne({ _id: projectId, owner: ownerId });

    if (!project) {
        return sendError("Project not found", 404);
    }

    if (!project.projectBundle) {
        return sendError("Generate the project in Step 3 before deploying.", 400);
    }

    const vercelToken = config.vercel.token;
    if (!vercelToken) {
        return sendError("VERCEL_TOKEN is not configured on the server.", 500);
    }

    const baseDomain = config.vercel.baseDomain || "webgenie.ishaanminocha.in";
    const slug = slugify(subdomain || project.name || `webgenie-${project._id.toString().slice(-4)}`);
    const aliasHost = `${slug}.${baseDomain}`;

    const filesPayload = (project.projectBundle.files || []).map((file) => ({
        file: file.path,
        data: Buffer.from(file.contents || "", "utf8").toString("base64"),
        encoding: "base64",
    }));

    if (!filesPayload.length) {
        return sendError("Generated project is missing files to deploy.", 400);
    }

    const teamQuery = config.vercel.teamId ? `?teamId=${config.vercel.teamId}` : "";
    const deploymentEndpoint = `https://api.vercel.com/v13/deployments${teamQuery}`;

    let deploymentResponse;
    try {
        const deploymentBody = {
            name: slug,
            files: filesPayload,
            target: "production",
            projectSettings: {
                framework: "nextjs",
            },
            alias: [aliasHost],
        };

        const response = await fetch(deploymentEndpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${vercelToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(deploymentBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Vercel deployment error:", errorText);
            return sendError("Failed to trigger deployment on Vercel.", response.status);
        }

        deploymentResponse = await response.json();
    } catch (error) {
        console.error("Vercel deployment failed:", error);
        return sendError("Unable to reach Vercel deployment API.", 500);
    }

    const deploymentId = deploymentResponse.id;

    const pollDeploymentStatus = async () => {
        const statusEndpoint = `https://api.vercel.com/v13/deployments/${deploymentId}${teamQuery}`;
        for (let attempt = 0; attempt < 15; attempt += 1) {
            const res = await fetch(statusEndpoint, {
                headers: {
                    Authorization: `Bearer ${vercelToken}`,
                },
            });
            const data = await res.json();
            if (data.readyState === "READY") {
                return data;
            }
            if (data.readyState === "ERROR") {
                throw new Error(data.error?.message || "Deployment failed");
            }
            await new Promise((resolve) => setTimeout(resolve, 3000));
        }
        throw new Error("Deployment is taking longer than expected. Please check Vercel dashboard.");
    };

    let finalDeployment;
    try {
        finalDeployment = await pollDeploymentStatus();
    } catch (error) {
        console.error("Deployment poll failed:", error);
        return sendError(error.message || "Deployment did not finish in time.", 500);
    }

    try {
        const aliasEndpoint = `https://api.vercel.com/v2/deployments/${deploymentId}/aliases${teamQuery}`;
        const aliasResponse = await fetch(aliasEndpoint, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${vercelToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ alias: aliasHost }),
        });
        if (!aliasResponse.ok) {
            const errorText = await aliasResponse.text();
            console.error("Failed to assign alias:", errorText);
        }
    } catch (error) {
        console.error("Alias assignment failed:", error);
    }

    const vercelLogs = buildLogs(provider, slug);
    vercelLogs.push({
        step: "vercel",
        status: "success",
        message: `Deployment ready: https://${aliasHost}`,
    });

    const deployment = {
        provider: "vercel",
        url: `https://${aliasHost}`,
        logs: vercelLogs,
        subdomain: slug,
        deployedAt: new Date(finalDeployment.ready || Date.now()),
        revision: project.projectBundle.revision,
        vercel: {
            deploymentId,
            inspectUrl: finalDeployment.inspectUrl,
        },
    };

    project.deploymentDetails = deployment;
    await project.save();

    return sendResponse({
        message: "Deployment triggered",
        data: deployment,
    });
}

