"use client"
import { create } from 'zustand';

interface AIAnalysisResult {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    documentType: string;
    confidence: number;
    detectedConditions?: string[];
    medications?: string[];
    labValues?: Record<string, string>;
}

interface AIAnalysisState {
    currentAnalysis: AIAnalysisResult | null;
    isAnalyzing: boolean;
    analysisHistory: Array<{ id: string; analysis: AIAnalysisResult; timestamp: Date }>;
    setCurrentAnalysis: (analysis: AIAnalysisResult | null) => void;
    setIsAnalyzing: (isAnalyzing: boolean) => void;
    addToHistory: (id: string, analysis: AIAnalysisResult) => void;
    clearCurrentAnalysis: () => void;
}

export const useAIAnalysis = create<AIAnalysisState>((set) => ({
    currentAnalysis: null,
    isAnalyzing: false,
    analysisHistory: [],
    setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
    setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
    addToHistory: (id, analysis) =>
        set((state) => ({
            analysisHistory: [
                ...state.analysisHistory,
                { id, analysis, timestamp: new Date() },
            ],
        })),
    clearCurrentAnalysis: () => set({ currentAnalysis: null, isAnalyzing: false }),
}));

