'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import { searchPatientByPhone, createPatient, registerPatient, loginPatient } from '@/services/api.routes';
import { Patient } from '@/types';

export default function PatientAuthPage() {
    const router = useRouter();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // New patient form state
    const [newPatient, setNewPatient] = useState({
        name: '',
        age: '',
        weight: '',
        email: '',
        gender: '',
        phone: ''
    });

    const handlePhoneSearch = async () => {
        if (!phoneNumber.trim()) {
            setError('Please enter a phone number');
            return;
        }

        setIsSearching(true);
        setError('');
        setSuccess('');

        try {
            const response = await searchPatientByPhone(phoneNumber);
            const foundPatients = response;

            if (foundPatients.length === 0) {
                setPatients([]);
                setShowCreateModal(true);
                setNewPatient(prev => ({ ...prev, phone: phoneNumber }));
            } else if (foundPatients.length === 1) {
                // Auto-login if only one patient found
                const patientLogin = await loginPatient(foundPatients[0]?.id)
                handlePatientLogin(patientLogin.token!);
            } else {
                setPatients(foundPatients);
                setSelectedPatient('');
            }
        } catch (error: any) {
            console.error('Search error:', error);
            setError(error.response?.data?.message || 'Failed to search for patients');
        } finally {
            setIsSearching(false);
        }
    };

    const handlePatientLogin = (token: string) => {
        // Store patient data in localStorage or state management
        localStorage.setItem('token', token);
        setSuccess('Login successful! Redirecting...');

        // Redirect to patient dashboard
        setTimeout(() => {
            router.push('/dashboard/patient');
        }, 1500);
    };

    const handlePatientSelect = async () => {
        if (!selectedPatient) {
            setError('Please select a patient');
            return;
        }

        const patient = patients.find(p => p.phone === selectedPatient);
        const patientLogin = await loginPatient(patient?.id!);

        handlePatientLogin(patientLogin.data.token!);
    };

    const handleCreatePatient = async () => {
        if (!newPatient.name || !newPatient.age || !newPatient.weight || !newPatient.gender) {
            setError('Please fill in all required fields');
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            const patientData: Patient = {
                id: "",
                is_active: true,
                name: newPatient.name,
                age: Number(newPatient.age),
                weight: Number(newPatient.weight),
                email: newPatient.email || undefined,
                gender: newPatient.gender,
                phone: newPatient.phone
            };

            const response = await registerPatient(patientData);
            const createdPatient = response.data;

            setSuccess('Patient created successfully! Logging in...');
            setShowCreateModal(false);

            handlePatientLogin(createdPatient.token!);
        } catch (error: any) {
            console.error('Create error:', error);
            setError(error.response?.data?.message || 'Failed to create patient');
        } finally {
            setIsCreating(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setNewPatient(prev => ({ ...prev, [field]: value }));
    };

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Patient Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your phone number to continue
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow rounded-lg">
                    <div className="space-y-6">
                        <Input
                            label="Phone Number"
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            error={error}
                        />

                        <Button
                            onClick={handlePhoneSearch}
                            loading={isSearching}
                            className="w-full"
                            disabled={!phoneNumber.trim()}
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </Button>

                        {success && (
                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                {success}
                            </div>
                        )}

                        {/* Patient Selection Dropdown */}
                        {patients.length > 1 && (
                            <div className="space-y-4">
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-600 mb-3">
                                        Multiple patients found. Please select one:
                                    </p>
                                    <Select
                                        label="Select Patient"
                                        options={patients.map(patient => ({
                                            value: patient.phone,
                                            label: `${patient.name} (${patient.age} years, ${patient.gender})`
                                        }))}
                                        value={selectedPatient}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                        placeholder="Choose a patient"
                                    />
                                    <Button
                                        onClick={handlePatientSelect}
                                        className="w-full mt-3"
                                        disabled={!selectedPatient}
                                    >
                                        Continue with Selected Patient
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create New Patient Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Patient"
                size="md"
            >
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 mb-4">
                        No patient found with this phone number. Please create a new patient account.
                    </p>

                    <Input
                        label="Full Name *"
                        placeholder="Enter full name"
                        value={newPatient.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Age *"
                            type="number"
                            placeholder="Age"
                            value={newPatient.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                        />

                        <Input
                            label="Weight (kg) *"
                            type="number"
                            placeholder="Weight"
                            value={newPatient.weight}
                            onChange={(e) => handleInputChange('weight', e.target.value)}
                        />
                    </div>

                    <Select
                        label="Gender *"
                        options={genderOptions}
                        value={newPatient.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        placeholder="Select gender"
                    />

                    <Input
                        label="Email (Optional)"
                        type="email"
                        placeholder="Enter email address"
                        value={newPatient.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                    />

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowCreateModal(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreatePatient}
                            loading={isCreating}
                            className="flex-1"
                        >
                            {isCreating ? 'Creating...' : 'Create Patient'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
