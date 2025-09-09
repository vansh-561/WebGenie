'use client'

import { config } from '@/utils/const';
import { useState } from 'react';
// import { useRouter } from 'next/router';
// import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const UpgradePremium = () => {
    const [loading, setLoading] = useState(false);
    // const router = useRouter();

    // const handleSubscribe = async () => {
    //     try {
    //         setLoading(true);

    //         // Create checkout session
    //         const response = await fetch('/api/create-checkout-session', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             }
    //         });

    //         const { sessionId } = await response.json();

    //         // Redirect to Stripe checkout
    //         const stripe = await stripePromise;
    //         const { error } = await stripe.redirectToCheckout({ sessionId });

    //         if (error) {
    //             throw new Error(error.message);
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         alert('Something went wrong. Please try again.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-gray-800 shadow-xl rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-8 border-b border-gray-700">
                        <h2 className="text-3xl font-bold text-center text-white">
                            Upgrade to Premium
                        </h2>
                        <p className="mt-4 text-center text-gray-400">
                            Get access to all premium features and unlock your full potential
                        </p>
                    </div>

                    {/* Features */}
                    <div className="px-6 py-8">
                        <ul className="space-y-4">
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-3 text-gray-300">Unlimited access to all features</span>
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-3 text-gray-300">Priority support</span>
                            </li>
                            <li className="flex items-center">
                                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="ml-3 text-gray-300">Advanced analytics</span>
                            </li>
                        </ul>
                    </div>

                    {/* Pricing and Button */}
                    <div className="px-6 py-8 bg-gray-900">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-white">$29.99<span className="text-lg">/month</span></p>
                            <button
                                onClick={() => {
                                    window.location.href = config.stripe.paymentLink;
                                }}
                                // onClick={handleSubscribe}
                                disabled={loading}
                                className="mt-8 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Upgrade Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradePremium;
