"use client";

import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { AlertCircle, Code2, Download, History, Loader2, Play, RefreshCcw, Square, TerminalSquare } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStepFlow } from "@/client/context/StepFlowContext";

let webContainerBootPromise = null;

const bootWebContainer = async () => {
    if (webContainerBootPromise) {
        return webContainerBootPromise;
    }
    const { WebContainer } = await import("@webcontainer/api");
    webContainerBootPromise = WebContainer.boot();
    try {
        const instance = await webContainerBootPromise;
        return instance;
    } catch (error) {
        webContainerBootPromise = null;
        throw error;
    }
};

const flattenTree = (tree = []) => {
    const items = [];
    const traverse = (nodes, depth = 0) => {
        nodes.forEach((node) => {
            items.push({
                ...node,
                depth,
            });
            if (node.children) {
                traverse(node.children, depth + 1);
            }
        });
    };
    traverse(tree, 0);
    return items;
};

function Step3() {
    const {
        acceptedPrompt,
        selectedStack,
        projectBundle,
        setProjectBundle,
        projectRevisions,
        setProjectRevisions,
        projectId,
    } = useStepFlow();

    const [status, setStatus] = useState("idle");
    const [error, setError] = useState("");
    const [selectedFilePath, setSelectedFilePath] = useState("");
    const [showInstructions, setShowInstructions] = useState(true);
    const [wcStatus, setWcStatus] = useState("idle");
    const [previewUrl, setPreviewUrl] = useState("");
    const [terminalLogs, setTerminalLogs] = useState([]);
    const [webContainerInstance, setWebContainerInstance] = useState(null);
    const logRef = useRef(null);

    const files = projectBundle?.files || [];
    const instructionsList = Array.isArray(projectBundle?.instructions)
        ? projectBundle.instructions
        : projectBundle?.instructions
            ? [projectBundle.instructions]
            : [];
    const commandList = Array.isArray(projectBundle?.commands)
        ? projectBundle.commands
        : projectBundle?.commands
            ? [projectBundle.commands]
            : [];
    const fileTree = useMemo(() => {
        if (projectBundle?.fileTree?.length) {
            return flattenTree(projectBundle.fileTree);
        }
        const fallbackTree = files.map((file) => ({
            type: "file",
            name: file.path,
            path: file.path,
            depth: 0,
        }));
        return fallbackTree;
    }, [projectBundle, files]);

    const selectedFile = files.find((file) => file.path === selectedFilePath) || files[0];

    useEffect(() => {
        if (!selectedFilePath && files.length > 0) {
            setSelectedFilePath(files[0].path);
        }
    }, [files, selectedFilePath]);

    const readyToGenerate = Boolean(projectId && acceptedPrompt && selectedStack);

    const triggerGeneration = async (regenerate = false) => {
        if (!readyToGenerate || status === "loading") return;
        setStatus("loading");
        setError("");
        try {
            const response = await axios.post("/api/projects/init", {
                projectId,
                regenerate,
            });
            const payload = response?.data?.data;
            setProjectBundle(payload?.projectBundle || null);
            setProjectRevisions(payload?.revisions || []);
            if (payload?.projectBundle?.files?.length) {
                setSelectedFilePath(payload.projectBundle.files[0].path);
            }
        } catch (err) {
            console.error(err);
            setError(err?.response?.data?.message || "Project generation failed. Please try again.");
        } finally {
            setStatus("idle");
        }
    };

    const appendLog = (line) => {
        setTerminalLogs((prev) => [...prev, line]);
    };

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [terminalLogs]);

    const destroyWebContainer = async () => {
        if (webContainerInstance) {
            try {
                await webContainerInstance.teardown();
            } catch (err) {
                console.error("Failed to teardown WebContainer", err);
            }
        }
        setWebContainerInstance(null);
        setPreviewUrl("");
        setTerminalLogs([]);
        setWcStatus("idle");
    };

    useEffect(() => {
        return () => {
            destroyWebContainer();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (webContainerInstance) {
            destroyWebContainer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectBundle?.revision]);

    const buildFsTree = (filesToMount) => {
        const root = {};
        filesToMount.forEach(({ path, contents }) => {
            if (!path) return;
            const segments = path.split("/").filter(Boolean);
            let current = root;
            segments.forEach((segment, index) => {
                const isFile = index === segments.length - 1;
                if (isFile) {
                    current[segment] = {
                        file: {
                            contents: contents || "",
                        },
                    };
                } else {
                    if (!current[segment]) {
                        current[segment] = { directory: {} };
                    }
                    current = current[segment].directory;
                }
            });
        });
        return root;
    };

    const launchWebContainer = async () => {
        if (!projectBundle?.files?.length) {
            setError("Generate project files before launching the preview.");
            return;
        }
        setWcStatus("starting");
        setTerminalLogs([]);
        setPreviewUrl("");
        try {
            await destroyWebContainer();
            const instance = await bootWebContainer();
            setWebContainerInstance(instance);

            instance.on("server-ready", (port, url) => {
                appendLog(`Server ready on port ${port}`);
                setPreviewUrl(url);
            });

            appendLog("Mounting project files...");
            await instance.mount(buildFsTree(projectBundle.files));

            const runCommand = async (command, args = []) => {
                const process = await instance.spawn(command, args);
                const reader = process.output.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    appendLog(decoder.decode(value));
                }
                const exitCode = await process.exit;
                return exitCode;
            };

            appendLog("Running npm install...");
            const installExitCode = await runCommand("npm", ["install"]);
            if (installExitCode !== 0) {
                appendLog("npm install failed.");
                setWcStatus("error");
                return;
            }

            appendLog("Starting npm run dev...");
            setWcStatus("starting-server");
            const startProcess = await instance.spawn("npm", ["run", "dev"]);
            const reader = startProcess.output.getReader();
            const decoder = new TextDecoder();
            (async () => {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    appendLog(decoder.decode(value));
                }
            })();

            setWcStatus("running");
        } catch (err) {
            console.error("WebContainer launch failed:", err);
            appendLog(`WebContainer error: ${err.message}`);
            setWcStatus("error");
        }
    };

    const downloadZip = async () => {
        if (!projectBundle?.files?.length) return;
        const zip = new JSZip();
        projectBundle.files.forEach((file) => {
            zip.file(file.path, file.contents || "");
        });
        const blob = await zip.generateAsync({ type: "blob" });
        const filename = `${projectBundle.stackSnapshot?.label || "webgenie-project"}.zip`;
        saveAs(blob, filename);
    };

    if (!acceptedPrompt || !selectedStack) {
        return (
            <div className="rounded-lg border border-dashed border-gray-600 p-6 text-gray-300">
                Finalize your prompt and choose a stack before generating code.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                    onClick={() => triggerGeneration(false)}
                    disabled={!readyToGenerate || status === "loading"}
                >
                    {status === "loading" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Code2 className="h-4 w-4" />
                    )}
                    {projectBundle ? "Generate New Revision" : "Generate Project"}
                </button>
                {projectBundle && (
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-md border border-gray-600 px-4 py-2 text-gray-100 disabled:opacity-50"
                        onClick={() => triggerGeneration(true)}
                        disabled={!readyToGenerate || status === "loading"}
                    >
                        <RefreshCcw className="h-4 w-4" />
                        Regenerate
                    </button>
                )}
                <div className="text-xs text-gray-400">
                    Prompt + stack snapshots are stored with every revision so you can safely iterate.
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-100 disabled:opacity-50"
                    onClick={downloadZip}
                    disabled={!projectBundle?.files?.length}
                >
                    <Download className="h-4 w-4" />
                    Download Project Zip
                </button>
                <button
                    type="button"
                    className="flex items-center gap-2 rounded-md border border-gray-600 px-4 py-2 text-sm text-gray-100 disabled:opacity-50"
                    onClick={wcStatus === "running" ? destroyWebContainer : launchWebContainer}
                    disabled={wcStatus === "starting" || wcStatus === "starting-server"}
                >
                    {wcStatus === "running" ? (
                        <>
                            <Square className="h-4 w-4" />
                            Stop Live Preview
                        </>
                    ) : (
                        <>
                            {wcStatus === "starting" || wcStatus === "starting-server" ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                            {wcStatus === "starting"
                                ? "Booting WebContainer..."
                                : wcStatus === "starting-server"
                                    ? "Starting Server..."
                                    : "Run in WebContainer"}
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-md border border-red-400/50 bg-red-400/10 px-3 py-2 text-sm text-red-200">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                </div>
            )}

            {status === "loading" && (
                <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-900/80 px-4 py-3 text-sm text-gray-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating project resources...
                </div>
            )}

            {projectBundle ? (
                <>
                    <div className="grid gap-4 lg:grid-cols-[300px,1fr]">
                        <div className="rounded-lg border border-gray-700 bg-gray-900/60">
                            <div className="border-b border-gray-800 px-4 py-3 text-sm font-semibold text-gray-200">
                                File Explorer
                            </div>
                            <div className="max-h-[420px] overflow-y-auto">
                                {fileTree.map((node) => (
                                    <button
                                        key={node.path}
                                        type="button"
                                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                                            node.type === "file" ? "pl-6" : "pl-4"
                                        } ${selectedFilePath === node.path ? "bg-gray-800 text-white" : "text-gray-300 hover:bg-gray-800/60"}`}
                                        style={{ paddingLeft: `${node.depth * 16 + 12}px` }}
                                        onClick={() => node.type === "file" && setSelectedFilePath(node.path)}
                                        disabled={node.type !== "file"}
                                    >
                                        {node.type === "file" ? "📄" : "📁"}
                                        <span>{node.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-700 bg-gray-950/60">
                            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
                                <div>
                                    <p className="text-sm font-semibold text-gray-100">{selectedFile?.path}</p>
                                    <p className="text-xs text-gray-500">{selectedFile?.purpose}</p>
                                </div>
                                <span className="text-xs text-gray-500">
                                    Revision #{projectBundle.revision} · {projectBundle.model}
                                </span>
                            </div>
                            <pre className="max-h-[420px] overflow-auto bg-transparent p-4 text-sm text-gray-100">
                                {selectedFile?.contents || "// File contents not provided"}
                            </pre>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-white">Build Instructions</h4>
                                <button
                                    type="button"
                                    className="text-sm text-indigo-400"
                                    onClick={() => setShowInstructions((prev) => !prev)}
                                >
                                    {showInstructions ? "Hide" : "Show"}
                                </button>
                            </div>
                            {showInstructions && (
                                <ol className="mt-3 space-y-2 text-sm text-gray-200">
                                    {instructionsList.length ? (
                                        instructionsList.map((step, index) => (
                                            <li key={`instruction-${index}`} className="flex gap-2">
                                                <span className="text-gray-500">{index + 1}.</span>
                                                <span>{step}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-400">No instructions provided by the model.</li>
                                    )}
                                </ol>
                            )}
                        </div>

                        <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4">
                            <h4 className="flex items-center gap-2 font-semibold text-white">
                                <TerminalSquare className="h-4 w-4" />
                                Project Commands / Preview
                            </h4>
                            <div className="mt-3 space-y-3 text-sm text-gray-200">
                                {commandList.length ? (
                                    commandList.map((command) => (
                                        <code
                                            key={command}
                                            className="block rounded-md bg-gray-950/70 px-3 py-2 text-xs text-indigo-200"
                                        >
                                            {command}
                                        </code>
                                    ))
                                ) : (
                                    <p className="text-gray-400">No commands provided. Use npm install && npm run dev.</p>
                                )}
                            </div>
                            <div className="mt-4 rounded-md border border-gray-800 bg-gray-950/50 p-3 text-xs text-gray-400">
                                Use the WebContainer controls above to boot an in-browser preview or run these commands locally.
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4 lg:col-span-2">
                        <h4 className="font-semibold text-white mb-3">Live Preview (WebContainer)</h4>
                        {previewUrl ? (
                            <iframe
                                title="webcontainer-preview"
                                src={previewUrl}
                                className="h-64 w-full rounded-md border border-gray-800"
                            />
                        ) : (
                            <p className="text-sm text-gray-400">
                                {wcStatus === "running"
                                    ? "Waiting for preview URL..."
                                    : "Start the WebContainer to view a live preview."}
                            </p>
                        )}
                        <div className="mt-4">
                            <h5 className="flex items-center gap-2 text-sm font-semibold text-white">
                                <TerminalSquare className="h-4 w-4" />
                                Terminal Logs
                            </h5>
                            <div
                                ref={logRef}
                                className="mt-2 h-48 overflow-auto rounded-md border border-gray-800 bg-black/60 p-2 text-xs text-gray-200"
                            >
                                {terminalLogs.length === 0 ? (
                                    <p className="text-gray-500">No logs yet.</p>
                                ) : (
                                    terminalLogs.map((line, idx) => (
                                        <pre key={`${idx}-${line.slice(0, 24)}`} className="whitespace-pre-wrap">
                                            {line}
                                        </pre>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-700 bg-gray-900/40 p-4">
                        <h4 className="flex items-center gap-2 font-semibold text-white">
                            <History className="h-4 w-4" />
                            Revision History
                        </h4>
                        {projectRevisions?.length ? (
                            <div className="mt-3 divide-y divide-gray-800 text-sm text-gray-200">
                                {projectRevisions.map((revision) => (
                                    <div key={revision.revision} className="flex flex-col gap-1 py-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <p className="font-medium text-white">Revision #{revision.revision}</p>
                                            <p className="text-xs text-gray-400">{revision.summary || "No summary"}</p>
                                        </div>
                                        <div className="text-xs text-gray-400 md:text-right">
                                            <p>{new Date(revision.generatedAt).toLocaleString()}</p>
                                            <p>Model: {revision.model}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-gray-400">No previous revisions yet.</p>
                        )}
                    </div>
                </>
            ) : (
                <div className="rounded-lg border border-dashed border-gray-700 p-6 text-center text-gray-300">
                    Click “Generate Project” to create the initial scaffold using your prompt and chosen stack.
                </div>
            )}
        </div>
    );
}

export default Step3;
