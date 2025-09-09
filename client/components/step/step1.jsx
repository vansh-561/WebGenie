"use client";

import axios from "axios";
import { BotIcon, CheckCircle2, Loader2, RefreshCcw, ShieldCheck, UserIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useStepFlow } from "@/client/context/StepFlowContext";

function Step1() {
    const [idea, setIdea] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [isPersisting, setIsPersisting] = useState(false);
    const [error, setError] = useState("");
    const [persistError, setPersistError] = useState("");
    const {
        promptConversation,
        setPromptConversation,
        acceptedPrompt,
        setAcceptedPrompt,
        setPromptModel,
        projectId,
        setProjectId,
    } = useStepFlow();

    const latestAssistantMessage = useMemo(
        () => [...promptConversation].reverse().find((msg) => msg.role === "assistant"),
        [promptConversation],
    );

    const latestUserMessage = useMemo(
        () => [...promptConversation].reverse().find((msg) => msg.role === "user"),
        [promptConversation],
    );

    const createId = () => {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!idea.trim() || isLoading) {
            return;
        }
        await handleEnhance(idea.trim());
    };

    const handleEnhance = async (message) => {
        setError("");
        const userMessage = {
            id: createId(),
            role: "user",
            content: message,
            timestamp: new Date().toISOString(),
        };

        const optimisticConversation = [...promptConversation, userMessage];
        setPromptConversation(optimisticConversation);
        setIdea("");
        setIsLoading(true);

        try {
            const response = await axios.post("/api/ideas", {
                conversation: optimisticConversation.map(({ role, content }) => ({ role, content })),
            });
            const payload = response?.data?.data;

            const assistantContent =
                payload?.reply?.trim() ||
                "I wasn't able to enhance that idea. Could you provide a bit more context?";

            const assistantMessage = {
                id: createId(),
                role: "assistant",
                content: assistantContent,
                timestamp: new Date().toISOString(),
                model: payload?.model,
            };

            setPromptModel(payload?.model || "gpt-4.1-mini");
            setPromptConversation((prev) => [...prev, assistantMessage]);
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to enhance idea. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!latestUserMessage || isLoading) {
            return;
        }
        await handleEnhance(latestUserMessage.content);
    };

    const sanitizeConversation = (conversationList) =>
        conversationList.map(({ role, content, model, timestamp }) => ({
            role,
            content,
            model: model || null,
            timestamp,
        }));

    const persistPromptSnapshot = async (history, finalContent, model) => {
        if (!finalContent) {
            return;
        }
        setIsPersisting(true);
        setPersistError("");
        try {
            const response = await axios.post("/api/projects/progress", {
                projectId,
                data: {
                    name: history?.[0]?.content?.slice(0, 60) || "Untitled Project",
                    promptHistory: sanitizeConversation(history),
                    acceptedPrompt: finalContent,
                    promptModel: model,
                },
            });

            const savedProjectId = response?.data?.data?.projectId;
            if (!projectId && savedProjectId) {
                setProjectId(savedProjectId);
            }
        } catch (err) {
            console.error(err);
            setPersistError("Prompt locked, but saving progress failed. Try again from Step 1 later.");
        } finally {
            setIsPersisting(false);
        }
    };

    const handleFinalize = async () => {
        if (promptConversation.length === 0 || isFinalizing) {
            return;
        }
        setError("");
        setPersistError("");
        setIsFinalizing(true);

        try {
            const response = await axios.post("/api/ideas", {
                conversation: promptConversation.map(({ role, content }) => ({ role, content })),
                mode: "finalize",
            });

            const payload = response?.data?.data;

            const finalContent =
                payload?.reply?.trim() ||
                "I wasn't able to finalize that idea. Could you provide a bit more context?";

            const finalMessage = {
                id: createId(),
                role: "assistant",
                content: finalContent,
                timestamp: new Date().toISOString(),
                model: payload?.model,
            };

            setPromptModel(payload?.model || "gpt-4.1");
            setPromptConversation((prev) => [...prev, finalMessage]);
            setAcceptedPrompt(finalContent);
            await persistPromptSnapshot([...promptConversation, finalMessage], finalContent, payload?.model || "gpt-4.1");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Failed to finalize prompt. Please try again.");
        } finally {
            setIsFinalizing(false);
        }
    };

    return (
        <div>
            <div className="text-2xl font-bold uppercase">Ideation</div>
            <div className="text-lg font-normal mb-5 text-gray-200">
                Describe your product idea. We will iteratively polish it until you&apos;re happy with a final prompt.
            </div>

            <div className="mb-6 max-h-80 overflow-y-auto space-y-4 pr-2">
                {promptConversation.length === 0 && (
                    <div className="text-gray-400 text-sm border border-dashed border-gray-600 rounded-md p-4">
                        No ideas yet. Share what you&apos;d like to build and I&apos;ll enhance it for you.
                    </div>
                )}

                {promptConversation.map((message) => (
                    <div
                        key={message.id}
                        className={`flex gap-3 ${message.role === "assistant" ? "items-start" : "items-end justify-end"}`}
                    >
                        {message.role === "assistant" && (
                            <BotIcon className="h-5 w-5 mt-1 text-indigo-300 shrink-0" />
                        )}
                        <div
                            className={`rounded-2xl p-3 text-sm max-w-3xl ${message.role === "assistant"
                                ? "bg-gray-700 text-gray-100"
                                : "bg-indigo-600 text-white"
                                }`}
                        >
                            <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
                            {message.role === "assistant" && (
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                    {message.model && <span>Model: {message.model}</span>}
                                    {acceptedPrompt === message.content ? (
                                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                                            <CheckCircle2 className="h-4 w-4" /> Selected
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="underline underline-offset-2 hover:text-gray-200"
                                            onClick={() => setAcceptedPrompt(message.content)}
                                        >
                                            Use this version
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        {message.role === "user" && <UserIcon className="h-5 w-5 text-slate-300 shrink-0" />}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Brewing a sharper prompt...
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col">
                    <textarea
                        value={idea}
                        onChange={(event) => setIdea(event.target.value)}
                        placeholder="Explain your product, target users, and the core flow you have in mind."
                        className="border border-gray-600 bg-gray-900 text-gray-100 p-3 w-full min-h-28 text-base rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex flex-wrap gap-3">
                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-indigo-600 rounded-md disabled:bg-indigo-400"
                        disabled={!idea.trim() || isLoading}
                    >
                        {isLoading ? "Enhancing..." : "Enhance Idea"}
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-500 text-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!latestUserMessage || isLoading}
                        onClick={handleRegenerate}
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Regenerate Last Reply
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 border border-gray-500 text-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!latestAssistantMessage || acceptedPrompt === latestAssistantMessage?.content}
                        onClick={() => latestAssistantMessage && setAcceptedPrompt(latestAssistantMessage.content)}
                    >
                        Use Latest Suggestion
                    </button>
                    <button
                        type="button"
                        className="px-4 py-2 rounded-md bg-emerald-600 text-white disabled:bg-emerald-400 disabled:cursor-not-allowed"
                        disabled={promptConversation.length === 0 || isFinalizing}
                        onClick={handleFinalize}
                    >
                        {isFinalizing ? "Locking Prompt..." : "Finalize & Lock Prompt"}
                    </button>
                </div>
            </form>

            {acceptedPrompt && (
                <div className="mt-6 border border-emerald-500/40 bg-emerald-500/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                        <ShieldCheck className="h-5 w-5" />
                        Finalized Prompt
                    </div>
                    <p className="mt-2 text-gray-100 whitespace-pre-line">{acceptedPrompt}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-emerald-200">
                        {projectId && <span>Saved to Project #{projectId.slice(-6)}</span>}
                        {isPersisting && (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Syncing progress...
                            </span>
                        )}
                        {persistError && <span className="text-red-300">{persistError}</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Step1;