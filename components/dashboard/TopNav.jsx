'use client';

import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from "next/link";

export default function TopNav({ user }) {
    const pathname = usePathname();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // console.log(user);

    const getActivePageTitle = (path) => {
        const title = path.split('/').pop().charAt(0).toUpperCase() +
            path.split('/').pop().slice(1);
        return title === 'Dashboard' ? 'Home' : title;
    };

    return (
        <header className="bg-gray-900">
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-white">{pathname && getActivePageTitle(pathname)}</h2>
                </div>

                <div className="flex items-center gap-4 relative">
                    <span className="text-gray-300 mr-10">{user?.name}</span>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center space-x-2"
                        >
                            {user?.image && (
                                <Image
                                    src={user.image}
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                />
                            )}
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-10">
                                <div className="px-4 py-2 border-b">
                                    <p className="text-sm font-medium text-white">{user?.username}</p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                                <Link href="/dashboard/token-store" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    Token Store
                                </Link>
                                {!user?.premium && (
                                    <Link href="/dashboard/upgrade" className="block px-4 py-2 text-sm text-purple-600 hover:bg-gray-100">
                                        Upgrade to Premium
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
} 