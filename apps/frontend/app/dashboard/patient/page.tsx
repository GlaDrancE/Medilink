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
import PatientHeader from '@/components/patient/PatientHeader';
import PatientFooter from '@/components/patient/PatientFooter';
import PatientAccount from '@/components/patient/PatientAccount';
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
        return <div>Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* Main Content */}
            <div className="p-4">
                {activeTab === 'home' && <PatientHome patient={patient} />}
                {activeTab === 'prescriptions' && <PatientPrescription patient={patient} prescriptions={prescriptions} />}
            </div>

        </div>
    );
};

export default MedicalDashboard;