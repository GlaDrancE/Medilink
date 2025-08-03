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
import { getPatientById, getPrescription } from '@/services/api.routes';
import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';

const MedicalDashboard = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [expandedPrescription, setExpandedPrescription] = useState(0);
    const [completedCheckups, setCompletedCheckups] = useState<{ [key: string]: boolean }>({});
    const [prescriptions, setPrescriptions] = useState<Prescriptions[]>([]);
    const [patient, setPatient] = useState<Patient>({
        id: '',
        name: 'John Smith',
        age: 32,
        weight: 70,
        phone: '+91 98765 43210',
        email: 'john.smith@email.com',
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
    // Calculate BMI
    const calculateBMI = (weight: number, height: number) => {
        if (!weight || !height) return 0;
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return bmi.toFixed(1);
    };

    // Helper function to format date string
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString();
    };

    const toggleCheckup = (checkupId: string) => {
        setCompletedCheckups(prev => ({
            ...prev,
            [checkupId]: !prev[checkupId]
        }));
    };

    const handleExpandPrescription = (index: number) => {
        setExpandedPrescription(expandedPrescription === index ? -1 : index);
    };

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
    const PrescriptionWindow = ({ prescription, isRecent = false }: { prescription: Prescriptions, isRecent: boolean }) => (
        <>
            {prescription && (
                <Card className="w-full mb-4 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold text-gray-800">
                                {isRecent ? 'Recent Prescription' : `Prescription - ${formatDate(prescription.createdAt)}`}
                            </CardTitle>
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(prescription.createdAt)}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Medicines */}
                        <div className="space-y-3">
                            {prescription.medicine_list.map((medicine: MedicineEntry, idx: number) => (
                                <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-medium text-gray-800">{medicine.name}</h4>
                                    </div>

                                    {/* Dosage Grid */}
                                    <div className="grid grid-cols-3 gap-2 mb-3">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 mb-1">Morning</div>
                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium min-h-[28px] flex items-center justify-center">
                                                {medicine.dosage.morning || '-'}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 mb-1">Afternoon</div>
                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium min-h-[28px] flex items-center justify-center">
                                                {medicine.dosage.afternoon || '-'}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-500 mb-1">Night</div>
                                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium min-h-[28px] flex items-center justify-center">
                                                {medicine.dosage.night || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center text-sm text-gray-600 mb-1">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {formatDate(medicine.time)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Take: </span>
                                        {medicine.before_after_food} food
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Checkups */}
                        {prescription.checkups && prescription.checkups.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium text-gray-800 flex items-center">
                                    <Stethoscope className="w-4 h-4 mr-2" />
                                    Recommended Checkups
                                </h4>
                                {prescription.checkups.map((checkup) => (
                                    <div key={checkup.id} className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                                        <span className="text-sm text-gray-700">{checkup.name}</span>
                                        <Button
                                            size="sm"
                                            variant={completedCheckups[checkup.id] || checkup.completed ? "default" : "outline"}
                                            onClick={() => toggleCheckup(checkup.id)}
                                            className="h-8"
                                        >
                                            <Check className="w-4 h-4 mr-1" />
                                            {completedCheckups[checkup.id] || checkup.completed ? 'Done' : 'Mark Done'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <Separator />

                        {/* Prescription Details */}
                        <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Prescription Details</h4>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-600">Prescription ID: {prescription.id}</p>
                                <p className="text-gray-600">Date: {formatDate(prescription.prescription_date)}</p>
                                {prescription.prescription_text && (
                                    <p className="text-gray-600">Notes: {prescription.prescription_text}</p>
                                )}
                            </div>
                        </div>
                        <Separator />
                        <div className="bg-green-50 p-3 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Doctor Details</h4>
                            <div className="space-y-1 text-sm">
                                <p className="text-gray-600">Name: {prescription.doctor.name}</p>
                                <p className="text-gray-600">Specialization: {prescription.doctor.specialization}</p>
                                <p className="text-gray-600">Hospital: {prescription.doctor.hospital}</p>
                                <p className="text-gray-600">Experience: {prescription.doctor.experience}   </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    );

    const HomePage = () => (
        <div className="space-y-4">
            {/* Recent Prescription */}
            {patient.prescriptions && patient.prescriptions.length > 0 && (
                <PrescriptionWindow prescription={patient.prescriptions[0] as Prescriptions} isRecent={true} />
            )}

            {/* Other Prescriptions */}
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Previous Prescriptions</h3>
                {patient.prescriptions && patient.prescriptions.slice(1, 5).map((prescription, index) => (
                    <div key={prescription.id}>
                        <Card
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleExpandPrescription(index + 1)}
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-gray-800">Prescription - {formatDate(prescription.createdAt)}</p>
                                        <p className="text-sm text-gray-600">ID: {prescription.id}</p>
                                    </div>
                                    {expandedPrescription === index + 1 ?
                                        <ChevronUp className="w-5 h-5 text-gray-500" /> :
                                        <ChevronDown className="w-5 h-5 text-gray-500" />
                                    }
                                </div>
                            </CardContent>
                        </Card>
                        {expandedPrescription === index + 1 && (
                            <div className="mt-2">
                                <PrescriptionWindow prescription={prescription} isRecent={false} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const PrescriptionPage = () => (
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">All Prescriptions</h2>
            {patient.prescriptions && patient.prescriptions.map((prescription, index) => (
                <div key={prescription.id}>
                    <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleExpandPrescription(index)}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">Prescription - {formatDate(prescription.createdAt)}</p>
                                    <p className="text-sm text-gray-600">ID: {prescription.id}</p>
                                </div>
                                {expandedPrescription === index ?
                                    <ChevronUp className="w-5 h-5 text-gray-500" /> :
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                }
                            </div>
                        </CardContent>
                    </Card>
                    {expandedPrescription === index && (
                        <div className="mt-2">
                            <PrescriptionWindow prescription={prescription} isRecent={false} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    const AccountPage = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Account Details</h2>
                <Button
                    size="sm"
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                >
                    {isEditing ? (
                        <>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                        </>
                    ) : (
                        <>
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                        </>
                    )}
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={userDetails.name}
                                onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                value={userDetails.age}
                                onChange={(e) => setUserDetails({ ...userDetails, age: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                                id="weight"
                                value={userDetails.weight}
                                onChange={(e) => setUserDetails({ ...userDetails, weight: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                                id="height"
                                value={userDetails.height}
                                onChange={(e) => setUserDetails({ ...userDetails, height: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="bmi">BMI</Label>
                            <Input
                                id="bmi"
                                value={calculateBMI(Number(userDetails.weight), Number(userDetails.height))}
                                disabled={true}
                                className="mt-1 bg-gray-100"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={userDetails.phone}
                                onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={userDetails.email}
                                onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-gray-800">Welcome, {patient.name}</h1>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                            <span>Age: {patient.age}</span>
                            <span>Weight: {patient.weight}kg</span>
                            <span>Phone: {patient.phone}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {activeTab === 'home' && <HomePage />}
                {activeTab === 'prescriptions' && <PrescriptionPage />}
                {activeTab === 'account' && <AccountPage />}
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
                <div className="flex justify-around">
                    <Button
                        variant={activeTab === 'home' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('home')}
                        className="flex-1 mx-1"
                    >
                        <div className="flex flex-col items-center">
                            <Home className="w-6 h-6 mb-1" />
                        </div>
                    </Button>

                    <Button
                        variant={activeTab === 'prescriptions' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('prescriptions')}
                        className="flex-1 mx-1"
                    >
                        <div className="flex flex-col items-center">
                            <Pill className="w-6 h-6 mb-1" />
                        </div>
                    </Button>

                    <Button
                        variant={activeTab === 'account' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('account')}
                        className="flex-1 mx-1"
                    >
                        <div className="flex flex-col items-center">
                            <UserCircle className="w-6 h-6 mb-1" />
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MedicalDashboard;