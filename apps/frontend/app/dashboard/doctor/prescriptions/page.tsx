"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RedirectToSignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import {
    FileText,
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Pill,
    Calendar,
    Phone,
    User,
    ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AddPatientModal from "@/components/AddPatientModal";
import {
    getDoctorPrescriptionList,
    addPrescription,
    type PrescriptionListItem,
} from "@/services/api.routes";
import { type Prescriptions } from "@/types";

const PAGE_SIZE = 20;

const EMPTY_PRESCRIPTION: Prescriptions = {
    id: "",
    patient: { id: "", phone: "", name: "", age: 0, gender: "", weight: 0, height: 0, is_active: true },
    doctor: { id: "", name: "", is_active: false, is_verified: false, is_approved: false, is_rejected: false },
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

function SkeletonRow({ expanded }: { expanded?: boolean }) {
    return (
        <div className="border-b border-gray-100 px-5 py-4 animate-pulse">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                    <div className="space-y-1.5 flex-1">
                        <div className="h-3.5 bg-gray-200 rounded w-32" />
                        <div className="h-3 bg-gray-100 rounded w-24" />
                    </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-24 hidden sm:block" />
                <div className="h-3 bg-gray-200 rounded w-20 hidden md:block" />
                <div className="h-3 bg-gray-200 rounded w-28 hidden lg:block" />
                <div className="h-6 w-16 bg-gray-200 rounded-full hidden sm:block" />
                <div className="h-4 w-4 bg-gray-100 rounded" />
            </div>
        </div>
    );
}

function MedicineBadge({ medicine }: { medicine: PrescriptionListItem["medicine_list"][0] }) {
    const dosage = medicine.dosage;
    const parts = [
        dosage.morning && `M:${dosage.morning}`,
        dosage.afternoon && `A:${dosage.afternoon}`,
        dosage.night && `N:${dosage.night}`,
    ].filter(Boolean).join(" | ");

    return (
        <div className="flex items-start gap-2 py-2 border-b border-gray-50 last:border-0">
            <Pill className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
            <div>
                <p className="text-sm font-medium text-gray-800">{medicine.name}</p>
                {parts && <p className="text-xs text-gray-500 mt-0.5">{parts}</p>}
                <p className="text-xs text-gray-400 capitalize">{medicine.before_after_food.toLowerCase()} food</p>
            </div>
        </div>
    );
}

function PrescriptionRow({ rx }: { rx: PrescriptionListItem }) {
    const [expanded, setExpanded] = useState(false);
    const date = new Date(rx.prescription_date);
    const followUp = rx.follow_up_date ? new Date(rx.follow_up_date) : null;
    const isOverdue = followUp && followUp < new Date();

    return (
        <div className="border-b border-gray-100 last:border-0">
            {/* Summary row */}
            <button
                className="w-full text-left px-5 py-4 hover:bg-gray-50/60 transition-colors flex items-center gap-4"
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-blue-700">
                        {(rx.patient.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                </div>

                {/* Patient + Rx# */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                        {rx.patient.name ?? <span className="text-gray-400 italic">Unnamed</span>}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 font-mono">#{rx.index}</span>
                        {rx.patient.phone && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                <Phone className="h-2.5 w-2.5" />
                                {rx.patient.phone}
                            </span>
                        )}
                        {rx.patient.age && (
                            <span className="text-xs text-gray-400">{rx.patient.age} yrs</span>
                        )}
                        {rx.patient.gender && (
                            <span className="text-xs text-gray-400 capitalize">{rx.patient.gender}</span>
                        )}
                    </div>
                </div>

                {/* Date */}
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>

                {/* Medicines count */}
                <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 shrink-0">
                    <Pill className="h-3.5 w-3.5 text-blue-400" />
                    {rx.medicine_list.length} medicine{rx.medicine_list.length !== 1 ? "s" : ""}
                </div>

                {/* Follow-up */}
                <div className="hidden lg:block shrink-0 text-right">
                    {followUp ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${
                            isOverdue
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-700"
                        }`}>
                            {isOverdue ? "Missed · " : "Follow-up · "}
                            {followUp.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-300">No follow-up</span>
                    )}
                </div>

                {/* Active badge */}
                <Badge
                    variant={rx.is_active ? "default" : "outline"}
                    className={`hidden sm:inline-flex text-xs px-2 shrink-0 ${
                        rx.is_active ? "bg-green-100 text-green-700 border-green-200" : "text-gray-400"
                    }`}
                >
                    {rx.is_active ? "Active" : "Inactive"}
                </Badge>

                {/* Expand toggle */}
                <span className="text-gray-400 shrink-0">
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>
            </button>

            {/* Expanded details */}
            {expanded && (
                <div className="px-5 pb-5 bg-gray-50/50 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                        {/* Prescription text */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <ClipboardList className="h-4 w-4 text-gray-400" />
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Prescription Notes
                                </h4>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white rounded-lg border border-gray-200 p-3">
                                {rx.prescription_text || <span className="text-gray-400 italic">No notes</span>}
                            </p>

                            {/* Follow-up (visible on mobile in expanded) */}
                            {followUp && (
                                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-600">
                                    <Calendar className="h-3.5 w-3.5 text-purple-400" />
                                    <span className="font-medium">Follow-up:</span>
                                    {followUp.toLocaleDateString("en-IN", {
                                        weekday: "short", day: "numeric", month: "short", year: "numeric",
                                    })}
                                    {isOverdue && (
                                        <Badge variant="destructive" className="text-xs ml-1 px-1.5 py-0">
                                            Missed
                                        </Badge>
                                    )}
                                </div>
                            )}

                            {/* Checkups */}
                            {rx.checkups.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                                        Checkups
                                    </p>
                                    <div className="space-y-1">
                                        {rx.checkups.map((c) => (
                                            <div key={c.id} className="flex items-start gap-2 text-xs text-gray-600">
                                                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${c.is_active ? "bg-blue-500" : "bg-gray-300"}`} />
                                                <span>{c.checkup_text}</span>
                                                <span className="ml-auto text-gray-400 shrink-0">
                                                    {new Date(c.checkup_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Medicines */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <Pill className="h-4 w-4 text-blue-400" />
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                    Medicines ({rx.medicine_list.length})
                                </h4>
                            </div>
                            {rx.medicine_list.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No medicines listed</p>
                            ) : (
                                <div className="bg-white rounded-lg border border-gray-200 p-3 divide-y divide-gray-50">
                                    {rx.medicine_list.map((m) => (
                                        <MedicineBadge key={m.id} medicine={m} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function PrescriptionsPage() {
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const [prescriptions, setPrescriptions] = useState<PrescriptionListItem[]>([]);
    const [total, setTotal]           = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage]             = useState(1);
    const [search, setSearch]         = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState("");

    const [isModalOpen, setIsModalOpen]   = useState(false);
    const [formData, setFormData]         = useState<Prescriptions>(EMPTY_PRESCRIPTION);
    const [formLoading, setFormLoading]   = useState(false);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search]);

    const fetchPrescriptions = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getDoctorPrescriptionList({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
            });
            setPrescriptions(data.prescriptions);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch {
            setError("Failed to load prescriptions. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        if (isLoaded && user) fetchPrescriptions();
    }, [isLoaded, user, fetchPrescriptions]);

    const handleAddPatient = async (data: Prescriptions) => {
        setFormLoading(true);
        try {
            await addPrescription(data);
            setIsModalOpen(false);
            setFormData(EMPTY_PRESCRIPTION);
            await fetchPrescriptions();
        } catch (err) {
            console.error("Error adding prescription:", err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleCloseModal = () => {
        setFormData(EMPTY_PRESCRIPTION);
        setIsModalOpen(false);
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }
    if (!user) return <RedirectToSignIn />;

    const startRecord = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const endRecord   = Math.min(page * PAGE_SIZE, total);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/dashboard/doctor")}
                            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900">Prescriptions</h1>
                        </div>
                        {!loading && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                                {total} total
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                        size="sm"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        New Prescription
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Search */}
                <div className="mb-5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by patient name…"
                            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                        <button onClick={fetchPrescriptions} className="ml-auto underline font-medium hover:text-red-900">
                            Retry
                        </button>
                    </div>
                )}

                {/* List */}
                <div className="bg-white rounded-xl border border-gray-200/70 shadow-sm overflow-hidden">
                    {/* Column headers */}
                    <div className="hidden sm:flex items-center gap-4 px-5 py-3 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <div className="flex-1">Patient</div>
                        <div className="w-32 hidden sm:block">Date</div>
                        <div className="w-24 hidden md:block">Medicines</div>
                        <div className="w-36 hidden lg:block">Follow-up</div>
                        <div className="w-16 hidden sm:block">Status</div>
                        <div className="w-5" />
                    </div>

                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    ) : prescriptions.length === 0 ? (
                        <div className="py-16 flex flex-col items-center text-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                                <FileText className="h-7 w-7 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">
                                    {debouncedSearch ? "No prescriptions match your search" : "No prescriptions yet"}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {debouncedSearch
                                        ? "Try a different patient name"
                                        : "Create your first prescription to get started"}
                                </p>
                            </div>
                            {!debouncedSearch && (
                                <Button size="sm" onClick={() => setIsModalOpen(true)} className="mt-1">
                                    <Plus className="h-4 w-4 mr-1" /> New Prescription
                                </Button>
                            )}
                        </div>
                    ) : (
                        prescriptions.map((rx) => <PrescriptionRow key={rx.id} rx={rx} />)
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Showing <span className="font-medium">{startRecord}–{endRecord}</span> of{" "}
                            <span className="font-medium">{total}</span> prescriptions
                        </span>
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-8 w-8 p-0">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === "…" ? (
                                        <span key={`e-${idx}`} className="px-2 text-gray-400">…</span>
                                    ) : (
                                        <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p as number)} className="h-8 w-8 p-0 text-xs">
                                            {p}
                                        </Button>
                                    )
                                )}
                            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 w-8 p-0">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <AddPatientModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleAddPatient}
            />
        </div>
    );
}
