"use client"
import PatientFooter from "@/components/patient/PatientFooter";
import PatientHeader from "@/components/patient/PatientHeader";
import UploadLoader from "@/components/patient/UploadLoader";
import LanguageSelector from "@/components/LanguageSelector";
import VoiceAssistant from "@/components/VoiceAssistant";
import { usePatientActiveTab } from "@/hooks/patientActiveTab";
import { useHandleCapture } from "@/hooks/useHandleCapture";
import { usePatient } from "@/hooks/usePatient";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Patient } from "@/types";
import AIAnalysisCard from "@/components/AIAnalysisCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const PatientLayout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();
    const { patient, setPatient } = usePatient();
    const { activeTab, setActiveTab } = usePatientActiveTab();
    const { currentAnalysis, isAnalyzing, setCurrentAnalysis, setIsAnalyzing, addToHistory, clearCurrentAnalysis } = useAIAnalysis();
    const [uploadStage, setUploadStage] = useState<'uploading' | 'analyzing' | 'complete'>('uploading');
    const [showLoader, setShowLoader] = useState(false);
    const [tokenChecked, setTokenChecked] = useState(false);

    // Guard: redirect to patient auth if no JWT token in localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.replace('/auth/patient');
        } else {
            setTokenChecked(true);
        }
    }, [router]);

    const handleCapture = async (file: File, dataUrl: string, type: string) => {
        setIsAnalyzing(true);
        setShowLoader(true);
        try {
            const response = await useHandleCapture(file, dataUrl, type, (stage) => {
                setUploadStage(stage);
            });

            if (response) {
                const newDocument = response.document || response.data;
                setPatient({
                    ...patient as Patient,
                    document_id: newDocument.id,
                    documents: [...(patient?.documents || []), newDocument]
                });

                if (response.aiAnalysis) {
                    setCurrentAnalysis(response.aiAnalysis);
                    addToHistory(newDocument.id, response.aiAnalysis);
                }

                setTimeout(() => {
                    setShowLoader(false);
                }, 2000);
            }
        } catch (error) {
            console.error("Error uploading document:", error);
            setShowLoader(false);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // Clear AI analysis when navigating away
    useEffect(() => {
        if (activeTab !== 'upload') {
            const timer = setTimeout(() => {
                clearCurrentAnalysis();
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [activeTab, clearCurrentAnalysis]);

    if (!tokenChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" aria-label="Loading" />
            </div>
        );
    }

    return (
        <>
            <UploadLoader isUploading={showLoader} stage={uploadStage} />

            <div className="fixed top-4 right-4 z-9999">
                <LanguageSelector />
            </div>

            <VoiceAssistant />

            <div className={`${showLoader ? 'pt-16' : ''} transition-all duration-300`}>
                {patient && <PatientHeader patient={patient} />}

                {(currentAnalysis || isAnalyzing) && (
                    <div className="max-w-4xl mx-auto px-4 pt-4">
                        <AIAnalysisCard analysis={currentAnalysis} isLoading={isAnalyzing} />
                    </div>
                )}

                {children}
                <PatientFooter activeTab={activeTab} setActiveTab={setActiveTab} onCapture={handleCapture} />
            </div>
        </>
    );
};

export default PatientLayout;
