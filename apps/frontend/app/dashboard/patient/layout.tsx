"use client"
import PatientFooter from "@/components/patient/PatientFooter";
import PatientHeader from "@/components/patient/PatientHeader";
import { usePatientActiveTab } from "@/hooks/patientActiveTab";
import { useHandleCapture } from "@/hooks/useHandleCapture";
import { usePatient } from "@/hooks/usePatient";
import { Patient } from "@/types";

const PatientLayout = ({ children }: { children: React.ReactNode }) => {
    const { patient, setPatient } = usePatient();
    const { activeTab, setActiveTab } = usePatientActiveTab();
    const handleCapture = async (file: File, dataUrl: string, type: string) => {
        const response = await useHandleCapture(file, dataUrl, type)
        if (response) {
            setPatient({
                ...patient as Patient,
                document_id: response.data.id,
                documents: [...(patient?.documents || []), response.data]
            })
        }
    }
    return (
        <>
            {patient && <PatientHeader patient={patient} />}
            {children}
            <PatientFooter activeTab={activeTab} setActiveTab={setActiveTab} onCapture={handleCapture} />
        </>
    )
}

export default PatientLayout;