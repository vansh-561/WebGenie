'use client'

import React, { useState } from 'react';

function Hero() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div id="home" className="relative bg-gradient-to-b from-gray-900 to-gray-950 h-screen flex items-center">
            <div className="absolute bottom-0 left-0 right-0 h-32"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                        <span className="block">Build Fullstack Websites</span>
                        <span className="inline">with </span>
                        <span className="inline text-8xl text-blue-200 mt-3">WebGenie</span>
                    </h1>
                    <p className="mt-6 max-w-lg mx-auto text-xl text-blue-100 sm:max-w-3xl">
                        Create stunning, full-stack websites without writing a single line of code.
                        Write a prompt, drag & drop, and deploy with our intuitive website generator.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <button
                        onClick={()=> {
                            window.location.href = '/dashboard/create'
                        }}
                         className="px-8 py-3 rounded-lg bg-white text-gray-900 font-semibold hover:bg-blue-50 transition-colors">
                            Get Started
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-8 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors"
                        >
                            Watch Demo
                        </button>
                    </div>

                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                            <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4 relative">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="absolute -top-10 -right-10 text-gray-500 hover:text-gray-700"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <div className="aspect-w-16 aspect-h-9">
                                    <iframe
                                        className="w-full h-full"
                                        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                                        title="rickroll"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        referrerpolicy="strict-origin-when-cross-origin"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Hero