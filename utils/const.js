export const config = {
    general: {
        mongoDbUri: process.env.MONGODB_URI,
    },
    openai: {
        organization: process.env.OPENAI_ORGANIZATION,
        project: process.env.OPENAI_PROJECT,
        apiKey: process.env.OPENAI_API_KEY,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
    },
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        productId: process.env.STRIPE_PRODUCT_ID,
        paymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK,
    },
    nextAuth: {
        secret: process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL,
    },
    github: {
        id: process.env.GITHUB_ID,
        secret: process.env.GITHUB_SECRET,
    },
    prompt: {
        step1: "you are a helpful assistant that helps the user to generate ideas for their startup",
        step2: "you are a helpful assistant that helps the user to generate ideas for their startup",
        step3: "you are a helpful assistant that helps the user to generate ideas for their startup",
        step4: "you are a helpful assistant that helps the user to generate ideas for their startup",
    },
    vercel: {
        token: process.env.VERCEL_TOKEN,
        teamId: process.env.VERCEL_TEAM_ID,
        baseDomain: process.env.DEPLOY_BASE_DOMAIN || "webgenie.ishaanminocha.in",
    },
};