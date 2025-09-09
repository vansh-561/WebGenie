import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConfig from "@/utils/dbConfig";
import User from "@/utils/models/User";
import { encrypt } from "@/utils/crypto";
import { sendError, sendResponse, sendUnauthorized } from "@/utils/nextResponse";

const resolveUser = async (session) => {
    if (!session?.user) {
        return null;
    }

    if (session.user.id && mongoose.Types.ObjectId.isValid(session.user.id)) {
        const dbUser = await User.findById(session.user.id);
        if (dbUser) {
            return dbUser;
        }
    }

    if (session.user.email) {
        return User.findOne({ email: session.user.email });
    }

    return null;
};

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return sendUnauthorized();
    }

    await dbConfig();
    const user = await resolveUser(session);

    if (!user) {
        return sendError("User not found", 404);
    }

    return sendResponse({
        message: "Token status fetched",
        data: {
            hasToken: Boolean(user.githubTokenEncrypted),
            updatedAt: user.githubTokenUpdatedAt || null,
        },
    });
}

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return sendUnauthorized();
    }

    await dbConfig();
    const user = await resolveUser(session);

    if (!user) {
        return sendError("User not found", 404);
    }

    const { token } = await request.json();

    if (!token) {
        user.githubTokenEncrypted = "";
        user.githubTokenUpdatedAt = null;
    } else {
        user.githubTokenEncrypted = encrypt(token);
        user.githubTokenUpdatedAt = new Date();
    }

    await user.save();

    return sendResponse({
        message: token ? "GitHub token saved securely" : "GitHub token cleared",
        data: {
            hasToken: Boolean(user.githubTokenEncrypted),
            updatedAt: user.githubTokenUpdatedAt,
        },
    });
}
