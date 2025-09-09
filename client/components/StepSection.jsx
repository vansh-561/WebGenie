"use client"

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Step1 from "./step/step1";
import Step2 from "./step/step2";
import Step3 from "./step/step3";
import Step4 from "./step/step4";
import { StepFlowProvider, useStepFlow } from "@/client/context/StepFlowContext";

const StepSectionInner = () => {
    const [stepsComplete, setStepsComplete] = useState(0);
    const numSteps = 4;
    const { acceptedPrompt, selectedStack } = useStepFlow();

    const handleSetStep = (num) => {
        if (
            (stepsComplete === 0 && num === -1) ||
            (stepsComplete === numSteps && num === 1)
        ) {
            return;
        }

        setStepsComplete((pv) => pv + num);
    };

    const isNextDisabled =
        stepsComplete === numSteps ||
        (stepsComplete === 0 && !acceptedPrompt?.trim()) ||
        (stepsComplete === 1 && !selectedStack);

    return (
        <div className="p-8 bg-gray-800 shadow-lg rounded-md w-full mx-auto z-0">
            <Steps numSteps={numSteps} stepsComplete={stepsComplete} />
            <div className="p-2 my-6 h-full bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg">
                {renderStepContent(stepsComplete)}
            </div>
            <div className="flex items-center justify-end gap-2">
                {stepsComplete !== 0 && (
                    <button
                        className="px-4 py-1 rounded hover:bg-gray-700 text-white"
                        onClick={() => handleSetStep(-1)}
                    >
                        Prev
                    </button>
                )}
                <button
                    className="px-4 py-1 rounded bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isNextDisabled}
                    onClick={() => handleSetStep(1)}
                >
                    {stepsComplete === numSteps ? "Start Creating" : "Next"}
                </button>
            </div>
        </div>
    );
};

const StepSection = () => (
    <StepFlowProvider>
        <StepSectionInner />
    </StepFlowProvider>
);

const Steps = ({ numSteps, stepsComplete }) => {
    const stepArray = Array.from(Array(numSteps).keys());

    return (
        <div className="flex items-center justify-between gap-3">
            {stepArray.map((num) => {
                const stepNum = num + 1;
                const isActive = stepNum <= stepsComplete;
                return (
                    <React.Fragment key={stepNum}>
                        <Step num={stepNum} isActive={isActive} />
                        {stepNum !== stepArray.length && (
                            <div className="w-full h-1 rounded-full bg-gray-600 relative">
                                <motion.div
                                    className="absolute top-0 bottom-0 left-0 bg-indigo-500 rounded-full"
                                    animate={{ width: isActive ? "100%" : 0 }}
                                    transition={{ ease: "easeIn", duration: 0.3 }}
                                />

                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

const Step = ({ num, isActive }) => {
    return (
        <div className="relative">
            <div
                className={`w-10 h-10 flex items-center justify-center shrink-0 border-2 rounded-full font-semibold text-sm relative z-10 transition-colors duration-300 ${isActive
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-gray-300 text-gray-300"
                    }`}
            >
                <AnimatePresence mode="wait">
                    {isActive ? (
                        <motion.svg
                            key="icon-marker-check"
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="0"
                            viewBox="0 0 16 16"
                            height="1.6em"
                            width="1.6em"
                            xmlns="http://www.w3.org/2000/svg"
                            initial={{ rotate: 180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -180, opacity: 0 }}
                            transition={{ duration: 0.125 }}
                        >
                            <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"></path>
                        </motion.svg>
                    ) : (
                        <motion.span
                            key="icon-marker-num"
                            initial={{ rotate: 180, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -180, opacity: 0 }}
                            transition={{ duration: 0.125 }}
                        >
                            {num}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
            {isActive && (
                <div className="absolute z-0 -inset-1.5 bg-indigo-100 rounded-full animate-pulse" />
            )}
        </div>
    );
};

const renderStepContent = (step) => {
    switch (step) {
        case 0:
            return <Step1/>;
        case 1:
            return <Step2/>;
        case 2:
            return <Step3/>;
        case 3:
            return <Step4/>;
        default:
            return <div>Invalid Step</div>;
    }
};

export default StepSection;