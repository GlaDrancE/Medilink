"use client"
import React, { useState } from 'react'
import { usePatient } from '@/hooks/usePatient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Image as ImageIcon, Download, Eye, Calendar, Stethoscope, FlaskConical, Brain, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PrescriptionWindow } from '@/components/patient/PrescriptionWindow'
import { Prescriptions } from '@/types'
import AIAnalysisCard from '@/components/AIAnalysisCard'

const RecordsPage = () => {
    const { patient } = usePatient()
    const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
    const [expandedPrescription, setExpandedPrescription] = useState<number | null>(null)
    const [expandedDocumentAI, setExpandedDocumentAI] = useState<string | null>(null)

    if (!patient) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        )
    }

    // Group documents by type
    const documentsByType = patient.documents?.reduce((acc, doc) => {
        const type = doc.type || 'other'
        if (!acc[type]) {
            acc[type] = []
        }
        acc[type].push(doc)
        return acc
    }, {} as Record<string, typeof patient.documents>) || {}

    const getTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            prescription: 'Prescriptions',
            lab: 'Lab Reports',
            xray: 'X-Ray Reports',
            scan: 'Scan Reports',
            other: 'Other Documents'
        }
        return labels[type] || type.charAt(0).toUpperCase() + type.slice(1)
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'prescription':
                return <Stethoscope className="w-5 h-5" />
            case 'lab':
                return <FlaskConical className="w-5 h-5" />
            default:
                return <FileText className="w-5 h-5" />
        }
    }

    const handleDownload = (url: string, name?: string) => {
        const link = document.createElement('a')
        link.href = url
        link.download = name || 'document'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleViewImage = (url: string) => {
        setSelectedDocument(url)
    }

    const togglePrescription = (index: number) => {
        setExpandedPrescription(expandedPrescription === index ? null : index)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="p-4 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Medical Records</h1>
                    <p className="text-gray-600">View all your documents and prescriptions</p>
                </div>

                {/* Prescriptions Section */}
                {patient.prescriptions && patient.prescriptions.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Stethoscope className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Prescriptions</h2>
                            <span className="text-sm text-gray-500">({patient.prescriptions.length})</span>
                        </div>

                        <div className="space-y-3">
                            {patient.prescriptions.map((prescription, index) => (
                                <Card key={prescription.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardHeader
                                        onClick={() => togglePrescription(index)}
                                        className="pb-3"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <CardTitle className="text-lg font-semibold text-gray-800">
                                                    Prescription #{index + 1}
                                                </CardTitle>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {prescription.createdAt && formatDate(prescription.createdAt.toString())}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">
                                                    {expandedPrescription === index ? 'Hide' : 'View'}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    {expandedPrescription === index && (
                                        <CardContent>
                                            <PrescriptionWindow
                                                prescription={prescription as Prescriptions}
                                                isRecent={index === 0}
                                            />
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Documents Section */}
                {patient.documents && patient.documents.length > 0 ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <FileText className="w-6 h-6 text-blue-600" />
                            <h2 className="text-xl font-semibold text-gray-800">Documents</h2>
                            <span className="text-sm text-gray-500">({patient.documents.length})</span>
                        </div>

                        {/* Documents grouped by type */}
                        {Object.entries(documentsByType).map(([type, docs]) => (
                            <div key={type} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    {getTypeIcon(type)}
                                    <h3 className="text-lg font-semibold text-gray-700">
                                        {getTypeLabel(type)}
                                    </h3>
                                    <span className="text-sm text-gray-500">({docs.length})</span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    {docs.map((doc, index) => {
                                        const docId = `${type}-${index}`;
                                        const hasAIAnalysis = doc.ai_summary ||
                                            (doc.ai_key_findings && doc.ai_key_findings.length > 0);

                                        const aiAnalysis = hasAIAnalysis ? {
                                            summary: doc.ai_summary || '',
                                            keyFindings: doc.ai_key_findings || [],
                                            recommendations: doc.ai_recommendations || [],
                                            documentType: type,
                                            confidence: doc.ai_confidence || 0,
                                            detectedConditions: doc.ai_detected_conditions || [],
                                            medications: doc.ai_medications || [],
                                            labValues: doc.ai_lab_values || undefined,
                                        } : null;

                                        return (
                                            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                                                <CardContent className="p-0">
                                                    <div className="flex flex-col sm:flex-row gap-4 p-4">
                                                        {/* Document Image Preview */}
                                                        <div className="relative w-full sm:w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img
                                                                src={doc.file_url}
                                                                alt={doc.name || `${type} document ${index + 1}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement
                                                                    target.style.display = 'none'
                                                                    const parent = target.parentElement
                                                                    if (parent) {
                                                                        parent.innerHTML = `
                                                                            <div class="w-full h-full flex items-center justify-center">
                                                                                <div class="text-center">
                                                                                    <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                                                    </svg>
                                                                                    <p class="text-sm text-gray-500">Document Preview</p>
                                                                                </div>
                                                                            </div>
                                                                        `
                                                                    }
                                                                }}
                                                            />
                                                        </div>

                                                        {/* Document Info and Actions */}
                                                        <div className="flex-1 space-y-3">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <p className="font-semibold text-gray-800 text-base">
                                                                        {doc.name || `${getTypeLabel(type)} #${index + 1}`}
                                                                    </p>
                                                                    {hasAIAnalysis && (
                                                                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full font-medium flex items-center gap-1">
                                                                            <Brain className="w-3 h-3" />
                                                                            AI Analyzed
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-500 capitalize">
                                                                    Type: {type}
                                                                </p>
                                                                {doc.ai_analyzed_at && (
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        Analyzed: {new Date(doc.ai_analyzed_at).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            {/* AI Summary Preview */}
                                                            {hasAIAnalysis && doc.ai_summary && (
                                                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                                                    <div className="flex items-start gap-2">
                                                                        <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                                                        <div className="flex-1">
                                                                            <p className="text-xs font-semibold text-purple-900 mb-1">AI Summary</p>
                                                                            <p className="text-xs text-purple-700 line-clamp-2">
                                                                                {doc.ai_summary}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="flex flex-wrap gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewImage(doc.file_url)}
                                                                >
                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                    View
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleDownload(doc.file_url, doc.name)}
                                                                >
                                                                    <Download className="w-4 h-4 mr-1" />
                                                                    Download
                                                                </Button>
                                                                {hasAIAnalysis && (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setExpandedDocumentAI(
                                                                            expandedDocumentAI === docId ? null : docId
                                                                        )}
                                                                        className="border-purple-300 text-purple-600 hover:bg-purple-50"
                                                                    >
                                                                        <Brain className="w-4 h-4 mr-1" />
                                                                        {expandedDocumentAI === docId ? (
                                                                            <>
                                                                                <ChevronUp className="w-3 h-3 ml-1" />
                                                                                Hide Analysis
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <ChevronDown className="w-3 h-3 ml-1" />
                                                                                View Full Analysis
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Expanded AI Analysis */}
                                                    {expandedDocumentAI === docId && aiAnalysis && (
                                                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                                                            <AIAnalysisCard analysis={aiAnalysis} />
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-8 text-center">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600">No documents found</p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State for both */}
                {(!patient.prescriptions || patient.prescriptions.length === 0) &&
                    (!patient.documents || patient.documents.length === 0) && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Records Found</h3>
                                <p className="text-gray-600">You don't have any prescriptions or documents yet.</p>
                            </CardContent>
                        </Card>
                    )}
            </div>

            {/* Image Modal */}
            {selectedDocument && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedDocument(null)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 z-10 bg-white hover:bg-gray-100"
                            onClick={() => setSelectedDocument(null)}
                        >
                            ×
                        </Button>
                        <img
                            src={selectedDocument}
                            alt="Document"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default RecordsPage
