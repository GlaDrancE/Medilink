'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import AddPatientModal from '@/components/AddPatientModal';
import { RedirectToSignIn, useAuth } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { addPrescription, getDoctorById } from '@/services/api.routes';
import { Doctor, Prescriptions } from '@/types';
import { createDoctor } from '@/services/api.routes';
import axios from 'axios';

interface PatientData {
    phone: string;
    name: string;
    age: string;
    gender: string;
    weight: string;
    disease: string;
    medicines: string;
    nextAppointment: string;
    healthCheckupNeeded: boolean;
    suggestedHospital: string;
    suggestedDoctor: string;
    expectedTime: string;
    additionalNotes: string;
}

export default function DoctorDashboard() {
    const auth = useAuth();
    const { user, isLoaded } = useUser();

    // Add Patient Modal State
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [formData, setFormData] = useState<Prescriptions>({
        id: '',
        patient: {
            id: '',
            phone: '',
            name: '',
            age: 0,
            gender: '',
            weight: 0,
            is_active: true,
        },
        doctor: {
            id: '',
            name: '',
            email: '',
            password: '',
            address: '',
            hospital: '',
            license_number: '',
            specialization: '',
            experience: 0,
            bio: '',
            profile_picture: '',
            is_active: false,
            is_verified: false,
            is_approved: false,
            is_rejected: false,
        },
        disease: '',
        medicine_list: [],
        nextAppointment: new Date(),
        prescription_text: '',
        prescription_date: new Date().toISOString(),
        patient_id: '',
        checkups: [],
        is_active: true,
    });
    const [formErrors, setFormErrors] = useState<Partial<PatientData>>({});
    const [formLoading, setFormLoading] = useState(false);



    useEffect(() => {
        (async () => {
            const token = await auth.getToken();
            if (token) {
                localStorage.setItem("token", token);
            }
        })();
        const fetchDoctor = async () => {
            try {
                const response = await getDoctorById()
                if (response.status !== 200) {
                    // const create = createDoctor({
                    //     email: user
                    // })
                }
            } catch (error) {
                console.error(error)
            }

        }
    }, [auth]);


    const handleLogout = () => {
        auth.signOut();
    };

    // Form options
    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    const hospitalOptions = [
        { value: 'city-general', label: 'City General Hospital' },
        { value: 'st-marys', label: 'St. Mary\'s Medical Center' },
        { value: 'central-clinic', label: 'Central Health Clinic' },
        { value: 'metro-hospital', label: 'Metro Hospital' },
        { value: 'specialty-care', label: 'Specialty Care Center' }
    ];

    const doctorOptions = [
        { value: 'dr-smith', label: 'Dr. John Smith (Cardiologist)' },
        { value: 'dr-johnson', label: 'Dr. Emily Johnson (Neurologist)' },
        { value: 'dr-brown', label: 'Dr. Michael Brown (Orthopedic)' },
        { value: 'dr-davis', label: 'Dr. Sarah Davis (Dermatologist)' },
        { value: 'dr-wilson', label: 'Dr. David Wilson (Radiologist)' },
        { value: 'dr-garcia', label: 'Dr. Maria Garcia (Pathologist)' }
    ];

    const handleAddPatient = async (patientData: Prescriptions) => {
        // e.preventDefault();

        setFormLoading(true);
        try {
            alert('Patient added successfully!');
            const response = await addPrescription(patientData)
            // handleCloseModal();
        } catch (error) {
            console.error('Error adding patient:', error);
            alert('Error adding patient. Please try again.');
        } finally {
            setFormLoading(false);
        }
    };

    const handleCloseModal = () => {
        setFormData({
            id: '',
            patient: {
                id: '',
                phone: '',
                name: '',
                age: 0,
                gender: '',
                weight: 0,
                is_active: true,
            },
            disease: '',
            medicine_list: [],
            nextAppointment: new Date(),
            prescription_text: '',
            prescription_date: new Date().toISOString(),
            patient_id: '',
            doctor_id: '',
            is_active: true,
            doctor: {
                id: '',
                name: '',
                email: '',
                password: '',
                address: '',
                hospital: '',
                license_number: '',
                specialization: '',
                experience: 0,
                bio: '',
                profile_picture: '',
                is_active: false,
                is_verified: false,
                is_approved: false,
                is_rejected: false,
            },
            checkups: [],
        });
        setFormErrors({});
        setIsAddPatientModalOpen(false);
    };

    const updateFormData = (field: keyof PatientData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    if (!user) {
        return <RedirectToSignIn />;
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">MediLink</h1>
                            <span className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                Doctor Portal
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user?.username}</span>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                size="sm"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.username}!
                    </h2>
                    <p className="text-gray-600">
                        Manage your practice and patient care from your professional dashboard.
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                                <p className="text-2xl font-bold text-gray-900">8</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                                <p className="text-2xl font-bold text-gray-900">142</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                                <p className="text-2xl font-bold text-gray-900">5</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">This Month</p>
                                <p className="text-2xl font-bold text-gray-900">89</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Button
                                className="h-20 flex-col space-y-2 bg-green-600 hover:bg-green-700"
                                onClick={() => setIsAddPatientModalOpen(true)}
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Add Patient</span>
                            </Button>

                            <Button variant="outline" className="h-20 flex-col space-y-2 border-green-300 text-green-700 hover:bg-green-50">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Patient Records</span>
                            </Button>

                            <Button variant="outline" className="h-20 flex-col space-y-2 border-green-300 text-green-700 hover:bg-green-50">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Prescriptions</span>
                            </Button>

                            <Button variant="outline" className="h-20 flex-col space-y-2 border-green-300 text-green-700 hover:bg-green-50">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span>Analytics</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Today's Schedule</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">9:00 AM - John Doe</p>
                                        <p className="text-sm text-gray-600">Routine Checkup</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-green-700">In Progress</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">10:30 AM - Sarah Wilson</p>
                                        <p className="text-sm text-gray-600">Follow-up Visit</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-500">Upcoming</span>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                    <div>
                                        <p className="font-medium text-gray-900">2:00 PM - Mike Johnson</p>
                                        <p className="text-sm text-gray-600">Consultation</p>
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-500">Upcoming</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Info */}
                <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-green-900 mb-4">Professional Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-green-700 font-medium">Name:</p>
                            <p className="text-green-800">{user.username}</p>
                        </div>
                        {/* <div>
                            <p className="text-green-700 font-medium">Specialization:</p>
                            <p className="text-green-800">{user.specialization || 'Not specified'}</p>
                        </div> */}
                        {/* <div>
                            <p className="text-green-700 font-medium">License Number:</p>
                            <p className="text-green-800">{user.licenseNumber || 'Not specified'}</p>
                        </div> */}
                        <div>
                            <p className="text-green-700 font-medium">Account Type:</p>
                            <p className="text-green-800 capitalize">doctor</p>
                        </div>
                        <div>
                            <p className="text-green-700 font-medium">Doctor ID:</p>
                            <p className="text-green-800">{user.id}</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add Patient Modal */}
            <AddPatientModal
                isOpen={isAddPatientModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleAddPatient}
            />
        </div>
    );
} 