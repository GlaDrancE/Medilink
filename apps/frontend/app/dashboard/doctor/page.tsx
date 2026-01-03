"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import AddPatientModal from "@/components/AddPatientModal";
import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { addPrescription } from "@/services/api.routes";
import { Prescriptions } from "@/types";
import {
    SubscriptionGate,
    SubscriptionStatusIndicator,
    DetailedSubscriptionStatus,
} from "@/components/SubscriptionGate";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import {
    NotificationBell,
    NotificationCenter,
} from "@/components/NotificationCenter";
import { Crown } from "lucide-react";
import { DashboardContent } from "@/components/DashboardContent";

export default function DoctorDashboard() {
    const auth = useAuth();
    const { user, isLoaded } = useUser();

    // Add Patient Modal State
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [formData, setFormData] = useState<Prescriptions>({
        id: "",
        patient: {
            id: "",
            phone: "",
            name: "",
            age: 0,
            gender: "",
            weight: 0,
            height: 0,
            is_active: true,
        },
        doctor: {
            id: "",
            name: "",
            email: "",
            password: "",
            address: "",
            hospital: "",
            license_number: "",
            specialization: "",
            experience: 0,
            bio: "",
            profile_picture: "",
            is_active: false,
            is_verified: false,
            is_approved: false,
            is_rejected: false,
        },
        disease: "",
        medicine_list: [],
        nextAppointment: new Date(),
        prescription_text: "",
        prescription_date: new Date().toString(),
        patient_id: "",
        checkups: [],
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });
    const [formLoading, setFormLoading] = useState(false);

    // Connectivity / Sync Status
    type Connectivity = "online" | "offline" | "syncing";
    const [connectivity, setConnectivity] = useState<Connectivity>(
        typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline"
    );
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

    useEffect(() => {
        (async () => {
            const token = await auth.getToken();
            if (token) {
                localStorage.setItem("token", token);
            }
        })();
        const handleOnline = () => setConnectivity("online");
        const handleOffline = () => setConnectivity("offline");
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [auth]);

    const handleLogout = () => {
        auth.signOut();
    };

    const handleAddPatient = async (patientData: Prescriptions) => {
        // e.preventDefault();

        setFormLoading(true);
        try {
            alert("Patient added successfully!");
            const response = await addPrescription(patientData);
            // handleCloseModal();
            setConnectivity("syncing");
            // Simulate sync finish
            setTimeout(() => {
                setConnectivity(navigator.onLine ? "online" : "offline");
                setLastSyncAt(new Date());
            }, 600);
        } catch (error) {
            console.error("Error adding patient:", error);
            // alert("Error adding patient. Please try again.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleCloseModal = () => {
        setFormData({
            id: "",
            patient: {
                id: "",
                phone: "",
                name: "",
                age: 0,
                gender: "",
                weight: 0,
                height: 0,
                is_active: true,
            },
            disease: "",
            medicine_list: [],
            nextAppointment: new Date(),
            prescription_text: "",
            prescription_date: new Date().toString(),
            patient_id: "",
            doctor_id: "",
            is_active: true,
            doctor: {
                id: "",
                name: "",
                email: "",
                password: "",
                address: "",
                hospital: "",
                license_number: "",
                specialization: "",
                experience: 0,
                bio: "",
                profile_picture: "",
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
    type AppointmentStatus = "Scheduled" | "Checked-in" | "Waiting";
    const todaysAppointments: {
        time: string;
        patient: string;
        status: AppointmentStatus;
    }[] = [
            { time: "09:00", patient: "John Doe", status: "Checked-in" },
            { time: "10:30", patient: "Sarah Wilson", status: "Scheduled" },
            { time: "11:15", patient: "Mike Johnson", status: "Waiting" },
            { time: "14:00", patient: "Anna Lee", status: "Scheduled" },
        ];

    const upcomingFollowUps: { name: string; date: string; reason: string }[] = [
        {
            name: "Peter Parker",
            date: "Tomorrow 10:00",
            reason: "Bloodwork review",
        },
        { name: "Bruce Wayne", date: "Thu 14:30", reason: "Post-op check" },
    ];

    const missedAppointments: { name: string; date: string }[] = [
        { name: "Clark Kent", date: "Today 12:00" },
        { name: "Diana Prince", date: "Mon 16:00" },
    ];

    const recentPatients: {
        name: string;
        lastPrescription: string;
        next?: string;
    }[] = [
            {
                name: "Tony Stark",
                lastPrescription: "Atorvastatin 10mg nightly",
                next: "Fri 11:00",
            },
            {
                name: "Natasha Romanoff",
                lastPrescription: "Ibuprofen PRN",
                next: undefined,
            },
            {
                name: "Steve Rogers",
                lastPrescription: "Vitamin D 1000 IU daily",
                next: "Next week",
            },
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
                            <h1 className="text-2xl font-semibold text-gray-900">
                                MEDILINK
                            </h1>
                            <span className="px-2 py-0.5 rounded text-xs border text-gray-600">
                                Lite EMR
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SubscriptionStatusIndicator />
                            <div className="flex items-center space-x-2">
                                <span
                                    className={
                                        connectivity === "online"
                                            ? "inline-block w-2 h-2 rounded-full bg-green-500"
                                            : connectivity === "offline"
                                                ? "inline-block w-2 h-2 rounded-full bg-red-500"
                                                : "inline-block w-2 h-2 rounded-full bg-yellow-500"
                                    }
                                />
                                <span className="text-sm text-gray-600 capitalize">
                                    {connectivity}
                                </span>
                                {lastSyncAt && (
                                    <span className="text-xs text-gray-400">
                                        Last sync {lastSyncAt.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            <NotificationBell />
                            <span className="text-gray-700">{user?.username}</span>
                            <Button
                                onClick={() => (window.location.href = "/subscription")}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700"
                            >
                                Manage Subscription
                            </Button>
                            <Button onClick={handleLogout} variant="outline" size="sm">
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <SubscriptionBanner />

                {/* Subscription Overview */}
                <div className="mb-6">
                    <DetailedSubscriptionStatus />
                </div>

                {/* Usage Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-md border shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">12</div>
                        <div className="text-sm text-gray-600">Patients This Month</div>
                        <SubscriptionGate
                            feature="NEW_PATIENT"
                            fallback={
                                <div className="text-xs text-gray-400 mt-1">
                                    Limited to 5 in free plan
                                </div>
                            }
                        >
                            <div className="text-xs text-green-600 mt-1">
                                Unlimited with Premium
                            </div>
                        </SubscriptionGate>
                    </div>
                    <div className="bg-white rounded-md border shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">45</div>
                        <div className="text-sm text-gray-600">Prescriptions Created</div>
                        <SubscriptionGate
                            feature="CREATE_PRESCRIPTION"
                            fallback={
                                <div className="text-xs text-gray-400 mt-1">
                                    Manual prescriptions only
                                </div>
                            }
                        >
                            <div className="text-xs text-green-600 mt-1">
                                Digital prescriptions
                            </div>
                        </SubscriptionGate>
                    </div>
                    <div className="bg-white rounded-md border shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">23</div>
                        <div className="text-sm text-gray-600">Reminders Sent</div>
                        <SubscriptionGate
                            feature="SEND_REMINDER"
                            fallback={
                                <div className="text-xs text-gray-400 mt-1">
                                    Manual reminders only
                                </div>
                            }
                        >
                            <div className="text-xs text-green-600 mt-1">
                                Automated reminders
                            </div>
                        </SubscriptionGate>
                    </div>
                    <div className="bg-white rounded-md border shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-orange-600">2.5h</div>
                        <div className="text-sm text-gray-600">Time Saved</div>
                        <div className="text-xs text-green-600 mt-1">With automation</div>
                    </div>
                </div>



                {/* Dashboard Content with Premium Features */}
                <DashboardContent
                    isAddPatientModalOpen={isAddPatientModalOpen}
                    setIsAddPatientModalOpen={setIsAddPatientModalOpen}
                    formData={formData}
                    handleAddPatient={handleAddPatient}
                    handleCloseModal={handleCloseModal}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Appointments */}
                    <section className="bg-white rounded-md border shadow-sm p-4 lg:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-900">
                                Today's Appointments
                            </h3>
                            <span className="text-sm text-gray-500">
                                {todaysAppointments.length} total
                            </span>
                        </div>
                        <div className="divide-y">
                            {todaysAppointments.map((a, idx) => (
                                <div
                                    key={idx}
                                    className="py-3 flex items-center justify-between"
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-medium text-gray-900 w-16">
                                            {a.time}
                                        </span>
                                        <span className="text-sm text-gray-700">{a.patient}</span>
                                    </div>
                                    <span
                                        className={
                                            a.status === "Checked-in"
                                                ? "px-2 py-0.5 text-xs rounded bg-green-100 text-green-700"
                                                : a.status === "Waiting"
                                                    ? "px-2 py-0.5 text-xs rounded bg-yellow-100 text-yellow-700"
                                                    : "px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700"
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
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-900">
                                Quick Actions
                            </h3>
                            <SubscriptionStatusIndicator className="text-xs" />
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {/* <SubscriptionGate
                                feature="NEW_PATIENT"
                                fallback={
                                    <div className="relative">
                                        <Button
                                            className="justify-start w-full opacity-50 cursor-not-allowed"
                                            disabled
                                        >
                                            <span className="mr-2">➕</span> New Patient
                                        </Button>
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                Premium
                                            </span>
                                        </div>
                                    </div>
                                }
                            > */}
                            <Button
                                className="justify-start w-full"
                                onClick={() => setIsAddPatientModalOpen(true)}
                            >
                                <span className="mr-2">➕</span> New Patient
                            </Button>
                            {/* </SubscriptionGate> */}

                            {/* <SubscriptionGate
                                feature="CREATE_PRESCRIPTION"
                                fallback={
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            className="justify-start w-full opacity-50 cursor-not-allowed"
                                            disabled
                                        >
                                            <span className="mr-2">📝</span> Create Prescription
                                        </Button>
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                Premium
                                            </span>
                                        </div>
                                    </div>
                                }
                            > */}
                            <Button
                                variant="outline"
                                className="justify-start w-full"
                                onClick={() =>
                                    alert("Create Prescription flow coming soon")
                                }
                            >
                                <span className="mr-2">📝</span> Create Prescription
                            </Button>
                            {/* </SubscriptionGate> */}

                            <SubscriptionGate
                                feature="SEND_REMINDER"
                                fallback={
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            className="justify-start w-full opacity-50 cursor-not-allowed"
                                            disabled
                                        >
                                            <span className="mr-2">📨</span> Send Reminder
                                        </Button>
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                                Premium
                                            </span>
                                        </div>
                                    </div>
                                }
                            >
                                <Button
                                    variant="outline"
                                    className="justify-start w-full"
                                    onClick={() => alert("Send Reminder flow coming soon")}
                                >
                                    <span className="mr-2">📨</span> Send Reminder
                                </Button>
                            </SubscriptionGate>

                            <div className="mt-4 pt-3 border-t">
                                <Button
                                    variant="ghost"
                                    className="justify-start w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => (window.location.href = "/subscription")}
                                >
                                    <span className="mr-2">⚙️</span> Manage Subscription
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Upcoming Follow-Ups */}
                    <section className="bg-white rounded-md border shadow-sm p-4 lg:col-span-2">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-900">
                                Upcoming Follow-Ups
                            </h3>
                            <SubscriptionGate
                                feature="SEND_REMINDER"
                                fallback={
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        Premium: Auto-reminders
                                    </span>
                                }
                            >
                                <Button variant="outline" size="sm" className="text-xs">
                                    Send Reminders
                                </Button>
                            </SubscriptionGate>
                        </div>
                        <div className="divide-y">
                            {upcomingFollowUps.map((u, idx) => (
                                <div
                                    key={idx}
                                    className="py-3 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {u.name}
                                        </p>
                                        <p className="text-xs text-gray-600">{u.reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-gray-700">{u.date}</span>
                                        <SubscriptionGate
                                            feature="SEND_REMINDER"
                                            fallback={
                                                <div className="text-xs text-gray-400 mt-1">
                                                    Manual reminder needed
                                                </div>
                                            }
                                        >
                                            <div className="text-xs text-green-600 mt-1">
                                                Auto-reminder set
                                            </div>
                                        </SubscriptionGate>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Missed Appointments / No-Shows */}
                    <section className="bg-white rounded-md border shadow-sm p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base font-semibold text-gray-900">
                                Missed Appointments
                            </h3>
                            <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                                {missedAppointments.length} this week
                            </span>
                        </div>
                        <div className="space-y-2">
                            {missedAppointments.map((m, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-2 rounded border bg-red-50"
                                >
                                    <span className="text-sm text-red-800">{m.name}</span>
                                    <span className="text-xs text-red-700">{m.date}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Patients Summary */}
                    <section className="bg-white rounded-md border shadow-sm p-4 lg:col-span-2">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                            Recent Patients
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recentPatients.map((p, idx) => (
                                <div key={idx} className="border rounded p-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {p.name}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {p.lastPrescription}
                                    </p>
                                    {p.next && (
                                        <p className="text-xs text-gray-700 mt-2">
                                            Next: {p.next}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Premium Features Overview */}
                    <section className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-md border border-blue-200 shadow-sm p-4">
                        <div className="flex items-center space-x-2 mb-3">
                            <Crown className="h-5 w-5 text-blue-600" />
                            <h3 className="text-base font-semibold text-blue-900">
                                Premium Features
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-blue-800">
                                    Unlimited patient records
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-blue-800">
                                    Digital prescription generation
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-blue-800">
                                    SMS & WhatsApp reminders
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-blue-800">Advanced analytics</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-blue-800">Priority support</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-blue-200">
                            <Button
                                onClick={() => (window.location.href = "/subscription")}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                size="sm"
                            >
                                Upgrade to Premium
                            </Button>
                            <p className="text-xs text-center text-blue-600 mt-2">
                                Starting from ₹99/month • 7-day free trial
                            </p>
                        </div>
                    </section>

                </div>

                {/* Notifications Section */}
                <div className="mb-6 mt-6 ">
                    <NotificationCenter maxNotifications={3} />
                </div>

            </main>




        </div>
    );
}
