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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center space-x-3">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                MEDILINK
                            </h1>
                            <span className="px-2.5 py-1 rounded-md text-xs bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 text-blue-700 font-medium">
                                Lite EMR
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <SubscriptionStatusIndicator />
                            <div className="flex items-center space-x-2 bg-white/60 rounded-lg px-3 py-1.5 border border-gray-200/50">
                                <span
                                    className={
                                        connectivity === "online"
                                            ? "inline-block w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"
                                            : connectivity === "offline"
                                                ? "inline-block w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"
                                                : "inline-block w-2 h-2 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"
                                    }
                                />
                                <span className="text-sm text-gray-700 capitalize font-medium">
                                    {connectivity}
                                </span>
                                {lastSyncAt && (
                                    <span className="text-xs text-gray-500">
                                        Last sync {lastSyncAt.toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                            <NotificationBell />
                            <span className="text-gray-700 font-medium">{user?.username}</span>
                            <Button
                                onClick={() => (window.location.href = "/subscription")}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
                            >
                                Manage Subscription
                            </Button>
                            <Button onClick={handleLogout} variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
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
                    <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-lg border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-500 bg-clip-text text-transparent">12</div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Patients This Month</div>
                        {/* <SubscriptionGate
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
                        </SubscriptionGate> */}
                    </div>
                    <div className="bg-gradient-to-br from-white to-green-50/50 rounded-lg border border-green-100/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-br from-green-600 to-green-500 bg-clip-text text-transparent">45</div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Prescriptions Created</div>
                        {/* <SubscriptionGate
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
                        </SubscriptionGate> */}
                    </div>
                    <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-lg border border-purple-100/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-500 bg-clip-text text-transparent">23</div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Reminders Sent</div>
                        {/* <SubscriptionGate
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
                        </SubscriptionGate> */}
                    </div>
                    <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-lg border border-orange-100/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-br from-orange-600 to-orange-500 bg-clip-text text-transparent">2.5h</div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Time Saved</div>
                        <div className="text-xs text-green-600 mt-2 font-medium">With automation</div>
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
                    <section className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Today's Appointments
                            </h3>
                            <span className="text-sm text-gray-600 bg-gray-100/70 px-3 py-1 rounded-full font-medium">
                                {todaysAppointments.length} total
                            </span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {todaysAppointments.map((a, idx) => (
                                <div
                                    key={idx}
                                    className="py-3.5 flex items-center justify-between hover:bg-blue-50/30 -mx-2 px-2 rounded-md transition-colors duration-150"
                                >
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-semibold text-gray-900 w-16 bg-gray-50 px-2 py-1 rounded">
                                            {a.time}
                                        </span>
                                        <span className="text-sm text-gray-700 font-medium">{a.patient}</span>
                                    </div>
                                    <span
                                        className={
                                            a.status === "Checked-in"
                                                ? "px-3 py-1 text-xs rounded-full bg-gradient-to-r from-green-100 to-green-50 text-green-700 font-medium border border-green-200/50"
                                                : a.status === "Waiting"
                                                    ? "px-3 py-1 text-xs rounded-full bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 font-medium border border-yellow-200/50"
                                                    : "px-3 py-1 text-xs rounded-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium border border-gray-200/50"
                                        }
                                    >
                                        {a.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Actions */}
                    <section className="bg-gradient-to-br from-white via-white to-indigo-50/30 rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                        <div className="flex items-center justify-between mb-4">
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
                    <section className="bg-gradient-to-br from-white via-white to-green-50/30 rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Upcoming Follow-Ups
                            </h3>
                            <SubscriptionGate
                                feature="SEND_REMINDER"
                                fallback={
                                    <span className="text-xs text-gray-600 bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1.5 rounded-full border border-gray-200/50 font-medium">
                                        Premium: Auto-reminders
                                    </span>
                                }
                            >
                                <Button variant="outline" size="sm" className="text-xs">
                                    Send Reminders
                                </Button>
                            </SubscriptionGate>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {upcomingFollowUps.map((u, idx) => (
                                <div
                                    key={idx}
                                    className="py-3.5 flex items-center justify-between hover:bg-green-50/30 -mx-2 px-2 rounded-md transition-colors duration-150"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {u.name}
                                        </p>
                                        <p className="text-xs text-gray-600 mt-0.5">{u.reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded">{u.date}</span>
                                        <SubscriptionGate
                                            feature="SEND_REMINDER"
                                            fallback={
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Manual reminder needed
                                                </div>
                                            }
                                        >
                                            <div className="text-xs text-green-600 mt-1 font-medium">
                                                Auto-reminder set
                                            </div>
                                        </SubscriptionGate>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Missed Appointments / No-Shows */}
                    <section className="bg-gradient-to-br from-white via-white to-red-50/30 rounded-lg border border-red-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Missed Appointments
                            </h3>
                            <span className="px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200/50 font-medium">
                                {missedAppointments.length} this week
                            </span>
                        </div>
                        <div className="space-y-2">
                            {missedAppointments.map((m, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 rounded-lg border border-red-200/50 bg-gradient-to-r from-red-50 to-red-50/50 hover:from-red-100/50 hover:to-red-50 transition-colors duration-150"
                                >
                                    <span className="text-sm text-red-800 font-medium">{m.name}</span>
                                    <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded font-medium">{m.date}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Recent Patients Summary */}
                    <section className="bg-gradient-to-br from-white via-white to-indigo-50/30 rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 lg:col-span-2">
                        <h3 className="text-base font-semibold text-gray-900 mb-4">
                            Recent Patients
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {recentPatients.map((p, idx) => (
                                <div key={idx} className="border border-gray-200/50 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50/30 hover:shadow-sm transition-shadow duration-150">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {p.name}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1.5">
                                        {p.lastPrescription}
                                    </p>
                                    {p.next && (
                                        <p className="text-xs text-gray-700 mt-2 bg-blue-50 px-2 py-1 rounded inline-block font-medium">
                                            Next: {p.next}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Premium Features Overview */}
                    <section className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/50 rounded-lg border border-blue-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                        <div className="flex items-center space-x-2 mb-4">
                            <Crown className="h-5 w-5 text-blue-600" />
                            <h3 className="text-base font-semibold text-blue-900">
                                Premium Features
                            </h3>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3 text-sm bg-white/50 p-2 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-sm"></div>
                                <span className="text-blue-900 font-medium">
                                    Unlimited patient records
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm bg-white/50 p-2 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-sm"></div>
                                <span className="text-blue-900 font-medium">
                                    Digital prescription generation
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm bg-white/50 p-2 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-sm"></div>
                                <span className="text-blue-900 font-medium">
                                    SMS & WhatsApp reminders
                                </span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm bg-white/50 p-2 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-sm"></div>
                                <span className="text-blue-900 font-medium">Advanced analytics</span>
                            </div>
                            <div className="flex items-center space-x-3 text-sm bg-white/50 p-2 rounded-md">
                                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-sm"></div>
                                <span className="text-blue-900 font-medium">Priority support</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200/60">
                            <Button
                                onClick={() => (window.location.href = "/subscription")}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                                size="sm"
                            >
                                Upgrade to Premium
                            </Button>
                            <p className="text-xs text-center text-blue-700 mt-2.5 font-medium">
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
