"use client"

import React from 'react';
import { Upload, FileCheck, Sparkles } from 'lucide-react';

interface UploadLoaderProps {
    isUploading: boolean;
    stage?: 'uploading' | 'analyzing' | 'complete';
}

const UploadLoader: React.FC<UploadLoaderProps> = ({ isUploading, stage = 'uploading' }) => {
    if (!isUploading && stage !== 'complete') return null;

    const getStageInfo = () => {
        switch (stage) {
            case 'uploading':
                return {
                    icon: Upload,
                    text: 'Uploading document...',
                    color: 'blue'
                };
            case 'analyzing':
                return {
                    icon: Sparkles,
                    text: 'AI is analyzing your document...',
                    color: 'purple'
                };
            case 'complete':
                return {
                    icon: FileCheck,
                    text: 'Upload complete!',
                    color: 'green'
                };
            default:
                return {
                    icon: Upload,
                    text: 'Processing...',
                    color: 'blue'
                };
        }
    };

    const stageInfo = getStageInfo();
    const Icon = stageInfo.icon;

    return (
        <>
            <style>{`
                @keyframes progress-bar {
                    0% {
                        width: 0%;
                        margin-left: 0%;
                    }
                    50% {
                        width: 70%;
                        margin-left: 15%;
                    }
                    100% {
                        width: 0%;
                        margin-left: 100%;
                    }
                }
                @keyframes pulse-dot {
                    0%, 100% {
                        opacity: 0.4;
                    }
                    50% {
                        opacity: 1;
                    }
                }
            `}</style>
            
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-md">
                {/* Progress Bar */}
                <div className="h-1 bg-gray-200/50 overflow-hidden">
                    <div 
                        className={`h-full ${
                            stageInfo.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            stageInfo.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                            'bg-gradient-to-r from-green-500 to-green-600'
                        } ${stage === 'complete' ? 'w-full transition-all duration-500' : ''}`}
                        style={stage !== 'complete' ? {
                            animation: 'progress-bar 2s ease-in-out infinite'
                        } : undefined}
                    />
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-center space-x-3">
                        <div className={`${
                            stage === 'complete' ? '' : 'animate-bounce'
                        }`}>
                            <Icon className={`w-5 h-5 ${
                                stageInfo.color === 'blue' ? 'text-blue-600' :
                                stageInfo.color === 'purple' ? 'text-purple-600' :
                                'text-green-600'
                            }`} />
                        </div>
                        <p className={`text-sm font-medium ${
                            stageInfo.color === 'blue' ? 'text-blue-900' :
                            stageInfo.color === 'purple' ? 'text-purple-900' :
                            'text-green-900'
                        }`}>
                            {stageInfo.text}
                        </p>
                        {stage !== 'complete' && (
                            <div className="flex space-x-1">
                                <span 
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                                    style={{ animation: 'pulse-dot 1.4s ease-in-out 0s infinite' }}
                                ></span>
                                <span 
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                                    style={{ animation: 'pulse-dot 1.4s ease-in-out 0.2s infinite' }}
                                ></span>
                                <span 
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full" 
                                    style={{ animation: 'pulse-dot 1.4s ease-in-out 0.4s infinite' }}
                                ></span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default UploadLoader;

