import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConfig from '@/utils/dbConfig';
import User from '@/utils/models/User';
import { sendResponse, sendError, sendUnauthorized } from '@/utils/nextResponse';

export async function GET() {
    await dbConfig();
    try {
        const session = await getServerSession(authOptions);
        // console.log(session);
        // console.log("session from metadata");

        if (!session) {
            return sendUnauthorized();
        }

        const userMetadata = await User.findOne({ email: session.user.email });

        if (!userMetadata) {
            return sendError('User not found', 404);
        }

        const userData = {
            totalTokens: userMetadata.totalTokens,
            tokensToday: userMetadata.tokensToday,
            last30DaysUsage: userMetadata.last30DaysUsage,
            projects: userMetadata.projects,
        }

        return sendResponse({
            success: true,
            message: "User metadata fetched successfully",
            user: userData
        });

    } catch (error) {
        console.error('Error fetching user metadata:', error);
        return sendError('Internal Server Error', 500);
    }
}