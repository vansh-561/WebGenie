"use client";

import React, { useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { TextGeneratorEffect } from "./ui/TextGeneratorEffect";

function Input() {
    const inputRef = useRef(null);
    const [prompt, setPrompt] = useState("");
    const [answer, setAnswer] = useState("");

    function submitData() {
        const data = inputRef.current.value;
        setPrompt(data);
        getResult(data);
    }

    const getResult = async (userPrompt) => {
        if (!userPrompt) {
            console.log("No prompt provided");
            return;
        }

        console.log("prompt: ", userPrompt);

        // const apiKey = process.env.GEMINI_API_KEY;
        const apiKey = "AIzaSyAKhcv0qqy3VDlmJoGRwYV5Y0iZiWiS-TU";
        console.log(apiKey);

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: userPrompt,
                                },
                            ],
                        },
                    ],
                }),
            });

            const result = await response.json();
            console.log("Generated response: ", result);
            const textResponse = result.candidates[0].content.parts[0].text;
            console.log(textResponse);
            setAnswer(textResponse);
        } catch (error) {
            console.error("Error generating content: ", error);
        }
    };

    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    submitData();
                }}
                onClick={() => {
                    inputRef.current.focus();
                }}
                className="relative flex w-full max-w-md items-center gap-2 rounded-full border border-white/20 bg-gradient-to-br from-white/20 to-white/5 py-1.5 pl-6 pr-1.5"
            >
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Input prompt"
                    className="w-full bg-transparent text-sm text-white placeholder-white/80 focus:outline-0"
                />

                <button
                    onClick={(e) => e.stopPropagation()}
                    type="submit"
                    className="group flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-gray-50 to-gray-400 px-4 py-3 text-sm font-medium text-gray-900 transition-transform active:scale-[0.985]"
                >
                    <span>Go</span>
                    <FiArrowRight className="-mr-4 opacity-0 transition-all group-hover:-mr-0 group-hover:opacity-100 group-active:-rotate-45" />
                </button>
            </form>

            {answer && (
                <div className="mt-4 p-4 rounded-md bg-gray-800 text-white">
                    <h3 className="font-bold mb-2">Generated Answer:</h3>
                    <TextGeneratorEffect duration={2} filter={false} words={answer}/>
                </div>
            )}
        </>
    );
}

export default Input;