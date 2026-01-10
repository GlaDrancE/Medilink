"use client"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Brain, CheckCircle, AlertTriangle, Pill, FlaskRound, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

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

interface AIAnalysisCardProps {
    analysis: AIAnalysisResult | null;
    isLoading?: boolean;
}

const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ analysis, isLoading = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    if (isLoading) {
        return (
            <Card className="border-l-4 border-l-purple-500 shadow-lg animate-pulse">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600 animate-pulse notranslate" aria-hidden="true" />
                        <CardTitle className="text-base font-bold text-gray-900">
                            AI Analysis in Progress...
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!analysis) {
        return null;
    }

    const confidenceColor =
        analysis.confidence >= 0.8 ? 'text-green-600 bg-green-100' :
            analysis.confidence >= 0.6 ? 'text-amber-600 bg-amber-100' :
                'text-red-600 bg-red-100';

    const confidenceText =
        analysis.confidence >= 0.8 ? 'High Confidence' :
            analysis.confidence >= 0.6 ? 'Medium Confidence' :
                'Low Confidence';

    return (
        <Card className="border-l-4 border-l-purple-500 shadow-lg bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center notranslate">
                            <Brain className="w-5 h-5 text-white" aria-hidden="true" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                AI Analysis
                                <Sparkles className="w-4 h-4 text-purple-600 notranslate" aria-hidden="true" />
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-600 capitalize">{analysis.documentType}</span>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${confidenceColor}`}>
                                    {confidenceText}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-purple-600"
                    >
                        {isExpanded ? 'Hide' : 'Show'}
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-4">
                    {/* Summary */}
                    <div className="bg-white p-3 rounded-lg border border-purple-200">
                        <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            Summary
                        </h4>
                        <p className="text-sm text-gray-700">{analysis.summary}</p>
                    </div>

                    {/* Key Findings */}
                    {analysis.keyFindings && analysis.keyFindings.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Key Findings
                            </h4>
                            <ul className="space-y-1.5">
                                {analysis.keyFindings.map((finding, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-green-600 mt-0.5">•</span>
                                        <span>{finding}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Medications */}
                    {analysis.medications && analysis.medications.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                                <Pill className="w-4 h-4 text-blue-600" />
                                Detected Medications
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.medications.map((med, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                                    >
                                        {med}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lab Values */}
                    {analysis.labValues && Object.keys(analysis.labValues).length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                                <FlaskRound className="w-4 h-4 text-purple-600" />
                                Lab Values
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(analysis.labValues).map(([test, value]) => (
                                    <div key={test} className="text-xs">
                                        <span className="font-semibold text-gray-700">{test}:</span>
                                        <span className="ml-1 text-gray-600">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detected Conditions */}
                    {analysis.detectedConditions && analysis.detectedConditions.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                Detected Conditions
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.detectedConditions.map((condition, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs font-medium px-3 py-1 bg-amber-100 text-amber-700 rounded-full"
                                    >
                                        {condition}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-gray-800 text-sm mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-indigo-600" />
                                Recommendations
                            </h4>
                            <ul className="space-y-1.5">
                                {analysis.recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-indigo-600 mt-0.5">→</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                        <p className="text-[11px] text-amber-800">
                            <strong>⚠️ Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. Always consult with your healthcare provider.
                        </p>
                    </div>
                </CardContent>
            )}
        </Card>
    );
};

export default AIAnalysisCard;

