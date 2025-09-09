'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errors = {
        Configuration: "There is a problem with the server configuration.",
        AccessDenied: "You do not have permission to sign in.",
        Verification: "The verification token has expired or has already been used.",
        Default: "An error occurred during authentication.",
    };

    const errorMessage = errors[error] || errors.Default;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Authentication Error
                    </h2>
                    <p className="mt-2 text-sm text-red-600">
                        {errorMessage}
                    </p>
                    <div className="mt-4">
                        <Link
                            href="/auth"
                            className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
} 