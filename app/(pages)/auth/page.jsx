'use client'

import { signIn } from 'next-auth/react'
import { FaGithub } from 'react-icons/fa'
import { useState } from 'react'

function Auth() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSignIn = async () => {
        try {
            setIsLoading(true)
            await signIn('github', {
                callbackUrl: '/dashboard',
                redirect: false,
            })
        } catch (error) {
            console.error('Authentication error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className='flex justify-center items-center flex-col gap-10'>
            <div className='text-5xl mt-10'>Login Needed First</div>
            <button
                onClick={handleSignIn}
                disabled={isLoading}
                className='flex items-center gap-2 bg-[#24292F] text-white px-6 py-3 rounded-md hover:bg-[#24292F]/90 transition-colors disabled:opacity-50'
            >
                <FaGithub className="text-2xl" />
                {isLoading ? 'Signing in...' : 'Sign in with GitHub'}
            </button>
        </div>
    )
}

export default Auth