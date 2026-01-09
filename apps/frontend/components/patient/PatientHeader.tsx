"use client"
import { Patient } from '@/types'
import { User, Activity } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { useConnectionStatus } from '@/hooks/useConnectionStatus'


const PatientHeader = ({ patient }: { patient: Patient }) => {
    const connectionStatus = useConnectionStatus()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch by only showing dynamic content after mount
    useEffect(() => {
        setMounted(true)
    }, [])


    return (
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-lg sticky top-0 z-50 backdrop-blur-md">
            {/* Connection Status Bar */}
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                            <User className="w-7 h-7 text-white" strokeWidth={2} />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">✓</span>
                        </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-white mb-1 drop-shadow-md">
                            Welcome, {patient.name || 'Patient'}
                        </h1>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                <span className="text-xs font-semibold text-white/70">Age</span>
                                <span className="text-xs font-bold text-white">{patient.age || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                <span className="text-xs font-semibold text-white/70">Weight</span>
                                <span className="text-xs font-bold text-white">{patient.weight ? `${patient.weight}kg` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full">
                                <span className="text-xs font-semibold text-white/70">Phone</span>
                                <span className="text-xs font-bold text-white">{patient.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PatientHeader
