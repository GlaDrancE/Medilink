"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return null
    }

    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="relative p-3 rounded-xl backdrop-blur-md bg-white/10 dark:bg-white/10 border border-white/20 hover:bg-white/20 dark:hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-lg group"
            aria-label="Toggle theme"
        >
            <div className="relative w-6 h-6">
                <Sun className={`absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-300 ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'
                    }`} />
                <Moon className={`absolute inset-0 w-6 h-6 text-blue-400 transition-all duration-300 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                    }`} />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
    )
}