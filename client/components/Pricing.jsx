const Pricing = () => {
    return (
        <section id="pricing" className="relative -mt-screen bg-gray-950 min-h-screen flex items-center">
            <div className="absolute top-0 left-0 right-0 h-96"></div>

            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-4xl font-bold text-white text-center mb-12">
                        Choose Your Plan
                    </h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Basic Plan */}
                        <div className="relative p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 hover:border-blue-500 transition-all duration-300">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                            <div className="relative">
                                <h3 className="text-xl font-semibold text-white mb-4">Basic</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-white">Free</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Basic Analytics
                                    </li>
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Up to 5 Projects
                                    </li>
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Basic Support
                                    </li>
                                </ul>
                                <button className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200">
                                    Get Started
                                </button>
                            </div>
                        </div>

                        {/* Pro Plan */}
                        <div className="relative p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border-2 border-blue-500 hover:border-blue-400 transition-all duration-300">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"></div>
                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Most Popular
                                </span>
                            </div>
                            <div className="relative">
                                <h3 className="text-xl font-semibold text-white mb-4">Pro</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-white">₹500</span>
                                    <span className="text-gray-400">/month</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Advanced Analytics
                                    </li>
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Unlimited Projects
                                    </li>
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Priority Support
                                    </li>
                                </ul>
                                <button className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200">
                                    Get Started
                                </button>
                            </div>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="relative p-8 rounded-2xl bg-gray-800/30 backdrop-blur-sm border border-gray-700 hover:border-blue-500 transition-all duration-300">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
                            <div className="relative">
                                <h3 className="text-xl font-semibold text-white mb-4">Enterprise</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-white">₹1000</span>
                                    <span className="text-gray-400">/month</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Custom Analytics
                                    </li>
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        Unlimited Everything
                                    </li>
                                    <li className="flex items-center text-gray-300">
                                        <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        24/7 Dedicated Support
                                    </li>
                                </ul>
                                <button className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Pricing;
