"use client"
import { Document } from "@/types";
import { Card, CardContent } from "../ui/card";
import { Brain, FileText, Download, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import AIAnalysisCard from "../AIAnalysisCard";

interface DocumentWithAIProps {
    document: Document;
    showPreview?: boolean;
}

const DocumentWithAI: React.FC<DocumentWithAIProps> = ({ document, showPreview = true }) => {
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showImage, setShowImage] = useState(false);

    const isPdf = document.file_url?.endsWith('.pdf') || document.file_url?.includes('pdf');
    const isImage = !isPdf && (
        document.file_url?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
        document.file_url?.includes('image')
    );

    const hasAIAnalysis = document.ai_summary ||
        (document.ai_key_findings && document.ai_key_findings.length > 0);

    const aiAnalysis = hasAIAnalysis ? {
        summary: document.ai_summary || '',
        keyFindings: document.ai_key_findings || [],
        recommendations: document.ai_recommendations || [],
        documentType: document.type,
        confidence: document.ai_confidence || 0,
        detectedConditions: document.ai_detected_conditions || [],
        medications: document.ai_medications || [],
        labValues: document.ai_lab_values || undefined,
    } : null;

    return (
        <div className="space-y-3">
            {/* Document Card */}
            <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-indigo-600" />
                                <h4 className="font-semibold text-gray-900 text-sm">
                                    {document.name || `${document.type} Document`}
                                </h4>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full font-medium capitalize">
                                    {document.type}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(document.createdAt).toLocaleDateString()}
                                </span>
                                {hasAIAnalysis && (
                                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium flex items-center gap-1">
                                        <Brain className="w-3 h-3" />
                                        AI Analyzed
                                    </span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {showPreview && isImage && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowImage(!showImage)}
                                        className="text-xs h-8"
                                    >
                                        {showImage ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                                        {showImage ? 'Hide' : 'View'} Image
                                    </Button>
                                )}
                                {hasAIAnalysis && (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setShowAnalysis(!showAnalysis)}
                                        className="text-xs h-8 border-purple-300 text-purple-600 hover:bg-purple-50"
                                    >
                                        <Brain className="w-3 h-3 mr-1" />
                                        {showAnalysis ? 'Hide' : 'View'} AI Analysis
                                    </Button>
                                )}
                                <a
                                    href={document.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex"
                                >
                                    <Button size="sm" variant="outline" className="text-xs h-8">
                                        <ExternalLink className="w-3 h-3 mr-1" />
                                        Open
                                    </Button>
                                </a>
                                <a
                                    href={document.file_url}
                                    download
                                    className="inline-flex"
                                >
                                    <Button size="sm" variant="outline" className="text-xs h-8">
                                        <Download className="w-3 h-3 mr-1" />
                                        Download
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Image Preview */}
                    {showImage && isImage && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                            <img
                                src={document.file_url}
                                alt={document.name || 'Document'}
                                className="w-full h-auto max-h-96 object-contain bg-gray-50"
                            />
                        </div>
                    )}

                    {/* PDF Preview */}
                    {showImage && isPdf && (
                        <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                            <iframe
                                src={document.file_url}
                                className="w-full h-96"
                                title={document.name || 'Document'}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* AI Analysis Card */}
            {showAnalysis && aiAnalysis && (
                <AIAnalysisCard analysis={aiAnalysis} />
            )}
        </div>
    );
};

export default DocumentWithAI;

