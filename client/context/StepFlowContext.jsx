"use client";

import { createContext, useContext, useState } from "react";

const StepFlowContext = createContext(null);

export const StepFlowProvider = ({ children }) => {
    const [promptConversation, setPromptConversation] = useState([]);
    const [acceptedPrompt, setAcceptedPrompt] = useState("");
    const [promptModel, setPromptModel] = useState("gpt-4.1-mini");
    const [stackRecommendations, setStackRecommendations] = useState([]);
    const [selectedStack, setSelectedStack] = useState(null);
    const [stackModel, setStackModel] = useState("");
    const [projectBundle, setProjectBundle] = useState(null);
    const [projectRevisions, setProjectRevisions] = useState([]);
    const [repoUrl, setRepoUrl] = useState("");
    const [deploymentDetails, setDeploymentDetails] = useState(null);
    const [projectId, setProjectId] = useState(null);

    const value = {
        promptConversation,
        setPromptConversation,
        acceptedPrompt,
        setAcceptedPrompt,
        promptModel,
        setPromptModel,
        stackRecommendations,
        setStackRecommendations,
        selectedStack,
        setSelectedStack,
        stackModel,
        setStackModel,
        projectBundle,
        setProjectBundle,
        projectRevisions,
        setProjectRevisions,
        repoUrl,
        setRepoUrl,
        deploymentDetails,
        setDeploymentDetails,
        projectId,
        setProjectId,
    };

    return (
        <StepFlowContext.Provider value={value}>
            {children}
        </StepFlowContext.Provider>
    );
};

export const useStepFlow = () => {
    const context = useContext(StepFlowContext);
    if (!context) {
        throw new Error("useStepFlow must be used within a StepFlowProvider");
    }
    return context;
};

