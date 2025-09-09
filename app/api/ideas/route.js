import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import openai from "@/utils/openAiConfig";
import dbConfig from "@/utils/dbConfig";
import { sendError, sendResponse, sendUnauthorized } from "@/utils/nextResponse";
import { logTokenUsage } from "@/utils/tokenUsage";

const ITERATION_PROMPT = `You are WebGenie's ideation copilot.
Polish raw startup or product ideas into concise, actionable prompts that another AI can use to build a full-stack web app.
Each response should:
- Start with a two sentence summary of the user’s intent and target audience.
- List 3-5 bullet points that cover key features, data requirements, and success criteria.
- Explicitly mention any constraints the user supplied (timeline, platform, integrations, tone, etc.).
Keep the tone helpful, under 220 words, and stay faithful to what the user asked for.`;

const FINAL_PROMPT = `You are WebGenie's final prompt architect.
Read the full conversation and produce a single, production-ready build brief that another AI can execute directly.
Requirements:
- 2 sentence overview describing the problem, solution, and target audience.
- Bullet list covering: primary flows, data entities (with fields), integrations/services, and success criteria.
- Constraints or preferences must be clearly called out.
- Keep total length under 250 words, be precise, and avoid marketing fluff.`;

const normalizeConversation = (conversation = []) =>
    conversation
        .map((message) => ({
            role: message.role === "assistant" ? "assistant" : "user",
            content: typeof message.content === "string" ? message.content : "",
        }))
        .filter((message) => message.content.trim().length > 0);

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return sendUnauthorized();
    }

    await dbConfig();

    const body = await request.json();
    const { conversation, mode = "iterate" } = body || {};

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
        return sendError("Conversation history is required to enhance an idea.", 400);
    }

    const normalizedMessages = normalizeConversation(conversation);

    if (normalizedMessages.length === 0) {
        return sendError("At least one non-empty message is required.", 400);
    }

    const isFinal = mode === "finalize";
    const selectedModel = isFinal ? "gpt-4.1" : "gpt-4.1-mini";
    const systemPrompt = isFinal ? FINAL_PROMPT : ITERATION_PROMPT;
    const temperature = isFinal ? 0.2 : 0.5;

    try {
        const completion = await openai.chat.completions.create({
            model: selectedModel,
            temperature,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...normalizedMessages,
            ],
        });

        const reply = completion?.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            return sendError("Unable to craft an improved prompt right now. Please try again.", 502);
        }

        const tokensUsed = completion?.usage?.total_tokens ?? 0;

        if (tokensUsed) {
            await logTokenUsage({
                userId: session.user.id,
                email: session.user.email,
                tokensUsed,
            });
        }

        return sendResponse({
            message: isFinal ? "Prompt finalized successfully" : "Prompt enhanced successfully",
            data: {
                reply,
                model: completion?.model,
                usage: completion?.usage,
                mode: isFinal ? "finalize" : "iterate",
            },
        });
    } catch (error) {
        console.error("Prompt enhancement failed:", error);
        return sendError("Failed to enhance idea. Please try again in a moment.", 500);
    }
}

