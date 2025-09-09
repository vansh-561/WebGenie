import React from 'react';

const About = () => {
    return (
        <section id="about" className="relative bg-gray-950 h-screen flex items-center">
            <div className="absolute top-0 left-0 right-0 h-32"></div>

            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Why Choose Us?
                    </h2>
                    <p className="text-lg text-gray-300 mb-8">
                        Experience a new way of managing your digital assets. Our platform combines
                        security, simplicity, and innovation to help you navigate the future of finance.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        <div className="p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-3">
                                Secure & Reliable
                            </h3>
                            <p className="text-gray-300">
                                Built with enterprise-grade security and advanced encryption protocols.
                            </p>
                        </div>

                        <div className="p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-3">
                                User-Focused
                            </h3>
                            <p className="text-gray-300">
                                Intuitive interface designed for both beginners and experienced users.
                            </p>
                        </div>

                        <div className="p-6 bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700">
                            <h3 className="text-xl font-semibold text-white mb-3">
                                24/7 Support
                            </h3>
                            <p className="text-gray-300">
                                Round-the-clock assistance from our dedicated support team.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
