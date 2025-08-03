'use client'
import { Doctor, Patient } from "@/types";
import { createContext, useContext, useState } from "react";

export const AuthContext = createContext<{
    patient: Patient | null;
    setPatient: (patient: Patient | null) => void;
    doctor: Doctor | null;
    setDoctor: (doctor: Doctor | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    error: string | null;
    setError: (error: string | null) => void;
    success: string | null;
    setSuccess: (success: string | null) => void;
    isAuthenticated: () => boolean;
    logout: () => void;
}>({
    patient: null,
    setPatient: () => { },
    doctor: null,
    setDoctor: () => { },
    loading: true,
    setLoading: () => { },
    error: null,
    setError: () => { },
    success: null,
    setSuccess: () => { },
    isAuthenticated: () => false,
    logout: () => { },
})

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const isAuthenticated = () => {
        return patient !== null && localStorage.getItem("token") !== null;
    }
    const logout = () => {
        localStorage.removeItem("token");
        setPatient(null);
        setDoctor(null);
        setLoading(false);
        setError(null);
        setSuccess(null);
    }

    return (
        <AuthContext.Provider value={{ patient, setPatient, doctor, setDoctor, loading, setLoading, error, setError, success, setSuccess, isAuthenticated, logout }
        }>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    return useContext(AuthContext);
}

export default AuthProvider;