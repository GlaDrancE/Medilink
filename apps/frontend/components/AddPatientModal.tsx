'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Textarea from './ui/Textarea';
import { Button } from '@/components/ui/button';
import AutocompleteInput from './ui/AutocompleteInput';
import Calendar from './ui/Calendar';
import { MedicineEntry, Patient, Prescriptions } from '@/types';
import { createPatient, searchPatientByPhone } from '@/services/api.routes';
import { validatePhoneNumber, formatPhoneNumber } from '@/lib/validation';
import { useUser } from '@clerk/nextjs';
import { X } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface AddPatientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (patientData: Prescriptions) => void;
}

interface PatientData {
    // Phone number (always required)
    phone: string;

    // Basic Information (only if patient not found)
    name: string;
    age: string;
    gender: string;
    weight: string;

    // Medical Information
    disease: string;
    medicines: string;

    // Appointment
    nextAppointment: string;

    // Checkup Requirements
    healthCheckupNeeded: boolean;
    suggestedHospital: string;
    suggestedDoctor: string;
    expectedTime: string;

    // Additional Details
    additionalNotes: string;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    // Step management
    const [currentStep, setCurrentStep] = useState<'phone' | 'form'>('phone');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [foundPatient, setFoundPatient] = useState<any>(null);
    const [showAddNewOption, setShowAddNewOption] = useState(false);
    const [hospitalOptions, setHospitalOptions] = useState<any[]>([]);
    const [doctorOptions, setDoctorOptions] = useState<any[]>([]);
    const [patient, setPatient] = useState<Patient | null>(null)
    const { user } = useUser();

    // Debounce for phone search
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Form data (only used when adding new patient)
    const [formData, setFormData] = useState<PatientData>({
        phone: '',
        name: '',
        age: '',
        gender: '',
        weight: '',
        disease: '',
        medicines: '',
        nextAppointment: '',
        healthCheckupNeeded: false,
        suggestedHospital: '',
        suggestedDoctor: '',
        expectedTime: '',
        additionalNotes: ''
    });

    const [errors, setErrors] = useState<Partial<PatientData>>({});
    const [loading, setLoading] = useState(false);

    const [medicinesList, setMedicinesList] = useState<MedicineEntry[]>([]);
    const [medicineInput, setMedicineInput] = useState<MedicineEntry>({
        name: '',
        dosage: { morning: '', afternoon: '', night: '' },
        food: '',
        notes: '',
        time: new Date(),
        before_after_food: ""
    });
    const [medicineError, setMedicineError] = useState<string>('');

    const dosageOptions = [
        { value: '1', label: '1' },
        { value: '0.5', label: '1/2' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: 'custom', label: 'Custom' }
    ];
    const [customDosage, setCustomDosage] = useState({ morning: '', afternoon: '', night: '' });

    const genderOptions = [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' }
    ];

    const foodOptions = [
        { value: 'before', label: 'Before Food' },
        { value: 'after', label: 'After Food' }
    ];

    const timeKeys = ['morning', 'afternoon', 'night'] as const;
    type TimeKey = typeof timeKeys[number];

    // Phone number search with debounce
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (phoneNumber.length >= 10) {
            const validation = validatePhoneNumber(phoneNumber);
            if (!validation.isValid) {
                setPhoneError(validation.message);
                setFoundPatient(null);
                setShowAddNewOption(false);
                return;
            }

            setPhoneError('');
            setIsSearching(true);

            searchTimeoutRef.current = setTimeout(async () => {
                try {
                    const patient = await searchPatientByPhone(phoneNumber);
                    setFoundPatient(patient);
                    setShowAddNewOption(true);
                } catch (error: any) {
                    if (error.response?.status === 404) {
                        setFoundPatient(null);
                        setShowAddNewOption(true);
                    } else {
                        setPhoneError('Error searching for patient');
                        setFoundPatient(null);
                        setShowAddNewOption(false);
                    }
                } finally {
                    setIsSearching(false);
                }
            }, 500);
        } else {
            setFoundPatient(null);
            setShowAddNewOption(false);
            setIsSearching(false);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [phoneNumber]);

    const validateForm = (): boolean => {
        const newErrors: Partial<PatientData> = {};

        // Required fields validation for new patient
        if (!formData.name.trim()) {
            newErrors.name = 'Patient name is required';
        }
        if (!formData.age.trim()) {
            newErrors.age = 'Patient age is required';
        } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0 || Number(formData.age) > 150) {
            newErrors.age = 'Please enter a valid age (1-150)';
        }
        if (!formData.gender) {
            newErrors.gender = 'Please select gender';
        }
        if (!formData.weight.trim()) {
            newErrors.weight = 'Patient weight is required';
        } else if (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
            newErrors.weight = 'Please enter a valid weight';
        }
        if (!formData.disease.trim()) {
            newErrors.disease = 'Disease/condition is required';
        }
        if (medicinesList.length === 0) {
            newErrors.medicines = 'At least one medicine is required';
        }

        // Conditional validation for checkup fields
        if (formData.healthCheckupNeeded) {
            if (!formData.suggestedHospital) {
                newErrors.suggestedHospital = 'Please select a hospital for checkup';
            }
            if (!formData.suggestedDoctor) {
                newErrors.suggestedDoctor = 'Please select a doctor for checkup';
            }
            if (!formData.expectedTime.trim()) {
                newErrors.expectedTime = 'Expected time is required for checkup';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handlePhoneSubmit = (patient: Patient | null) => {
        if (!phoneNumber.trim()) {
            setPhoneError('Phone number is required');
            return;
        }

        const validation = validatePhoneNumber(phoneNumber);
        if (!validation.isValid) {
            setPhoneError(validation.message);
            return;
        }
        if (patient) {
            setPatient(patient)
            setFormData(prev => ({ ...prev, phone: patient.phone, name: patient.name || "", weight: patient.weight.toString(), age: patient.age.toString(), gender: patient.gender }))
        }
        if (showAddNewOption) {
            // Patient not found - show form to add new patient
            setFormData(prev => ({ ...prev, phone: phoneNumber }));
            setCurrentStep('form');
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        // if (!validateForm()) {
        //     return;
        // }

        setLoading(true);
        try {
            if (patient && patient.id) {
                onSubmit({
                    id: '',
                    ...formData, medicine_list: medicinesList, prescription_text: '', patient: {
                        phone: phoneNumber,
                        name: patient.name || '',
                        age: Number(patient.age) || 0,
                        gender: patient.gender || '',
                        weight: Number(patient.weight) || 0,
                        checkups: [],
                    },
                    patient_id: patient.id as string,
                    doctor: {
                        id: user?.id || '',
                        name: user?.fullName || '',
                        hospital: user?.unsafeMetadata.hospital as string || '',
                        is_active: true,
                        is_verified: true,
                        is_approved: true,
                        is_rejected: false,
                        createdAt: new Date(),
                        patients: [],
                        prescriptions: [],
                    },
                });
            } else {
                onSubmit({
                    id: '',
                    ...formData,
                    patient: {
                        name: formData.name,
                        age: Number(formData.age),
                        gender: formData.gender,
                        weight: Number(formData.weight),
                        phone: phoneNumber,
                        checkups: [],
                    },
                    medicine_list: medicinesList,
                    prescription_text: '',
                    patient_id: '',
                    doctor: {
                        id: user?.id || '',
                        name: user?.fullName || '',
                        hospital: user?.unsafeMetadata.hospital as string || '',
                        is_active: true,
                        is_verified: true,
                        is_approved: true,
                        is_rejected: false,
                        createdAt: new Date(),
                        patients: [],
                        prescriptions: [],
                    },
                })
            }
            handleClose();
        } catch (error) {
            console.error('Error adding patient:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setCurrentStep('phone');
        setPhoneNumber('');
        setPhoneError('');
        setFoundPatient(null);
        setShowAddNewOption(false);
        setIsSearching(false);
        setFormData({
            phone: '',
            name: '',
            age: '',
            gender: '',
            weight: '',
            disease: '',
            medicines: '',
            nextAppointment: '',
            healthCheckupNeeded: false,
            suggestedHospital: '',
            suggestedDoctor: '',
            expectedTime: '',
            additionalNotes: ''
        });
        setErrors({});
        setMedicinesList([]);
        setMedicineInput({ name: '', dosage: { morning: '', afternoon: '', night: '' }, food: '', notes: '', time: new Date(), before_after_food: "" });
        setMedicineError('');
        setCustomDosage({ morning: '', afternoon: '', night: '' });
        onClose();
    };

    const updateFormData = (field: keyof PatientData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleAddMedicine = () => {
        if (!medicineInput.name.trim() || (!medicineInput.dosage.morning && !medicineInput.dosage.afternoon && !medicineInput.dosage.night) || !medicineInput.food) {
            setMedicineError('Please fill all required medicine fields.');
            return;
        }
        setMedicinesList(prev => [...prev, medicineInput]);
        setMedicineInput({ name: '', dosage: { morning: '', afternoon: '', night: '' }, food: '', notes: '', time: new Date(), before_after_food: "" });
        setCustomDosage({ morning: '', afternoon: '', night: '' });
        setMedicineError('');
    };

    const handleRemoveMedicine = (idx: number) => {
        setMedicinesList(prev => prev.filter((_, i) => i !== idx));
    };

    const handleBackToPhone = () => {
        setCurrentStep('phone');
        setErrors({});
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={currentStep === 'phone' ? "Search Patient" : "Add New Patient"}
            size="xl"
        >
            {currentStep === 'phone' ? (
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            Search by Phone Number
                        </h4>

                        <Input
                            label="Phone Number *"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="Enter patient's phone number"
                            error={phoneError}
                            disabled={loading}
                        />

                        {isSearching && (
                            <div className="flex items-center justify-center py-4">
                                <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                </svg>
                                <span className="ml-2 text-gray-600">Searching...</span>
                            </div>
                        )}

                        {foundPatient && foundPatient.length > 0 && (
                            <>
                                {foundPatient.map((patient: Patient) => (
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg" key={patient.id}>
                                        <div className="flex items-center">
                                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="text-green-800 font-medium">Patient Found!</span>
                                        </div>
                                        <p className="text-green-700 mt-1">
                                            {patient.name || 'Unnamed Patient'} - {formatPhoneNumber(patient.phone)}
                                        </p>
                                        <Button
                                            type="button"
                                            onClick={() => handlePhoneSubmit(patient)}
                                            className="mt-3 bg-green-600 hover:bg-green-700"
                                            disabled={loading}
                                        >
                                            Continue with Existing Patient
                                        </Button>
                                    </div>
                                ))}
                                <div className='flex flex-col items-center'>
                                    <span className='font-bold text-md'>Don't have record?</span>
                                    <Button className='p-2 text-black w-1/4' variant="outline" onClick={() => handlePhoneSubmit(null)}>
                                        Add Patient
                                    </Button>
                                </div>
                            </>
                        )}

                        {showAddNewOption && foundPatient.length <= 0 && !isSearching && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <span className="text-yellow-800 font-medium">Patient Not Found</span>
                                </div>
                                <p className="text-yellow-700 mt-1">
                                    No patient found with this phone number. You can add a new patient.
                                </p>
                                <Button
                                    type="button"
                                    onClick={() => handlePhoneSubmit(null)}
                                    className="mt-3 bg-yellow-600 hover:bg-yellow-700"
                                    disabled={loading}
                                >
                                    Add New Patient
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Back to Phone Search Button */}
                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBackToPhone}
                            disabled={loading}
                            className="flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Search
                        </Button>
                        <div className="text-sm text-gray-500">
                            Adding new patient for: {formatPhoneNumber(phoneNumber)}
                        </div>
                    </div>

                    {/* Basic Information Section */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            Basic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Patient Name *"
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateFormData('name', e.target.value)}
                                placeholder="Enter patient's full name"
                                error={errors.name}
                                disabled={loading}
                            />
                            <Input
                                label="Age *"
                                type="number"
                                value={formData.age}
                                onChange={(e) => updateFormData('age', e.target.value)}
                                placeholder="Enter age"
                                error={errors.age}
                                disabled={loading}
                                min="1"
                                max="150"
                            />
                            <Select
                                label="Gender *"
                                value={formData.gender}
                                onChange={(e) => updateFormData('gender', e.target.value)}
                                options={genderOptions}
                                placeholder="Select gender"
                                error={errors.gender}
                                disabled={loading}
                            />
                            <Input
                                label="Weight (kg) *"
                                type="number"
                                value={formData.weight}
                                onChange={(e) => updateFormData('weight', e.target.value)}
                                placeholder="Enter weight in kg"
                                error={errors.weight}
                                disabled={loading}
                                min="0.1"
                                step="0.1"
                            />
                        </div>
                    </div>

                    {/* Medical Information Section */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            Medical Information
                        </h4>
                        <div className="space-y-4">
                            <Textarea
                                label="Disease/Medical Condition *"
                                value={formData.disease}
                                onChange={(e) => updateFormData('disease', e.target.value)}
                                placeholder="Describe the patient's current medical condition or diagnosis"
                                error={errors.disease}
                                disabled={loading}
                                rows={3}
                            />
                            {/* Medicines List Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prescribed Medicines *</label>
                                <div className="w-full">
                                    <div className="flex gap-2 w-full ">
                                        <AutocompleteInput
                                            value={medicineInput.name}
                                            onChange={val => setMedicineInput(m => ({ ...m, name: val }))}
                                            onSelect={val => setMedicineInput(m => ({ ...m, name: val }))}
                                            placeholder="Medicine Name"
                                            disabled={loading}
                                            className='w-full'
                                        />

                                        {/* Compact Dosage Selector */}
                                        <div className="flex gap-1">
                                            {timeKeys.map((time) => (
                                                <div key={time} className="flex flex-col items-center">
                                                    <span className="text-xs text-gray-600 capitalize mb-1">{time[0]}</span>
                                                    <select
                                                        value={medicineInput.dosage[time]}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setMedicineInput(m => ({
                                                                ...m,
                                                                dosage: { ...m.dosage, [time]: val }
                                                            }));
                                                        }}
                                                        className="w-12 px-1 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        disabled={loading}
                                                    >
                                                        <option value="">-</option>
                                                        <option value="0.5">½</option>
                                                        <option value="1">1</option>
                                                        <option value="2">2</option>
                                                        <option value="custom">C</option>
                                                    </select>

                                                    {/* Custom input for custom dosage */}
                                                    {medicineInput.dosage[time] === 'custom' && (
                                                        <input
                                                            type="text"
                                                            placeholder="?"
                                                            className="w-12 px-1 py-1 text-xs border rounded mt-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                            onChange={(e) => {
                                                                setMedicineInput(m => ({
                                                                    ...m,
                                                                    dosage: { ...m.dosage, [time]: e.target.value }
                                                                }));
                                                            }}
                                                            disabled={loading}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 w-full">
                                        <Select
                                            value={medicineInput.food}
                                            onChange={e => setMedicineInput(m => ({ ...m, food: e.target.value }))}
                                            options={foodOptions}
                                            placeholder="Food Timing"
                                            disabled={loading}
                                        />
                                        <Input
                                            placeholder="Other notes"
                                            value={medicineInput.notes}
                                            onChange={e => setMedicineInput(m => ({ ...m, notes: e.target.value }))}
                                            disabled={loading}
                                        />
                                        <Button type="button" onClick={handleAddMedicine} disabled={loading}>Add</Button>
                                    </div>
                                </div>
                                {medicineError && <p className="text-xs text-red-600 mt-1">{medicineError}</p>}
                                {errors.medicines && <p className="text-xs text-red-600 mt-1">{errors.medicines}</p>}
                                {/* Medicines List Table */}
                                {medicinesList.length > 0 && (
                                    <div className="mt-2 max-h-32 overflow-y-auto border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="text-xs font-semibold">Name</TableHead>
                                                    <TableHead className="text-xs font-semibold">Dosage</TableHead>
                                                    <TableHead className="text-xs font-semibold">Food</TableHead>
                                                    <TableHead className="text-xs font-semibold">Notes</TableHead>
                                                    <TableHead className="text-xs font-semibold w-8">Close</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {medicinesList.map((med, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="text-xs font-bold text-gray-900">
                                                            {med.name}
                                                        </TableCell>
                                                        <TableCell className="text-xs flex gap-2">
                                                            {timeKeys.map((t) => (
                                                                med.dosage[t] ? (
                                                                    <div key={t} className="text-xs">
                                                                        {med.dosage[t]}
                                                                    </div>
                                                                ) : null
                                                            ))}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            {foodOptions.find(opt => opt.value === med.food)?.label}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-gray-900">
                                                            {med.notes}
                                                        </TableCell>
                                                        <TableCell className="text-xs">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveMedicine(idx)}
                                                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Appointment Section */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            Follow-up Appointment
                        </h4>
                        <Calendar
                            label="Next Appointment Date"
                            value={formData.nextAppointment}
                            onChange={val => updateFormData('nextAppointment', val)}
                            error={errors.nextAppointment}
                            disabled={false}
                        />
                    </div>

                    {/* Health Checkup Section */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2V7a2 2 0 012-2z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                </svg>
                            </div>
                            Health Checkup Requirements
                        </h4>

                        <div className="space-y-4">
                            <label className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={formData.healthCheckupNeeded}
                                    onChange={(e) => updateFormData('healthCheckupNeeded', e.target.checked)}
                                    disabled={loading}
                                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Health-related checkup needed
                                </span>
                            </label>

                            {formData.healthCheckupNeeded && (
                                <div className="pl-7 space-y-4 border-l-2 border-green-200">
                                    <Select
                                        label="Suggested Hospital *"
                                        value={formData.suggestedHospital}
                                        onChange={(e) => updateFormData('suggestedHospital', e.target.value)}
                                        options={hospitalOptions}
                                        placeholder="Select recommended hospital"
                                        error={errors.suggestedHospital}
                                        disabled={loading}
                                    />
                                    <Select
                                        label="Suggested Doctor *"
                                        value={formData.suggestedDoctor}
                                        onChange={(e) => updateFormData('suggestedDoctor', e.target.value)}
                                        options={doctorOptions}
                                        placeholder="Select recommended specialist"
                                        error={errors.suggestedDoctor}
                                        disabled={loading}
                                    />
                                    <Input
                                        label="Expected Time for Checkup *"
                                        type="text"
                                        value={formData.expectedTime}
                                        onChange={(e) => updateFormData('expectedTime', e.target.value)}
                                        placeholder="e.g., Within 1 week, 2-3 days, ASAP"
                                        error={errors.expectedTime}
                                        disabled={loading}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Notes Section */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            Additional Notes
                        </h4>
                        <Textarea
                            label="Additional Information"
                            value={formData.additionalNotes}
                            onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                            placeholder="Any additional notes, observations, or special instructions"
                            disabled={loading}
                            rows={3}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                            loading={loading}
                        >
                            Add Patient
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default AddPatientModal; 