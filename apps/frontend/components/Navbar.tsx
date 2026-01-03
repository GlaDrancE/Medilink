"use client"
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton
} from '@clerk/nextjs'

import { ThemeToggle } from '@/components/theme-toggle';
import React, { useEffect, useState } from 'react'
import { Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {}

const Navbar = (props: Props) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);



    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
            ? 'backdrop-blur-md bg-white/10 dark:bg-white/10 light:bg-white/80 border-b border-white/20 dark:border-white/20 light:border-gray-200/50'
            : 'bg-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white dark:text-white light:text-gray-900 ml-3">MedConnect</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="flex items-center space-x-8">
                            <a href="#features" className="text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors backdrop-blur-sm rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/50">
                                Features
                            </a>
                            <a href="#how-it-works" className="text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors backdrop-blur-sm rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/50">
                                How It Works
                            </a>
                            <a href="#benefits" className="text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors backdrop-blur-sm rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/50">
                                Benefits
                            </a>

                            <SignedOut>
                                <SignInButton>
                                    <button className='text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors backdrop-blur-sm rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/50 cursor-pointer'>Sign In</button>
                                </SignInButton>
                                <SignUpButton>
                                    <Button variant='primary'>
                                        Get Started
                                    </Button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                        </div>
                        <ThemeToggle />
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-white dark:text-white light:text-gray-900 hover:text-blue-400 transition-colors p-2 rounded-lg backdrop-blur-sm bg-white/10 dark:bg-white/10 light:bg-gray-100/50"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden backdrop-blur-md bg-white/10 dark:bg-white/10 light:bg-white/90 border-t border-white/20 dark:border-white/20 light:border-gray-200/50">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <a href="#features" className="block px-3 py-2 text-base font-medium text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/50">
                            Features
                        </a>
                        <a href="#how-it-works" className="block px-3 py-2 text-base font-medium text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/50">
                            How It Works
                        </a>
                        <a href="#benefits" className="block px-3 py-2 text-base font-medium text-white/80 dark:text-white/80 light:text-gray-700 hover:text-white dark:hover:text-white light:hover:text-gray-900 rounded-lg hover:bg-white/10 dark:hover:bg-white/10 light:hover:bg-gray-100/50">
                            Benefits
                        </a>
                        <button className="w-full mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all">
                            Get Started
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}
export default Navbar