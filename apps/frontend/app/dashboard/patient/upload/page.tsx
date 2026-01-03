"use client"
import TakePicture from '@/components/patient/TakePicture'
import { useHandleCapture } from '@/hooks/useHandleCapture'
import { usePatient } from '@/hooks/usePatient'
import { uploadDocument, uploadFile } from '@/services/api.routes'
import { Patient } from '@/types'
import React from 'react'

type Props = {}

const UploadPage = (props: Props) => {
    const { patient, setPatient } = usePatient();

    if (!patient) {
        return <div>Loading...</div>
    }
    const handleCapture = async (file: File, dataUrl: string, type: string) => {
        const response = await useHandleCapture(file, dataUrl, type)
        if (response) {
            setPatient({
                ...patient as Patient,
                document_id: response.data.id,
                documents: [...(patient.documents || []), response.data]
            })
        }
    }
    return (
        <>
            <TakePicture onCapture={handleCapture} />
        </>
    )
}
export default UploadPage;