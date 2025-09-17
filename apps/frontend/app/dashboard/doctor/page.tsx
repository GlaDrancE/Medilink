'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import AddPatientModal from '@/components/AddPatientModal';
import { RedirectToSignIn, useAuth } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { addPrescription } from '@/services/api.routes';
import { Prescriptions } from '@/types';

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
            height: 0,
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
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const [formLoading, setFormLoading] = useState(false);

    // Connectivity / Sync Status
    type Connectivity = 'online' | 'offline' | 'syncing';
    const [connectivity, setConnectivity] = useState<Connectivity>(typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline');
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);



    useEffect(() => {
        (async () => {
            const token = await auth.getToken();
            if (token) {
                localStorage.setItem("token", token);
            }
        })();
        const handleOnline = () => setConnectivity('online');
        const handleOffline = () => setConnectivity('offline');
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [auth]);


    const handleLogout = () => {
        auth.signOut();
    };

    const handleAddPatient = async (patientData: Prescriptions) => {
        // e.preventDefault();

        setFormLoading(true);
        try {
            alert('Patient added successfully!');
            const response = await addPrescription(patientData)
            // handleCloseModal();
            setConnectivity('syncing');
            // Simulate sync finish
            setTimeout(() => {
                setConnectivity(navigator.onLine ? 'online' : 'offline');
                setLastSyncAt(new Date());
            }, 600);
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
                height: 0,
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
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        setIsAddPatientModalOpen(false);
    };

    // Mock data for UI (replace with real API data later)
    type AppointmentStatus = 'Scheduled' | 'Checked-in' | 'Waiting';
    const todaysAppointments: { time: string; patient: string; status: AppointmentStatus }[] = [
        { time: '09:00', patient: 'John Doe', status: 'Checked-in' },
        { time: '10:30', patient: 'Sarah Wilson', status: 'Scheduled' },
        { time: '11:15', patient: 'Mike Johnson', status: 'Waiting' },
        { time: '14:00', patient: 'Anna Lee', status: 'Scheduled' },
    ];

    const upcomingFollowUps: { name: string; date: string; reason: string }[] = [
        { name: 'Peter Parker', date: 'Tomorrow 10:00', reason: 'Bloodwork review' },
        { name: 'Bruce Wayne', date: 'Thu 14:30', reason: 'Post-op check' },
    ];

    const missedAppointments: { name: string; date: string }[] = [
        { name: 'Clark Kent', date: 'Today 12:00' },
        { name: 'Diana Prince', date: 'Mon 16:00' },
    ];

    const recentPatients: { name: string; lastPrescription: string; next?: string }[] = [
        { name: 'Tony Stark', lastPrescription: 'Atorvastatin 10mg nightly', next: 'Fri 11:00' },
        { name: 'Natasha Romanoff', lastPrescription: 'Ibuprofen PRN', next: undefined },
        { name: 'Steve Rogers', lastPrescription: 'Vitamin D 1000 IU daily', next: 'Next week' },
    ];

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
            <header className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-semibold text-gray-900">Doctor Dashboard</h1>
                            <span className="px-2 py-0.5 rounded text-xs border text-gray-600">Lite EMR</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <span
                                    className={
                                        connectivity === 'online'
                                            ? 'inline-block w-2 h-2 rounded-full bg-green-500'
                                            : connectivity === 'offline'
                                                ? 'inline-block w-2 h-2 rounded-full bg-red-500'
                                                : 'inline-block w-2 h-2 rounded-full bg-yellow-500'
                                    }
                                />
                                <span className="text-sm text-gray-600 capitalize">{connectivity}</span>
                                {lastSyncAt && (
                                    <span className="text-xs text-gray-400">Last sync {lastSyncAt.toLocaleTimeString()}</span>
                                )}
                            </div>
                            <span className="text-gray-700">{user?.username}</span>
                            <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Appointments */}
                    <section className="bg-white rounded-md border shadow-sm p-4 lg:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-900">Today's Appointments</h3>
                            <span className="text-sm text-gray-500">{todaysAppointments.length} total</span>
                        </div>
                        <div className="divide-y">
                            {todaysAppointments.map((a, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-medium text-gray-900 w-16">{a.time}</span>
                                        <span className="text-sm text-gray-700">{a.patient}</span>
                                    </div>
                                    <span
                                        className={
                                            a.status === 'Checked-in'
                                                ? 'px-2 py-0.5 text-xs rounded bg-green-100 text-green-700'
                                                : a.status === 'Waiting'
                                                    ? 'px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700'
                                                    : 'px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700'
                                        }
                                    >
                                        {a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="bg-white rounded-md border shadow-sm p-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <Button className="justify-start" onClick={() => setIsAddPatientModalOpen(true)}>
                                <span className="mr-2">➕</span> New Patient
                            </Button>
                            <Button variant="outline" className="justify-start" onClick={() => alert('Create Prescription flow coming soon')}>
                                <span className="mr-2">📝</span> Create Prescription
                            </Button>
                            <Button variant="outline" className="justify-start" onClick={() => alert('Send Reminder flow coming soon')}>
                                <span className="mr-2">📨</span> Send Reminder (SMS/WhatsApp)
                            </Button>
                        </div>
                    </section>

                    {/* Upcoming Follow-Ups */}
                    <section className="bg-white rounded-md border shadow-sm p-4 lg:col-span-2">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Upcoming Follow-Ups</h3>
                        <div className="divide-y">
                            {upcomingFollowUps.map((u, idx) => (
                                <div key={idx} className="py-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                                        <p className="text-xs text-gray-600">{u.reason}</p>
                                    </div>
                                    <span className="text-sm text-gray-700">{u.date}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Missed Appointments / No-Shows */}
                    <section className="bg-white rounded-md border shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-900">Missed Appointments</h3>
                            <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">{missedAppointments.length} this week</span>
                        </div>
                        <div className="space-y-2">
                            {missedAppointments.map((m, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 rounded border bg-red-50">
                                    <span className="text-sm text-red-800">{m.name}</span>
                                    <span className="text-xs text-red-700">{m.date}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Patients Summary */}
                    <section className="bg-white rounded-md border shadow-sm p-4 lg:col-span-3">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Recent Patients</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {recentPatients.map((p, idx) => (
                                <div key={idx} className="border rounded p-3">
                                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                                    <p className="text-xs text-gray-600 mt-1">{p.lastPrescription}</p>
                                    {p.next && (
                                        <p className="text-xs text-gray-700 mt-2">Next: {p.next}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
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