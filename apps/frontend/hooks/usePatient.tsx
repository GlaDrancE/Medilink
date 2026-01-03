"use client"
import { getPatientById } from "@/services/api.routes";
import { Patient } from "@/types";
import { useEffect, useState } from "react";

export const usePatient = () => {
    const [patient, setPatient] = useState<Patient | null>(null);
    useEffect(() => {
        const fetchPatient = async () => {
            const patient = await getPatientById();
            setPatient(patient);
        }
        fetchPatient();
    }, []);
    return {
        patient,
        setPatient
    }
}