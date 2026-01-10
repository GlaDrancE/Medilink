'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from './ui/modal';
import Input from './ui/input';
import Select from './ui/select';
import Textarea from './ui/Textarea';
import { Button } from '@/components/ui/button';
import AutocompleteInput from './ui/AutocompleteInput';
import Calendar from './ui/calendar';
import type { Document as PatientDocument, MedicineEntry, Patient, Prescriptions } from '@/types';
import { createPatient, searchPatientByPhone } from '@/services/api.routes';
import { validatePhoneNumber, formatPhoneNumber } from '@/lib/validation';
import { useUser } from '@clerk/nextjs';
import { X, Pill, FlaskRound, Stethoscope, Calendar as CalendarIcon, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useDoctor } from '@/hooks/useDoctor';
import Image from 'next/image';

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
    height: string;

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

const COMMON_MEDICAL_CONDITIONS = [
    'Fever, Cold, and Cough',
    'Diarrhea and Stomach Upset',
    'Minor Injuries',
    'Skin Rashes and Infections',
    'Headaches and Body Aches',
    'Indigestion',
    'Acidity',
    'Prenatal Check-ups',
    'Diabetes',
    'Hypertension',
    'Prescription Refills'
];

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
    const { doctor } = useDoctor();

    // Debounce for phone search
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Form data (only used when adding new patient)
    const [formData, setFormData] = useState<PatientData>({
        phone: '',
        name: '',
        age: '',
        gender: '',
        weight: '',
        height: '',
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
        id: "",
        name: '',
        dosage: { morning: '', afternoon: '', night: '' },
        time: new Date().toString(),
        before_after_food: "",
        prescription_id: ""
    });
    const [medicineError, setMedicineError] = useState<string>('');
    const [showConditionDropdown, setShowConditionDropdown] = useState(false);
    const [filteredConditions, setFilteredConditions] = useState<string[]>([]);
    const [currentSearchTerm, setCurrentSearchTerm] = useState<string>('');
    const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // Tabs within form step
    const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

    // Patient history state (placeholder shape; to be wired with API later)
    const [historyLoading, setHistoryLoading] = useState(false);
    const [patientHistory, setPatientHistory] = useState<{
        labTests: Array<{ id: string; name: string; date: string; summary?: string; pdfUrl?: string }>,
        prescriptions: Array<Prescriptions | PatientDocument>,
        diagnoses: Array<{ id: string; name: string; severity?: 'low' | 'medium' | 'high' }>,
        visits: Array<{ id: string; date: string; location?: string; note?: string }>
    }>({ labTests: [], prescriptions: [], diagnoses: [], visits: [] });
    const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
        labs: true,
        prescriptions: true,
        diagnoses: true,
        visits: true,
    });
    const [showAllLabs, setShowAllLabs] = useState(false);
    const [expandedLabTests, setExpandedLabTests] = useState<Record<string, boolean>>({});
    const [showAllPrescriptionDocs, setShowAllPrescriptionDocs] = useState(false);
    const [expandedPrescriptionDocs, setExpandedPrescriptionDocs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        // Fetch history lazily when switching to history tab and a patient is known
        const fetchHistory = async () => {
            if (!patient?.id) return;
            setHistoryLoading(true);
            try {
                // TODO: Replace with real API call (doctor-facing) to fetch patient history by id
                // For now, keep placeholders so UI is scannable even without data
                // setPatientHistory(prev => ({
                //     ...prev,
                //     prescriptions: [],
                //     labTests: [],
                //     diagnoses: [],
                //     visits: [],
                // }));
            } catch (e) {
                // noop
            } finally {
                setHistoryLoading(false);
            }
        };

        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab, patient?.id]);

    const toggleSection = (key: 'labs' | 'prescriptions' | 'diagnoses' | 'visits') => {
        setExpandedSections(s => ({ ...s, [key]: !s[key] }));
    };

    const toggleLabTest = (id: string) => {
        setExpandedLabTests(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const togglePrescriptionDoc = (id: string) => {
        setExpandedPrescriptionDocs(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const isPdfUrl = (url: string | undefined) => {
        if (!url) return false;
        return /\.pdf(\?|$)/i.test(url);
    };

    const isImageUrl = (url: string | undefined) => {
        if (!url) return false;
        return /\.(png|jpe?g|gif|bmp|webp|svg)(\?|$)/i.test(url);
    };

    const isPatientDocument = (
        item: Prescriptions | PatientDocument
    ): item is PatientDocument => {
        return (item as PatientDocument).file_url !== undefined;
    };

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

    useEffect(() => {
        if (patient) {
            // Initialize categorized history
            const categorized = {
                labTests: [] as Array<{ id: string; name: string; date: string; summary?: string; pdfUrl?: string }>,
                prescriptions: [] as Array<Prescriptions | PatientDocument>,
                diagnoses: [] as Array<{ id: string; name: string; severity?: 'low' | 'medium' | 'high' }>,
                visits: [] as Array<{ id: string; date: string; location?: string; note?: string }>
            };

            // Add all prescriptions from patient.prescriptions
            if (patient.prescriptions && Array.isArray(patient.prescriptions)) {
                categorized.prescriptions = [...patient.prescriptions];
            }

            // Categorize documents by type
            if (patient.documents && Array.isArray(patient.documents)) {
                patient.documents.forEach((doc) => {
                    switch (doc.type?.toLowerCase()) {
                        case 'lab':
                            categorized.labTests.push({
                                id: doc.id,
                                name: doc.name || 'Lab Test',
                                date: doc.createdAt || new Date().toISOString(),
                                pdfUrl: doc.file_url
                            });
                            break;
                        case 'prescription':
                            // Add prescription documents to prescriptions array
                            categorized.prescriptions.push({
                                id: doc.id,
                                file_url: doc.file_url,
                                type: doc.type,
                                name: doc.name,
                                createdAt: doc.createdAt,
                                updatedAt: doc.updatedAt
                            } as PatientDocument);
                            break;
                        case 'diagnosis':
                            categorized.diagnoses.push({
                                id: doc.id,
                                name: doc.name || 'Diagnosis Document',
                                severity: 'medium' // Default severity
                            });
                            break;
                        case 'visit':
                            categorized.visits.push({
                                id: doc.id,
                                date: doc.createdAt || new Date().toISOString(),
                                location: doc.name || undefined,
                                note: undefined
                            });
                            break;
                        default:
                            categorized.diagnoses.push({
                                id: doc.id,
                                name: doc.name || 'Diagnosis Document',
                                severity: 'medium' // Default severity
                            });
                            break;
                    }
                });
            }

            // Sort prescriptions by date (newest first)
            categorized.prescriptions.sort((a, b) => {
                const dateA = isPatientDocument(a)
                    ? new Date(a.createdAt).getTime()
                    : new Date(a.createdAt).getTime();
                const dateB = isPatientDocument(b)
                    ? new Date(b.createdAt).getTime()
                    : new Date(b.createdAt).getTime();
                return dateB - dateA;
            });

            // Sort lab tests by date (newest first)
            categorized.labTests.sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            // Sort visits by date (newest first)
            categorized.visits.sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            setPatientHistory(categorized);
        } else {
            // Reset history when patient is cleared
            setPatientHistory({
                labTests: [],
                prescriptions: [],
                diagnoses: [],
                visits: []
            });
        }
    }, [patient]);


    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (dropdownTimeoutRef.current) {
                clearTimeout(dropdownTimeoutRef.current);
            }
        };
    }, []);

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
            console.log("patient", patient)
            setPatient(patient)
            setFormData(prev => ({ ...prev, phone: patient.phone, name: patient.name || "", weight: patient.weight.toString(), age: patient.age.toString(), gender: patient.gender || "" }))
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
                    ...formData, medicine_list: medicinesList, prescription_text: '',
                    patient: {
                        id: '',
                        phone: phoneNumber,
                        name: patient.name || '',
                        age: Number(patient.age) || 0,
                        gender: patient.gender || 'Male',
                        weight: Number(patient.weight) || 0,
                        height: Number(patient.height) || 0,
                        is_active: true,
                    },

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
                    patient_id: patient.id as string,
                    prescription_date: new Date().toString(),
                    is_active: true,
                    nextAppointment: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
            } else {
                onSubmit({
                    id: '',
                    ...formData,
                    patient: {
                        id: '',
                        name: formData.name,
                        age: Number(formData.age),
                        gender: formData.gender,
                        weight: Number(formData.weight),
                        height: Number(formData.height),
                        phone: phoneNumber,
                        is_active: true,
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
                    prescription_date: new Date().toString(),
                    is_active: true,
                    nextAppointment: new Date(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }
            handleClose();
            const emailContent =
                `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Prescription Added</title>
                <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f6f8fb;
                    margin: 0;
                    padding: 0;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h2 {
                    margin: 0;
                    color: #333333;
                }
                .content {
                    font-size: 16px;
                    color: #444444;
                    line-height: 1.6;
                }
                .cta-button {
                    display: inline-block;
                    margin-top: 25px;
                    padding: 12px 24px;
                    background-color: #007bff;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                }
                .footer {
                    margin-top: 30px;
                    font-size: 14px;
                    color: #888888;
                    text-align: center;
                }
                </style>
            </head>
            <body>
                <div class="email-container">
                <div class="header">
                    <h2>Your Prescription is Ready</h2>
                </div>
                <div class="content">
                    <p>Dear <strong>${formData.name}</strong>,</p>
                    <p>
                    Thank you for visiting <strong>${doctor?.hospital}</strong>. We’d like to inform you
                    that your doctor, <strong>Dr. ${doctor?.name}</strong>, has added your
                    prescription to your patient portal.
                    </p>
                    <p>
                    You can now access, download, or share your prescription at any time.
                    </p>
                    <p style="text-align: center;">
                    <a href="{{PortalLink}}" class="cta-button">View Prescription</a>
                    </p>
                    <p>
                    If you need any assistance, feel free to contact us at
                    <a href="mailto:ayushr16060@gmail.com">Developer's email</a>.
                    </p>
                </div>
                <div class="footer">
                    Wishing you a speedy recovery,<br />
                    <strong>Team ${doctor?.hospital}</strong>
                </div>
                </div>
            </body>
            </html>
            `
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
            height: '',
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
        setMedicineInput({ id: "", name: '', dosage: { morning: '', afternoon: '', night: '' }, time: new Date().toString(), before_after_food: "", prescription_id: "" });
        setMedicineError('');
        setCustomDosage({ morning: '', afternoon: '', night: '' });
        // Clear dropdown timeout
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
            dropdownTimeoutRef.current = null;
        }
        setShowConditionDropdown(false);
        setFilteredConditions([]);
        setCurrentSearchTerm('');
        onClose();
    };

    const updateFormData = (field: keyof PatientData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleAddCondition = (condition: string) => {
        // Clear any pending timeout
        if (dropdownTimeoutRef.current) {
            clearTimeout(dropdownTimeoutRef.current);
            dropdownTimeoutRef.current = null;
        }

        const currentDisease = formData.disease;

        if (currentDisease.trim() === '') {
            // If field is empty, just set the condition
            updateFormData('disease', condition);
        } else if (currentSearchTerm) {
            // If we have a search term, try to replace it
            // Get the last part after the last comma
            const parts = currentDisease.split(',').map(p => p.trim());
            const lastPart = parts[parts.length - 1] || '';

            // Check if the last part contains the search term
            const lastPartLower = lastPart.toLowerCase().trim();
            const searchTermLower = currentSearchTerm.toLowerCase().trim();

            if (lastPartLower === searchTermLower) {
                // Last part is exactly the search term, replace the entire last part
                let newValue = '';
                if (parts.length > 1) {
                    newValue = parts.slice(0, -1).join(', ') + ', ' + condition;
                } else {
                    newValue = condition;
                }
                updateFormData('disease', newValue);
            } else if (lastPartLower.includes(searchTermLower)) {
                // Search term is somewhere in the last part, replace just that part
                const searchIndex = lastPartLower.indexOf(searchTermLower);
                const beforeSearch = lastPart.substring(0, searchIndex).trim();
                const afterSearch = lastPart.substring(searchIndex + currentSearchTerm.length).trim();

                // Rebuild: keep previous parts, replace search term in last part
                let newValue = '';
                if (parts.length > 1) {
                    newValue = parts.slice(0, -1).join(', ') + ', ';
                }

                // Add condition (replacing the search term)
                if (beforeSearch) newValue += beforeSearch + ' ';
                newValue += condition;
                if (afterSearch) newValue += ' ' + afterSearch;

                updateFormData('disease', newValue.trim());
            } else {
                // Search term not found in last part, append normally
                const separator = currentDisease.trim().endsWith(',') ? ' ' : ', ';
                updateFormData('disease', currentDisease.trim() + separator + condition);
            }
        } else {
            // No search term, append with comma if not already present
            const separator = currentDisease.trim().endsWith(',') ? ' ' : ', ';
            updateFormData('disease', currentDisease.trim() + separator + condition);
        }

        setShowConditionDropdown(false);
        setFilteredConditions([]);
        setCurrentSearchTerm('');
    };

    // Filter conditions based on textarea input
    const handleDiseaseChange = (value: string) => {
        updateFormData('disease', value);

        // Get the last word or phrase being typed (after the last comma or space)
        // This handles cases like "c", "co", "cough", etc.
        const parts = value.split(',').map(p => p.trim());
        const lastPart = parts[parts.length - 1] || '';

        // Also check if there's a space-separated word at the end
        const words = lastPart.split(/\s+/);
        const searchTerm = words[words.length - 1] || lastPart;

        // Store the original search term (with original case) for replacement
        setCurrentSearchTerm(searchTerm);

        if (searchTerm.length > 0) {
            // Filter conditions that match the typed text (case-insensitive)
            const filtered = COMMON_MEDICAL_CONDITIONS.filter(condition =>
                condition.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredConditions(filtered);
            setShowConditionDropdown(filtered.length > 0 && searchTerm.length > 0);
        } else {
            setFilteredConditions([]);
            setShowConditionDropdown(false);
            setCurrentSearchTerm('');
        }
    };

    const handleAddMedicine = () => {
        if (!medicineInput.name.trim() || (!medicineInput.dosage.morning && !medicineInput.dosage.afternoon && !medicineInput.dosage.night)) {
            setMedicineError('Please fill all required medicine fields.');
            return;
        }
        setMedicinesList(prev => [...prev, medicineInput]);
        setMedicineInput({ id: "", name: '', dosage: { morning: '', afternoon: '', night: '' }, time: new Date().toString(), before_after_food: "", prescription_id: "" });
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
            size='screen'
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
                <div className="space-y-4">
                    {/* Tabs */}
                    <div className="flex sticky top-0 bg-accent z-50 items-center gap-2 border-b border-gray-200">
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'details' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                            onClick={() => setActiveTab('details')}
                            disabled={loading}
                        >
                            Add Details
                        </button>
                        <button
                            type="button"
                            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${activeTab === 'history' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-600 hover:text-gray-800'}`}
                            onClick={() => setActiveTab('history')}
                            disabled={loading}
                        >
                            History
                        </button>
                    </div>
                    <div className='p-6'>
                        {activeTab === 'details' ? (
                            <form onSubmit={handleSubmit} className="space-y-8">
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
                                        <div className='border-2 border-muted rounded-xl p-2 relative'>
                                            <Textarea
                                                label=""
                                                value={formData.disease}
                                                onChange={(e) => handleDiseaseChange(e.target.value)}
                                                onFocus={() => {
                                                    // Show all conditions when focusing on empty field
                                                    if (!formData.disease.trim()) {
                                                        setFilteredConditions(COMMON_MEDICAL_CONDITIONS);
                                                        setShowConditionDropdown(true);
                                                    }
                                                }}
                                                onBlur={() => {
                                                    // Close dropdown after a delay to allow button clicks
                                                    dropdownTimeoutRef.current = setTimeout(() => {
                                                        setShowConditionDropdown(false);
                                                        setFilteredConditions([]);
                                                    }, 200);
                                                }}
                                                placeholder="Describe the patient's current medical condition or diagnosis"
                                                error={errors.disease}
                                                disabled={loading}
                                                className='border-none'
                                                rows={3}
                                            />
                                            {/* Autocomplete Dropdown / Common Conditions Quick Select */}
                                            <div className="mt-2">
                                                {showConditionDropdown && filteredConditions.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {filteredConditions.map((condition) => (
                                                            <button
                                                                key={condition}
                                                                type="button"
                                                                onMouseDown={(e) => {
                                                                    // Prevent blur event when clicking button
                                                                    e.preventDefault();
                                                                }}
                                                                onClick={() => handleAddCondition(condition)}
                                                                disabled={loading}
                                                                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {condition}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {COMMON_MEDICAL_CONDITIONS.map((condition) => (
                                                            <button
                                                                key={condition}
                                                                type="button"
                                                                onClick={() => handleAddCondition(condition)}
                                                                disabled={loading}
                                                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {condition}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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

                                                <div className="flex gap-2 w-full mt-2">
                                                    <div className="flex items-center gap-2">
                                                        {foodOptions.map(opt => (
                                                            <label key={opt.value} className="flex items-center text-xs gap-1">
                                                                <input
                                                                    type="radio"
                                                                    name="before_after_food"
                                                                    value={opt.value}
                                                                    checked={medicineInput.before_after_food === opt.value}
                                                                    onChange={e => setMedicineInput(m => ({ ...m, before_after_food: e.target.value }))}
                                                                    disabled={loading}
                                                                />
                                                                {opt.label}
                                                            </label>
                                                        ))}
                                                    </div>
                                                    <Input
                                                        placeholder="Other notes"
                                                        value={medicineInput.notes}
                                                        onChange={e => setMedicineInput(m => ({ ...m, notes: e.target.value }))}
                                                        disabled={loading}
                                                        className='!p-1'
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
                                                                            ) : <span className='text-xs'>-</span>
                                                                        ))}
                                                                    </TableCell>
                                                                    <TableCell className="text-xs">
                                                                        {foodOptions.find(opt => opt.value === med.before_after_food)?.label}
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
                                        // today={true}
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
                        ) : (
                            <div className="space-y-6">
                                {/* Summary */}
                                {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="p-3 rounded-md border bg-white flex items-center gap-2">
                                        <FlaskRound className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm text-gray-700">Lab Tests</span>
                                        <span className="ml-auto text-xs text-gray-500">{patientHistory.labTests.length}</span>
                                    </div>
                                    <div className="p-3 rounded-md border bg-white flex items-center gap-2">
                                        <Pill className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-700">Prescriptions</span>
                                        <span className="ml-auto text-xs text-gray-500">{patientHistory.prescriptions.length}</span>
                                    </div>
                                    <div className="p-3 rounded-md border bg-white flex items-center gap-2">
                                        <Stethoscope className="w-4 h-4 text-rose-600" />
                                        <span className="text-sm text-gray-700">Diagnoses</span>
                                        <span className="ml-auto text-xs text-gray-500">{patientHistory.diagnoses.length}</span>
                                    </div>
                                    <div className="p-3 rounded-md border bg-white flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm text-gray-700">Visits</span>
                                        <span className="ml-auto text-xs text-gray-500">{patientHistory.visits.length}</span>
                                    </div>
                                </div> */}

                                {historyLoading && (
                                    <div className="flex items-center justify-center py-6 text-sm text-gray-600">Loading history…</div>
                                )}

                                {/* 🧪 Lab Tests */}
                                <div className="border rounded-md">
                                    <button type="button" className="w-full px-4 py-2 flex items-center gap-2" onClick={() => toggleSection('labs')}>
                                        <FlaskRound className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm font-medium">Lab Tests</span>
                                        <span className="ml-2 text-xs text-gray-500">(latest 3)</span>
                                        <span className="ml-auto text-xs text-gray-500">{patientHistory.labTests.length}</span>
                                        {expandedSections.labs ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </button>
                                    {expandedSections.labs && (
                                        <div className="px-4 pb-3 space-y-2">
                                            {(!patient || !patient.documents || (patient.documents.filter(d => d.type === 'lab')).length === 0) && (
                                                <div className="text-sm text-gray-500">No reports.</div>
                                            )}
                                            {patient?.documents?.length && (patient.documents.filter(doc => doc.type === 'lab').slice(0, 3)).map((test, index) => {
                                                return (
                                                    <div key={test.id} className="border rounded-md">
                                                        <button
                                                            type="button"
                                                            className="w-full px-3 py-2 flex items-center justify-between"
                                                            onClick={() => toggleLabTest(String(test.id))}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-sm text-[#${Math.floor(Math.random() * 16777215).toString(16)}] font-bold`}>{index + 1}.</span>
                                                                <span className="text-sm text-gray-800">{test.name || patient.name}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-gray-500">{test?.createdAt ? new Date(test.createdAt).toLocaleDateString() : ''}</span>
                                                                {expandedLabTests[String(test.id)] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                                            </div>
                                                        </button>
                                                        {expandedLabTests[String(test.id)] && (
                                                            <div className="px-3 pb-3">
                                                                {isImageUrl(test.file_url) && (
                                                                    <img src={test.file_url} alt={test.name} className="w-full max-h-80 object-contain rounded" />
                                                                )}
                                                                {isPdfUrl(test.file_url) && (
                                                                    <div className="w-full h-80">
                                                                        <iframe src={test.file_url || ''} className="w-full h-full rounded" title={test.name}></iframe>
                                                                    </div>
                                                                )}
                                                                {!isImageUrl(test.file_url) && !isPdfUrl(test.file_url) && (
                                                                    <div className="text-xs text-gray-500">No preview available.</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                            {patient?.documents?.length && (patient?.documents.filter(doc => doc.type === 'lab')).length > 3 && (
                                                <div className="pt-1">
                                                    <Button type="button" size="sm" variant="outline" onClick={() => setShowAllLabs(s => !s)}>
                                                        {showAllLabs ? 'Show Less' : 'View All'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 💊 Previous Prescriptions */}
                                <div className="border rounded-md">
                                    <button type="button" className="w-full px-4 py-2 flex items-center gap-2" onClick={() => toggleSection('prescriptions')}>
                                        <Pill className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium">Previous Prescriptions</span>
                                        <span className="ml-2 text-xs text-gray-500">(latest 3)</span>
                                        <span className="ml-auto text-xs text-gray-500">{patientHistory.prescriptions.length}</span>
                                        {expandedSections.prescriptions ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </button>
                                    {expandedSections.prescriptions && (
                                        <div className="px-4 pb-3 space-y-2">
                                            {patientHistory.prescriptions.length === 0 && (
                                                <div className="text-sm text-gray-500">No prescriptions.</div>

                                            )}
                                            {(patientHistory.prescriptions)
                                                .slice(0, showAllPrescriptionDocs ? undefined : 3)
                                                .map((prescription, index) => (


                                                    <div key={index} className="border rounded-md">
                                                        <button
                                                            type="button"
                                                            className="w-full px-3 py-2 flex items-center justify-between"
                                                            onClick={() => togglePrescriptionDoc(String(prescription.id))}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-gray-600" />
                                                                <span className="text-sm text-gray-800">{prescription?.name || patient?.name || 'Prescription'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs text-gray-500">{prescription?.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : ''}</span>
                                                                {expandedPrescriptionDocs[String(prescription.id)] ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                                            </div>
                                                        </button>
                                                        {expandedPrescriptionDocs && expandedPrescriptionDocs[String(prescription.id)] && (isPatientDocument(prescription) ? (
                                                            <div className="px-3 pb-3">
                                                                {isImageUrl(prescription.file_url) && (
                                                                    <img src={prescription.file_url} alt={prescription.name} className="w-full max-h-80 object-contain rounded" />
                                                                )}
                                                                {isPdfUrl(prescription.file_url) && (
                                                                    <div className="w-full h-80">
                                                                        <iframe src={prescription.file_url || ''} className="w-full h-full rounded" title={prescription.name}></iframe>
                                                                    </div>
                                                                )}
                                                                {!isImageUrl(prescription.file_url) && !isPdfUrl(prescription.file_url) && (
                                                                    <div className="text-xs text-gray-500">No preview available.</div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div key={index} className="rounded-md border p-2 bg-white">
                                                                <div className="text-xs font-semibold text-gray-700 mb-1">Medicines</div>
                                                                <div className="overflow-auto">
                                                                    <Table>
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead className="text-xs font-semibold">Medicine</TableHead>
                                                                                <TableHead className="text-xs font-semibold">Dosage</TableHead>
                                                                                <TableHead className="text-xs font-semibold">Duration</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                        <TableBody>
                                                                            {prescription.medicine_list.map((med) => (
                                                                                <TableRow key={med.id}>
                                                                                    <TableCell className="text-xs font-medium text-gray-900">{med.name}</TableCell>
                                                                                    <TableCell className="text-[11px] text-gray-800">
                                                                                        <div className="flex gap-1 items-center">
                                                                                            <span className="px-1 rounded bg-gray-100">M: {med.dosage.morning || '-'}</span>
                                                                                            <span className="px-1 rounded bg-gray-100">A: {med.dosage.afternoon || '-'}</span>
                                                                                            <span className="px-1 rounded bg-gray-100">N: {med.dosage.night || '-'}</span>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                    <TableCell className="text-[11px] text-gray-800">{med.notes || '-'}</TableCell>
                                                                                </TableRow>
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                                </div>
                                                                <div className="mt-2 pt-2 border-t">
                                                                    <div className="text-xs font-semibold text-gray-700 mb-1">Suggested Checkups / Tests</div>
                                                                    {prescription.checkups && prescription.checkups.length > 0 ? (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {prescription.checkups.map((c) => (
                                                                                <span key={c.id} className="text-xs font-bold text-gray-900">{c.name}</span>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-[11px] text-gray-500">None</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                                )
                                            }

                                            {patientHistory.prescriptions.length > 3 && (
                                                <div className="pt-1">
                                                    <Button type="button" size="sm" variant="outline" onClick={() => setShowAllPrescriptionDocs(s => !s)}>
                                                        {showAllPrescriptionDocs ? 'Show Less' : 'View All'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* 🏥 Diagnoses/Conditions */}
                                <div className="border rounded-md">
                                    <button type="button" className="w-full px-4 py-2 flex items-center gap-2" onClick={() => toggleSection('diagnoses')}>
                                        <Stethoscope className="w-4 h-4 text-rose-600" />
                                        <span className="text-sm font-medium">Diagnoses / Conditions</span>
                                        <span className="ml-auto text-xs text-gray-500">{patientHistory.diagnoses.length}</span>
                                        {expandedSections.diagnoses ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </button>
                                    {expandedSections.diagnoses && (
                                        <div className="px-4 pb-3 space-y-2">
                                            {patientHistory.diagnoses.length === 0 && (
                                                <div className="text-sm text-gray-500">No diagnoses.</div>
                                            )}
                                            {patientHistory.diagnoses.map(d => (
                                                <div key={d.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${d.severity === 'high' ? 'bg-red-100 text-red-700' : d.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{d.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* 📅 Visit Timeline */}
                                <div className="border rounded-md">
                                    <button type="button" className="w-full px-4 py-2 flex items-center gap-2" onClick={() => toggleSection('visits')}>
                                        <CalendarIcon className="w-4 h-4 text-emerald-600"
                                        />

                                        <span className="text-sm font-medium">Visit Timeline</span>
                                        <span className="ml-auto text-xs text-gray-500">{patientHistory.visits.length}</span>
                                        {expandedSections.visits ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                    </button>
                                    {expandedSections.visits && (
                                        <div className="px-4 pb-3 space-y-2">
                                            {patientHistory.visits.length === 0 && (
                                                <div className="text-sm text-gray-500">No visits.</div>
                                            )}
                                            <div className="overflow-auto">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="text-xs">Date</TableHead>
                                                            <TableHead className="text-xs">Location</TableHead>
                                                            <TableHead className="text-xs">Notes</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {patientHistory.visits.map(v => (
                                                            <TableRow key={v.id}>
                                                                <TableCell className="text-xs">{new Date(v.date).toLocaleString()}</TableCell>
                                                                <TableCell className="text-xs">{v.location || '-'}</TableCell>
                                                                <TableCell className="text-xs">{v.note || '-'}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default AddPatientModal; 