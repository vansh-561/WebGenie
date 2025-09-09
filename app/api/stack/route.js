import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import openai from "@/utils/openAiConfig";
import dbConfig from "@/utils/dbConfig";
import { sendError, sendResponse, sendUnauthorized } from "@/utils/nextResponse";
import { logTokenUsage } from "@/utils/tokenUsage";

const SYSTEM_PROMPT = `You are WebGenie's senior solutions architect.
Given a software build brief, propose 2-3 technology stack presets that balance speed, scalability, and developer experience.
Respond with *valid JSON only* using this schema:
{
  "recommendations": [
    {
      "id": "stack_1",
      "label": "Concise stack name",
      "summary": "One sentence overview of when to use it",
      "frontend": "Primary frontend framework",
      "uiLibrary": "Component or style system",
      "backend": "Backend runtime/framework",
      "database": "Primary database",
      "deployment": "Preferred host or PaaS",
      "auth": "Auth provider/pattern",
      "orm": "ORM or query builder (optional)",
      "extras": ["Optional supporting services"],
      "rationale": "Why this stack fits the prompt",
      "fitScore": 0.0
    }
  ]
}
Rules:
- Provide at least 2 recommendations and at most 3.
- fitScore ranges 0.0-1.0 (two decimals) representing suitability for the prompt.
- Tailor each recommendation to the provided brief and highlight differentiators (e.g., real-time collaboration, content-heavy, AI-heavy).`;

const tryParseJSON = (text) => {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (error) {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(text.slice(start, end + 1));
            } catch (innerError) {
                return null;
            }
        }
        return null;
    }
};

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return sendUnauthorized();
    }

    await dbConfig();

    const body = await request.json();
    const { prompt } = body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return sendError("Accepted prompt is required to generate stack recommendations.", 400);
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-mini",
            temperature: 0.35,
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: `Product Brief:\n${prompt.trim()}`,
                },
            ],
        });

        const reply = completion?.choices?.[0]?.message?.content?.trim();
        const parsed = tryParseJSON(reply);

        if (!parsed?.recommendations || !Array.isArray(parsed.recommendations) || parsed.recommendations.length === 0) {
            return sendError("The AI response could not be interpreted. Please try again.", 502);
        }

        const recommendations = parsed.recommendations.map((rec, index) => ({
            ...rec,
            id: rec.id || `stack-${index + 1}`,
        }));

        const tokensUsed = completion?.usage?.total_tokens ?? 0;

        if (tokensUsed) {
            await logTokenUsage({
                userId: session.user.id,
                email: session.user.email,
                tokensUsed,
            });
        }

        return sendResponse({
            message: "Stack recommendations generated",
            data: {
                model: completion?.model,
                recommendations,
            },
        });
    } catch (error) {
        console.error("Stack recommendation failed:", error);
        return sendError("Unable to generate stack recommendations right now. Please try again.", 500);
    }
}

