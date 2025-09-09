import mongoose from "mongoose";
import User from "@/utils/models/User";

const getStartOfDay = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
};

export const logTokenUsage = async ({ userId, email, tokensUsed = 0 }) => {
    if (!tokensUsed || tokensUsed <= 0) {
        return;
    }

    let user = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
    }

    if (!user && email) {
        user = await User.findOne({ email });
    }

    if (!user) {
        return;
    }

    const now = new Date();
    const startOfToday = getStartOfDay(now);
    const isNewDay = !user.updatedAt || user.updatedAt < startOfToday;
    const tokensToday = isNewDay ? tokensUsed : (user.tokensToday || 0) + tokensUsed;
    const totalTokens = Math.max(0, (user.totalTokens || 0) - tokensUsed);
    const usageHistory = Array.isArray(user.last30DaysUsage) ? [...user.last30DaysUsage] : [];
    usageHistory.push({ date: now, tokens: tokensUsed });

    await User.updateOne(
        { _id: user._id },
        {
            tokensToday,
            totalTokens,
            last30DaysUsage: usageHistory.slice(-30),
            lastUpdated: now,
        },
    );
};

