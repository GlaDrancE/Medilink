"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    User,
    Pill,
    UserCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    Calendar,
    Check,
    Stethoscope,
    Edit3,
    Save,
    Home
} from 'lucide-react';
import { MedicineEntry, Prescriptions, Patient } from '@/types';
import { getPatientById, getPrescription, uploadDocument, uploadFile } from '@/services/api.routes';
import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';
import PatientHome from '@/components/patient/PatientHome';
import PatientPrescription from '@/components/patient/PatientPrescription';
import TakePicture from '@/components/patient/TakePicture';
import { usePatientActiveTab } from '@/hooks/patientActiveTab';
import { usePatient } from '@/hooks/usePatient';

const MedicalDashboard = () => {
    const { activeTab, setActiveTab } = usePatientActiveTab();
    const [expandedPrescription, setExpandedPrescription] = useState(0);
    const [prescriptions, setPrescriptions] = useState<Prescriptions[]>([]);
    const { patient, setPatient } = usePatient();
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState({
        name: 'John Smith',
        age: '32',
        weight: '70', // in kg
        height: '175', // in cm
        phone: '+91 98765 43210',
        email: 'john.smith@email.com'
    });
    const router = useRouter();


    useEffect(() => {
        const fetchPrescriptions = async () => {
            const prescriptions = await getPrescription();
            console.log(prescriptions)
            setPrescriptions(prescriptions as Prescriptions[]);
        };
        fetchPrescriptions();
    }, []);





    const handleSaveProfile = () => {
        setIsEditing(false);
    };

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                const patient = await getPatientById();
                console.log(patient)
                setPatient(patient as Patient);

            } catch (error: any) {
                if (error.response.status === 401) {
                    router.push('/auth/patient');
                }

            }
        };
        fetchPatient();
    }, []);


    if (!patient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600 font-medium">Loading your profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-20">
            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                <div className="space-y-6">
                    {activeTab === 'home' && <PatientHome patient={patient} />}
                    {activeTab === 'prescriptions' && <PatientPrescription patient={patient} prescriptions={prescriptions} />}
                </div>
            </div>
        </div>
    );
};

export default MedicalDashboard;