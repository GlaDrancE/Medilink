"use client"
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
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

const MedicalDashboard = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [expandedPrescription, setExpandedPrescription] = useState(0);
    const [prescriptions, setPrescriptions] = useState<Prescriptions[]>([]);
    const [patient, setPatient] = useState<Patient>({
        id: '',
        name: '',
        age: 0,
        weight: 0,
        height: 0,
        phone: '',
        email: '',
        is_active: true
    });
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

    const handleCapture = async (file: File, dataUrl: string, type: string) => {
        const formData = new FormData();
        formData.append('file', file)
        formData.append('upload_preset', 'medilink')
        formData.append("folder", "patient/docs")
        const repsonse = await uploadFile(formData)


        console.log(repsonse.data.secure_url)
        if (repsonse.status === 200) {
            const response = await uploadDocument({
                fileUrl: repsonse.data.secure_url,
                type: type
            })
            if (response.status === 200) {
                setPatient({
                    ...patient,
                    document_id: response.data.id,
                    documents: [...(patient.documents || []), response.data]
                })
            }
        }
    }


    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <PatientHeader patient={patient} />

            {/* Main Content */}
            <div className="p-4">
                {activeTab === 'home' && <PatientHome patient={patient} />}
                {activeTab === 'prescriptions' && <PatientPrescription patient={patient} prescriptions={prescriptions} />}
                {activeTab === 'upload' && <TakePicture onCapture={handleCapture} />}
                {activeTab === 'account' && <PatientAccount patient={patient} />}
            </div>
            <PatientFooter activeTab={activeTab} setActiveTab={setActiveTab} />

        </div>
    );
};

export default MedicalDashboard;