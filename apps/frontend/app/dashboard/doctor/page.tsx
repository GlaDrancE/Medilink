"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import AddPatientModal from "@/components/AddPatientModal";
import { RedirectToSignIn, useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { addPrescription, getPrescription, getRecentPatients, getDoctorFollowUps } from "@/services/api.routes";
import type { FollowUpItem } from "@/services/api.routes";
import { Patient, Prescriptions } from "@/types";
import {
    SubscriptionStatusIndicator,
    DetailedSubscriptionStatus,
} from "@/components/SubscriptionGate";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import {
    NotificationBell,
    NotificationCenter,
} from "@/components/NotificationCenter";
import { Crown } from "lucide-react";

const EMPTY_PRESCRIPTION: Prescriptions = {
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
    doctor_id: "",
    checkups: [],
    is_active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
};

export default function DoctorDashboard() {
    const router = useRouter();
    const { signOut } = useAuth();
    const { user, isLoaded } = useUser();

    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [formData, setFormData] = useState<Prescriptions>(EMPTY_PRESCRIPTION);
    const [formLoading, setFormLoading] = useState(false);

    const [prescriptions, setPrescriptions] = useState<Prescriptions[]>([]);
    const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
    const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    type Connectivity = "online" | "offline" | "syncing";
    const [connectivity, setConnectivity] = useState<Connectivity>(
        typeof navigator !== "undefined" && navigator.onLine ? "online" : "offline"
    );
    const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);

    useEffect(() => {
        const handleOnline = () => setConnectivity("online");
        const handleOffline = () => setConnectivity("offline");
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    const fetchDashboardData = useCallback(async () => {
        setDataLoading(true);
        try {
            const [prescriptionsResult, patientsResult, followUpsResult] = await Promise.allSettled([
                getPrescription(),
                getRecentPatients(),
                getDoctorFollowUps(),
            ]);
            if (prescriptionsResult.status === "fulfilled") {
                setPrescriptions(prescriptionsResult.value ?? []);
            }
            if (patientsResult.status === "fulfilled") {
                setRecentPatients(patientsResult.value ?? []);
            }
            if (followUpsResult.status === "fulfilled") {
                setFollowUps(followUpsResult.value ?? []);
            }
        } finally {
            setDataLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoaded && user) {
            fetchDashboardData();
        }
    }, [isLoaded, user, fetchDashboardData]);

    const handleLogout = () => signOut();

    const handleAddPatient = async (patientData: Prescriptions) => {
        setFormLoading(true);
        try {
            await addPrescription(patientData);
            setConnectivity("syncing");
            await fetchDashboardData();
            setTimeout(() => {
                setConnectivity(navigator.onLine ? "online" : "offline");
                setLastSyncAt(new Date());
            }, 600);
            handleCloseModal();
        } catch (error) {
            console.error("Error adding prescription:", error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleCloseModal = () => {
        setFormData(EMPTY_PRESCRIPTION);
        setIsAddPatientModalOpen(false);
    };

    // Derived data — follow-ups come from the dedicated endpoint (follow_up_date field)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const sevenDaysAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todaysAppointments = followUps.filter((f) => {
        const d = new Date(f.follow_up_date);
        return d >= today && d < todayEnd;
    });

    const upcomingFollowUps = followUps
        .filter((f) => {
            const d = new Date(f.follow_up_date);
            return d >= todayEnd && d <= sevenDaysAhead;
        })
        .slice(0, 6);

    const missedAppointments = followUps
        .filter((f) => {
            const d = new Date(f.follow_up_date);
            return d >= sevenDaysAgo && d < today;
        })
        .slice(0, 5);

    const patientsThisMonth = new Set(
        prescriptions
            .filter((p) => new Date(p.prescription_date) >= startOfMonth)
            .map((p) => p.patient_id)
            .filter(Boolean)
    ).size;

    const prescriptionsThisMonth = prescriptions.filter(
        (p) => new Date(p.prescription_date) >= startOfMonth
    ).length;

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
                            <span className="text-gray-700 font-medium">{user?.username ?? user?.firstName}</span>
                            <Button
                                onClick={() => router.push("/dashboard/doctor/subscription")}
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-lg border border-blue-100/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-500 bg-clip-text text-transparent">
                            {dataLoading ? <span className="animate-pulse">—</span> : patientsThisMonth}
                        </div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Patients This Month</div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-green-50/50 rounded-lg border border-green-100/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-br from-green-600 to-green-500 bg-clip-text text-transparent">
                            {dataLoading ? <span className="animate-pulse">—</span> : prescriptionsThisMonth}
                        </div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Prescriptions This Month</div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-lg border border-purple-100/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-500 bg-clip-text text-transparent">
                            {dataLoading ? <span className="animate-pulse">—</span> : upcomingFollowUps.length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Upcoming Follow-Ups</div>
                    </div>
                    <div className="bg-gradient-to-br from-white to-orange-50/50 rounded-lg border border-orange-100/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 text-center">
                        <div className="text-3xl font-bold bg-gradient-to-br from-orange-600 to-orange-500 bg-clip-text text-transparent">
                            {dataLoading ? <span className="animate-pulse">—</span> : prescriptions.length}
                        </div>
                        <div className="text-sm text-gray-600 font-medium mt-1">Total Prescriptions</div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6 bg-white rounded-lg border border-gray-200/50 shadow-sm p-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Button
                            className="justify-start"
                            onClick={() => setIsAddPatientModalOpen(true)}
                        >
                            <span className="mr-2">➕</span> New Patient
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => router.push("/dashboard/doctor/prescriptions")}
                        >
                            <span className="mr-2">📝</span> View Prescriptions
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start"
                            onClick={() => router.push("/dashboard/doctor/notifications")}
                        >
                            <span className="mr-2">📨</span> Notifications
                        </Button>
                    </div>
                </div>

                <AddPatientModal
                    isOpen={isAddPatientModalOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleAddPatient}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Appointments */}
                    <section className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Today's Appointments
                            </h3>
                            <span className="text-sm text-gray-600 bg-gray-100/70 px-3 py-1 rounded-full font-medium">
                                {dataLoading ? "—" : `${todaysAppointments.length} total`}
                            </span>
                        </div>
                        {dataLoading ? (
                            <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Loading…</div>
                        ) : todaysAppointments.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">No appointments scheduled for today</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {todaysAppointments.map((a, idx) => (
                                    <div
                                        key={a.id ?? idx}
                                        className="py-3.5 flex items-center justify-between hover:bg-blue-50/30 -mx-2 px-2 rounded-md transition-colors duration-150"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-sm font-semibold text-gray-900 w-16 bg-gray-50 px-2 py-1 rounded">
                                                {new Date(a.follow_up_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                            <span className="text-sm text-gray-700 font-medium">{a.patient?.name ?? "—"}</span>
                                        </div>
                                        {a.medicine_list.length > 0 && (
                                            <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 font-medium border border-gray-200/50">
                                                {a.medicine_list[0]!.name}{a.medicine_list.length > 1 ? ` +${a.medicine_list.length - 1}` : ""}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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
                            {[
                                "Unlimited patient records",
                                "Digital prescription generation",
                                "SMS & WhatsApp reminders",
                                "Advanced analytics",
                                "Priority support",
                            ].map((feature) => (
                                <div key={feature} className="flex items-center space-x-3 text-sm bg-white/50 p-2 rounded-md">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400 shadow-sm flex-shrink-0"></div>
                                    <span className="text-blue-900 font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-blue-200/60">
                            <Button
                                onClick={() => router.push("/dashboard/doctor/subscription")}
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

                    {/* Upcoming Follow-Ups */}
                    <section className="bg-gradient-to-br from-white via-white to-green-50/30 rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Upcoming Follow-Ups (Next 7 Days)
                            </h3>
                        </div>
                        {dataLoading ? (
                            <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Loading…</div>
                        ) : upcomingFollowUps.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">No upcoming follow-ups in the next 7 days</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {upcomingFollowUps.map((p, idx) => (
                                    <div
                                        key={p.id ?? idx}
                                        className="py-3.5 flex items-center justify-between hover:bg-green-50/30 -mx-2 px-2 rounded-md transition-colors duration-150"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {p.patient?.name ?? "—"}
                                            </p>
                                            {p.medicine_list.length > 0 && (
                                                <p className="text-xs text-gray-600 mt-0.5">
                                                    {p.medicine_list.map((m) => m.name).slice(0, 2).join(", ")}
                                                    {p.medicine_list.length > 2 ? ` +${p.medicine_list.length - 2}` : ""}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="text-sm text-gray-700 font-medium bg-gray-50 px-2 py-1 rounded">
                                                {new Date(p.follow_up_date).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}
                                                {" "}
                                                {new Date(p.follow_up_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Missed Appointments / No-Shows */}
                    <section className="bg-gradient-to-br from-white via-white to-red-50/30 rounded-lg border border-red-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Missed Appointments
                            </h3>
                            {!dataLoading && missedAppointments.length > 0 && (
                                <span className="px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-red-100 to-red-50 text-red-700 border border-red-200/50 font-medium">
                                    {missedAppointments.length} this week
                                </span>
                            )}
                        </div>
                        {dataLoading ? (
                            <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Loading…</div>
                        ) : missedAppointments.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">No missed appointments this week</div>
                        ) : (
                            <div className="space-y-2">
                                {missedAppointments.map((m, idx) => (
                                    <div
                                        key={m.id ?? idx}
                                        className="flex items-center justify-between p-3 rounded-lg border border-red-200/50 bg-gradient-to-r from-red-50 to-red-50/50 hover:from-red-100/50 hover:to-red-50 transition-colors duration-150"
                                    >
                                        <span className="text-sm text-red-800 font-medium">{m.patient?.name ?? "—"}</span>
                                        <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded font-medium">
                                            {new Date(m.follow_up_date).toLocaleDateString([], { month: "short", day: "numeric" })}
                                            {" "}
                                            {new Date(m.follow_up_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Recent Patients Summary */}
                    <section className="bg-gradient-to-br from-white via-white to-indigo-50/30 rounded-lg border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 lg:col-span-3">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-gray-900">
                                Recent Patients
                            </h3>
                            {!dataLoading && recentPatients.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                                    onClick={() => router.push("/dashboard/doctor/patient")}
                                >
                                    View All
                                </Button>
                            )}
                        </div>
                        {dataLoading ? (
                            <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Loading…</div>
                        ) : recentPatients.length === 0 ? (
                            <div className="py-8 text-center text-gray-400 text-sm">No patients yet — add your first patient using the Quick Actions above</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {recentPatients.slice(0, 6).map((p, idx) => (
                                    <div key={p.id ?? idx} className="border border-gray-200/50 rounded-lg p-4 bg-gradient-to-br from-white to-gray-50/30 hover:shadow-sm transition-shadow duration-150">
                                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                                        <div className="mt-1.5 space-y-0.5">
                                            {p.phone && (
                                                <p className="text-xs text-gray-500">{p.phone}</p>
                                            )}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {p.age > 0 && (
                                                    <span className="text-xs text-gray-600">{p.age} yrs</span>
                                                )}
                                                {p.gender && (
                                                    <span className="text-xs text-gray-600 capitalize">{p.gender}</span>
                                                )}
                                                {p.blood_group && (
                                                    <span className="text-xs text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">{p.blood_group}</span>
                                                )}
                                            </div>
                                        </div>
                                        {p.updatedAt && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Updated {new Date(p.updatedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Notifications Section */}
                {/* <div className="mb-6 mt-6">
                    <NotificationCenter maxNotifications={3} />
                </div> */}
            </main>
        </div>
    );
}
