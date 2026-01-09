"use client"
import PatientFooter from "@/components/patient/PatientFooter";
import PatientHeader from "@/components/patient/PatientHeader";
import { usePatientActiveTab } from "@/hooks/patientActiveTab";
import { useHandleCapture } from "@/hooks/useHandleCapture";
import { usePatient } from "@/hooks/usePatient";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Patient } from "@/types";
import AIAnalysisCard from "@/components/AIAnalysisCard";
import { useEffect } from "react";

const PatientLayout = ({ children }: { children: React.ReactNode }) => {
    const { patient, setPatient } = usePatient();
    const { activeTab, setActiveTab } = usePatientActiveTab();
    const { currentAnalysis, isAnalyzing, setCurrentAnalysis, setIsAnalyzing, addToHistory, clearCurrentAnalysis } = useAIAnalysis();

    const handleCapture = async (file: File, dataUrl: string, type: string) => {
        setIsAnalyzing(true);
        try {
            const response = await useHandleCapture(file, dataUrl, type)
            if (response) {
                // Update patient with new document
                const newDocument = response.document || response.data;
                setPatient({
                    ...patient as Patient,
                    document_id: newDocument.id,
                    documents: [...(patient?.documents || []), newDocument]
                })

                // Set AI analysis if available
                if (response.aiAnalysis) {
                    setCurrentAnalysis(response.aiAnalysis);
                    addToHistory(newDocument.id, response.aiAnalysis);
                }
            }
        } catch (error) {
            console.error("Error uploading document:", error);
        } finally {
            setIsAnalyzing(false);
        }
    }

    // Clear AI analysis when navigating away
    useEffect(() => {
        if (activeTab !== 'upload') {
            // Optionally clear after some time
            const timer = setTimeout(() => {
                clearCurrentAnalysis();
            }, 10000); // Clear after 10 seconds
            return () => clearTimeout(timer);
        }
    }, [activeTab, clearCurrentAnalysis]);

    return (
        <>
            {patient && <PatientHeader patient={patient} />}
            
            {/* AI Analysis Card - Show when available */}
            {(currentAnalysis || isAnalyzing) && (
                <div className="max-w-4xl mx-auto px-4 pt-4">
                    <AIAnalysisCard analysis={currentAnalysis} isLoading={isAnalyzing} />
                </div>
            )}
            
            {children}
            <PatientFooter activeTab={activeTab} setActiveTab={setActiveTab} onCapture={handleCapture} />
        </>
    )
}

export default PatientLayout;