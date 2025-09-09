"use client";

import axios from "axios";
import { AlertCircle, CheckCircle2, Loader2, RefreshCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStepFlow } from "@/client/context/StepFlowContext";

const FIELD_LABELS = {
    frontend: "Frontend",
    backend: "Backend",
    database: "Database",
    deployment: "Deployment",
    uiLibrary: "UI Library",
    auth: "Auth",
    orm: "ORM / Data Layer",
};

const MANUAL_OPTIONS = {
    frontend: ["Next.js", "React", "SvelteKit", "Remix"],
    backend: ["Node.js + Express", "Next.js API Routes", "NestJS", "Django"],
    database: ["PostgreSQL", "MongoDB", "PlanetScale MySQL", "Supabase"],
    deployment: ["Vercel", "Netlify", "AWS Amplify", "Render"],
    uiLibrary: ["Tailwind CSS", "Chakra UI", "shadcn/ui", "Material UI"],
    auth: ["Clerk", "Auth0", "NextAuth", "Supabase Auth"],
    orm: ["Prisma", "Drizzle", "TypeORM", "Mongoose"],
};

const defaultManualStack = Object.keys(FIELD_LABELS).reduce((acc, key) => {
    acc[key] = "";
    return acc;
}, {});

function Step2() {
    const {
        acceptedPrompt,
        stackRecommendations,
        setStackRecommendations,
        selectedStack,
        setSelectedStack,
        stackModel,
        setStackModel,
        projectId,
        setProjectId,
    } = useStepFlow();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [manualStack, setManualStack] = useState(defaultManualStack);
    const [persistStatus, setPersistStatus] = useState("idle");
    const [persistError, setPersistError] = useState("");

    const hasPrompt = Boolean(acceptedPrompt?.trim());

    const fetchRecommendations = async () => {
        if (!hasPrompt) return;
        setIsLoading(true);
        setError("");
        try {
            const response = await axios.post("/api/stack", {
                prompt: acceptedPrompt,
            });
            const payload = response?.data?.data;
            setStackRecommendations(payload?.recommendations || []);
            setStackModel(payload?.model || "gpt-4.1-mini");
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Could not fetch recommendations. Try again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hasPrompt && stackRecommendations.length === 0 && !isLoading) {
            fetchRecommendations();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasPrompt]);

    const handleManualChange = (field, value) => {
        setManualStack((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const persistStackSelection = async (stackData, recommendationsSnapshot) => {
        if (!stackData) return;
        setPersistStatus("saving");
        setPersistError("");

        try {
            const response = await axios.post("/api/projects/progress", {
                projectId,
                data: {
                    stackRecommendations: recommendationsSnapshot,
                    selectedStack: stackData,
                },
            });

            if (!projectId) {
                const savedId = response?.data?.data?.projectId;
                if (savedId) {
                    setProjectId(savedId);
                }
            }

            setPersistStatus("saved");
            setTimeout(() => setPersistStatus("idle"), 2500);
        } catch (err) {
            console.error(err);
            setPersistStatus("error");
            setPersistError(err?.response?.data?.message || "Failed to save stack selection.");
        }
    };

    const applyRecommendation = async (rec) => {
        setSelectedStack(rec);
        await persistStackSelection(rec, stackRecommendations);
    };

    const applyManualStack = async () => {
        const cleaned = Object.fromEntries(
            Object.entries(manualStack).filter(([_, value]) => value && value.trim()),
        );
        if (Object.keys(cleaned).length === 0) {
            setPersistError("Please pick at least one technology before saving.");
            setPersistStatus("error");
            return;
        }

        const manualSelection = {
            id: "manual-stack",
            label: "Custom Selection",
            summary: "Manually curated stack",
            ...cleaned,
        };

        setSelectedStack(manualSelection);
        await persistStackSelection(manualSelection, stackRecommendations);
    };

    const selectedId = selectedStack?.id;

    const statusMessage = useMemo(() => {
        if (persistStatus === "saved") {
            return "Stack saved to your project.";
        }
        if (persistStatus === "saving") {
            return "Saving stack selection...";
        }
        if (persistStatus === "error") {
            return persistError;
        }
        return "";
    }, [persistStatus, persistError]);

    if (!hasPrompt) {
        return (
            <div className="rounded-lg border border-dashed border-gray-600 p-6 text-sm text-gray-300">
                Finalize your prompt in Step 1 to unlock stack recommendations.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-2xl font-bold uppercase">Tech Stack</div>
                        <p className="text-sm text-gray-300">
                            Generated from your finalized prompt. You can select any preset or craft a custom combo.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-md border border-gray-500 px-4 py-2 text-sm text-gray-100 disabled:opacity-50"
                        onClick={fetchRecommendations}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                        Refresh Suggestions
                    </button>
                </div>
                {stackModel && <p className="mt-1 text-xs text-gray-500">Generated via {stackModel}</p>}
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-md border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
                {stackRecommendations.map((rec) => (
                    <button
                        type="button"
                        key={rec.id}
                        className={`text-left rounded-lg border p-4 transition-colors ${
                            selectedId === rec.id ? "border-indigo-500 bg-indigo-500/10" : "border-gray-600 hover:border-gray-400"
                        }`}
                        onClick={() => applyRecommendation(rec)}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-white">{rec.label}</h3>
                            {selectedId === rec.id && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                        </div>
                        <p className="mt-1 text-sm text-gray-300">{rec.summary}</p>
                        <div className="mt-3 space-y-1 text-sm text-gray-200">
                            {Object.keys(FIELD_LABELS).map((field) =>
                                rec[field] ? (
                                    <div key={field} className="flex justify-between gap-2">
                                        <span className="text-gray-400">{FIELD_LABELS[field]}</span>
                                        <span className="text-right font-medium text-gray-100">{rec[field]}</span>
                                    </div>
                                ) : null,
                            )}
                        </div>
                        {rec.extras && rec.extras.length > 0 && (
                            <p className="mt-2 text-xs text-gray-400">Extras: {rec.extras.join(", ")}</p>
                        )}
                        <p className="mt-3 text-xs text-gray-400">Fit Score: {(rec.fitScore ?? 0).toFixed(2)}</p>
                        <p className="mt-2 text-xs text-gray-400">{rec.rationale}</p>
                    </button>
                ))}
            </div>

            <div className="grid gap-6 rounded-lg border border-gray-700 p-4 lg:grid-cols-2">
                <div>
                    <h4 className="text-lg font-semibold text-white">Custom Stack Builder</h4>
                    <p className="text-sm text-gray-400">Mix & match technologies if none of the presets fit.</p>
                    <div className="mt-4 grid grid-cols-1 gap-3">
                        {Object.entries(FIELD_LABELS).map(([field, label]) => (
                            <label key={field} className="text-sm text-gray-300">
                                {label}
                                <select
                                    className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
                                    value={manualStack[field]}
                                    onChange={(event) => handleManualChange(field, event.target.value)}
                                >
                                    <option value="">Select {label}</option>
                                    {MANUAL_OPTIONS[field].map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ))}
                    </div>
                    <button
                        type="button"
                        className="mt-4 rounded-md bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
                        onClick={applyManualStack}
                    >
                        Use Manual Stack
                    </button>
                </div>

                <div className="rounded-lg border border-gray-700 p-4">
                    <h4 className="text-lg font-semibold text-white">Currently Selected Stack</h4>
                    {selectedStack ? (
                        <div className="mt-3 space-y-2 text-sm text-gray-200">
                            <p className="text-base font-semibold text-white">{selectedStack.label}</p>
                            <p className="text-xs text-gray-400">{selectedStack.summary}</p>
                            {Object.keys(FIELD_LABELS).map((field) =>
                                selectedStack[field] ? (
                                    <div key={field} className="flex justify-between gap-2">
                                        <span className="text-gray-400">{FIELD_LABELS[field]}</span>
                                        <span className="text-right font-medium text-gray-100">
                                            {selectedStack[field]}
                                        </span>
                                    </div>
                                ) : null,
                            )}
                        </div>
                    ) : (
                        <p className="mt-2 text-sm text-gray-400">
                            Pick one of the recommended stacks or craft your own to continue.
                        </p>
                    )}
                    {statusMessage && (
                        <p className={`mt-3 text-xs ${persistStatus === "error" ? "text-red-300" : "text-emerald-300"}`}>
                            {statusMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Step2;

