'use client'

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function SideNav() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const navItems = [
        { href: '/dashboard', label: 'Home' },
        { href: '/dashboard/create', label: 'Create' },
        { href: '/dashboard/projects', label: 'Projects' },
        ...(!session?.user?.premium ? [{ href: '/dashboard/upgrade', label: 'Upgrade' }] : []),
    ];


    return (
        <nav className="w-[15vw] bg-gray-900 h-full flex flex-col">
            <div className="p-4">
                <h1 className="text-2xl font-bold text-white">WebGenie</h1>
            </div>
            <div className="py-4 flex-grow">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2 text-gray-300 hover:bg-gray-800 ${pathname === item.href ? 'bg-gray-800' : ''
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>
            <div className="fixed bottom-0 w-64 p-4">
                <button
                    onClick={() => {
                        signOut({
                            callbackUrl: '/'
                        })
                    }}
                    className="w-full px-4 py-2 text-gray-300 hover:bg-gray-800 text-left"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
} 