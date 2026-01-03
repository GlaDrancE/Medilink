"use client"
import PatientAccount from '@/components/patient/PatientAccount'
import { usePatient } from '@/hooks/usePatient'
import React from 'react'

type Props = {}

const Account = (props: Props) => {
    const { patient } = usePatient()
    if (!patient) {
        return <div>Loading...</div>
    }
    return (
        <PatientAccount patient={patient} />
    )
}
export default Account