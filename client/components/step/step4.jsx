"use client";

import axios from "axios";
import { AlertCircle, CheckCircle2, Github, Globe, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useStepFlow } from "@/client/context/StepFlowContext";

const slugify = (value = "", fallback = "webgenie-release") =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-{2,}/g, "-")
        .substring(0, 60) || fallback;

function Step4() {
    const {
        projectId,
        projectBundle,
        repoUrl,
        setRepoUrl,
        deploymentDetails,
        setDeploymentDetails,
    } = useStepFlow();

    const [tokenInfo, setTokenInfo] = useState({ hasToken: false, updatedAt: null });
    const [tokenInput, setTokenInput] = useState("");
    const [savingToken, setSavingToken] = useState(false);
    const [tokenMessage, setTokenMessage] = useState("");

    const [repoName, setRepoName] = useState("");
    const [rememberToken, setRememberToken] = useState(true);
    const [pushStatus, setPushStatus] = useState("idle");
    const [pushError, setPushError] = useState("");

    const [deployProvider, setDeployProvider] = useState("vercel");
    const [deploySubdomain, setDeploySubdomain] = useState("");
    const [deployStatus, setDeployStatus] = useState("idle");
    const [deployError, setDeployError] = useState("");

    const readyForRelease = Boolean(projectId && projectBundle);

    useEffect(() => {
        setRepoName((current) => current || slugify(projectBundle?.summary || projectBundle?.stackSnapshot?.label || "webgenie-project"));
        setDeploySubdomain((current) => current || slugify(projectBundle?.promptSnapshot || projectBundle?.summary || "webgenie-app", "webgenie-app"));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectBundle?.summary]);

    const fetchTokenStatus = async () => {
        try {
            const response = await axios.get("/api/github/token");
            setTokenInfo(response.data.data);
        } catch (error) {
            console.error("Failed to fetch token status", error);
        }
    };

    useEffect(() => {
        fetchTokenStatus();
    }, []);

    const handleSaveToken = async () => {
        setSavingToken(true);
        setTokenMessage("");
        try {
            const response = await axios.post("/api/github/token", { token: tokenInput.trim() || null });
            setTokenInfo(response.data.data);
            setTokenMessage(response.data.message);
            if (!tokenInput.trim()) {
                setTokenInput("");
            }
        } catch (error) {
            console.error(error);
            setTokenMessage(error?.response?.data?.message || "Unable to save token.");
        } finally {
            setSavingToken(false);
        }
    };

    const handlePush = async () => {
        if (!readyForRelease) {
            setPushError("Generate your project in Step 3 before pushing to GitHub.");
            return;
        }
        if (!tokenInfo.hasToken && !tokenInput.trim()) {
            setPushError("Provide a GitHub PAT or save one before pushing.");
            return;
        }
        setPushStatus("loading");
        setPushError("");
        try {
            const payload = {
                projectId,
                repositoryName: repoName,
                rememberToken: rememberToken && Boolean(tokenInput.trim()),
            };
            if (tokenInput.trim()) {
                payload.token = tokenInput.trim();
            }
            const response = await axios.post("/api/github/push", payload);
            const repoLink = response?.data?.data?.repoUrl;
            if (repoLink) {
                setRepoUrl(repoLink);
            }
            setPushStatus("success");
            setTimeout(() => setPushStatus("idle"), 4000);
        } catch (error) {
            console.error(error);
            setPushStatus("error");
            setPushError(error?.response?.data?.message || "Failed to push files to GitHub.");
        }
    };

    const handleDeploy = async () => {
        if (!readyForRelease) {
            setDeployError("Generate your project first.");
            return;
        }
        setDeployStatus("loading");
        setDeployError("");
        try {
            const response = await axios.post("/api/deploy", {
                projectId,
                provider: deployProvider,
                subdomain: deploySubdomain,
            });
            setDeploymentDetails(response?.data?.data || null);
            setDeployStatus("success");
            setTimeout(() => setDeployStatus("idle"), 4000);
        } catch (error) {
            console.error(error);
            setDeployStatus("error");
            setDeployError(error?.response?.data?.message || "Deployment failed.");
        }
    };

    if (!readyForRelease) {
        return (
            <div className="rounded-lg border border-dashed border-gray-600 p-6 text-sm text-gray-300">
                Finish Steps 1–3 to generate your project before pushing or deploying.
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section className="rounded-lg border border-gray-700 p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    <div>
                        <p className="text-lg font-semibold text-white">GitHub Access Token</p>
                        <p className="text-sm text-gray-400">
                            Store your PAT securely (encrypted at rest) or provide it ad-hoc for each push.
                        </p>
                    </div>
                </div>
                <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                    <div>
                        <label className="text-sm text-gray-300">Personal Access Token</label>
                        <input
                            type="password"
                            value={tokenInput}
                            onChange={(event) => setTokenInput(event.target.value)}
                            placeholder="ghp_xxxxx..."
                            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Saved token: {tokenInfo.hasToken ? `Yes (updated ${tokenInfo.updatedAt ? new Date(tokenInfo.updatedAt).toLocaleString() : "recently"})` : "No"}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                            onClick={handleSaveToken}
                            disabled={savingToken}
                        >
                            {savingToken ? "Saving..." : tokenInput ? "Save Token Securely" : "Clear Saved Token"}
                        </button>
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                            <input
                                type="checkbox"
                                checked={rememberToken}
                                onChange={(event) => setRememberToken(event.target.checked)}
                                className="rounded border-gray-600 bg-gray-900 text-indigo-500"
                            />
                            Remember this token when pushing
                        </label>
                        {tokenMessage && <p className="text-xs text-emerald-300">{tokenMessage}</p>}
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-gray-700 p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-white" />
                    <div>
                        <p className="text-lg font-semibold text-white">Push to GitHub</p>
                        <p className="text-sm text-gray-400">
                            We will create (or update) a repository with the files generated in Step 3.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <label className="text-sm text-gray-300">
                        Repository Name
                        <input
                            type="text"
                            value={repoName}
                            onChange={(event) => setRepoName(slugify(event.target.value || ""))}
                            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
                        />
                    </label>
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
                            onClick={handlePush}
                            disabled={pushStatus === "loading"}
                        >
                            {pushStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                            Push to GitHub
                        </button>
                        {pushStatus === "success" && (
                            <p className="text-xs text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Repository updated
                            </p>
                        )}
                        {pushStatus === "error" && (
                            <p className="text-xs text-red-300 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" /> {pushError}
                            </p>
                        )}
                    </div>
                </div>

                {repoUrl ? (
                    <div className="rounded-md border border-gray-700 bg-gray-900/40 p-3 text-sm text-gray-200">
                        Latest push:{" "}
                        <a href={repoUrl} target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                            {repoUrl}
                        </a>
                    </div>
                ) : (
                    <p className="text-xs text-gray-500">No repository has been created yet.</p>
                )}
            </section>

            <section className="rounded-lg border border-gray-700 p-5 space-y-4">
                <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-blue-300" />
                    <div>
                        <p className="text-lg font-semibold text-white">Deploy to WebGenie</p>
                        <p className="text-sm text-gray-400">
                            We&rsquo;ll provision a subdomain on your configured deployment provider.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-sm text-gray-300">
                        Provider
                        <select
                            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
                            value={deployProvider}
                            onChange={(event) => setDeployProvider(event.target.value)}
                        >
                            <option value="vercel">Vercel</option>
                            <option value="netlify">Netlify</option>
                            <option value="cloudflare">Cloudflare Pages</option>
                        </select>
                    </label>
                    <label className="text-sm text-gray-300 md:col-span-2">
                        Subdomain
                        <input
                            type="text"
                            value={deploySubdomain}
                            onChange={(event) => setDeploySubdomain(slugify(event.target.value || ""))}
                            className="mt-1 w-full rounded-md border border-gray-600 bg-gray-900 p-2 text-sm text-gray-100 focus:border-indigo-500 focus:outline-none"
                        />
                    </label>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                        onClick={handleDeploy}
                        disabled={deployStatus === "loading"}
                    >
                        {deployStatus === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
                        Deploy
                    </button>
                    {deployStatus === "success" && (
                        <p className="text-xs text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Deployment queued
                        </p>
                    )}
                    {deployStatus === "error" && (
                        <p className="text-xs text-red-300 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {deployError}
                        </p>
                    )}
                </div>

                {deploymentDetails ? (
                    <div className="rounded-md border border-gray-700 bg-gray-900/40 p-4 space-y-3 text-sm text-gray-200">
                        <div>
                            <p className="font-semibold text-white">Live URL</p>
                            <a href={deploymentDetails.url} target="_blank" rel="noreferrer" className="text-indigo-400 underline">
                                {deploymentDetails.url}
                            </a>
                        </div>
                        <div>
                            <p className="font-semibold text-white">Recent Logs</p>
                            <ul className="mt-2 space-y-1 text-xs text-gray-300">
                                {deploymentDetails.logs?.map((log) => (
                                    <li key={`${log.step}-${log.status}`} className="flex items-center gap-2">
                                        <span className={log.status === "success" ? "text-emerald-300" : "text-yellow-300"}>
                                            {log.step}
                                        </span>
                                        <span className="text-gray-500">—</span>
                                        <span>{log.message}</span>
                                    </li>
                                )) || <li>No logs available.</li>}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-gray-500">No deployment has been created yet.</p>
                )}
            </section>
        </div>
    );
}

export default Step4;