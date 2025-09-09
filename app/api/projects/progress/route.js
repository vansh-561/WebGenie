import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConfig from "@/utils/dbConfig";
import mongoose from "mongoose";
import Project from "@/utils/models/Project";
import User from "@/utils/models/User";
import { sendError, sendResponse, sendUnauthorized } from "@/utils/nextResponse";

const allowedFields = new Set([
    "name",
    "description",
    "promptHistory",
    "acceptedPrompt",
    "promptModel",
    "stackRecommendations",
    "selectedStack",
    "projectBundle",
    "deploymentDetails",
]);

const sanitizePayload = (data = {}) => {
    const sanitized = {};

    Object.entries(data).forEach(([key, value]) => {
        if (!allowedFields.has(key)) {
            return;
        }

        if (value === undefined) {
            return;
        }

        sanitized[key] = value;
    });

    return sanitized;
};

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return sendUnauthorized();
    }

    await dbConfig();

    const body = await request.json();
    const { projectId, data } = body || {};

    if (!data || typeof data !== "object") {
        return sendError("Project data is required", 400);
    }

    const payload = sanitizePayload(data);

    if (Object.keys(payload).length === 0) {
        return sendError("No valid fields provided to save.", 400);
    }

    payload.lastUpdated = new Date();

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
        return sendError("Unable to resolve user record for project owner.", 400);
    }

    let normalizedProjectId = null;
    if (projectId) {
        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return sendError("Invalid projectId provided.", 400);
        }
        normalizedProjectId = projectId;
    }

    let project;

    if (normalizedProjectId) {
        project = await Project.findOneAndUpdate(
            { _id: normalizedProjectId, owner: ownerId },
            { $set: payload },
            { new: true },
        );

        if (!project) {
            return sendError("Project not found for this user.", 404);
        }
    } else {
        project = await Project.create({
            owner: ownerId,
            name: payload.name || "Untitled Project",
            description: payload.description || "",
            promptHistory: payload.promptHistory || [],
            acceptedPrompt: payload.acceptedPrompt || "",
            promptModel: payload.promptModel || "",
            stackRecommendations: payload.stackRecommendations || [],
            selectedStack: payload.selectedStack || null,
            isPublic: false,
            status: "active",
        });
    }

    return sendResponse({
        message: "Project progress saved",
        data: {
            projectId: project._id,
        },
    });
}

