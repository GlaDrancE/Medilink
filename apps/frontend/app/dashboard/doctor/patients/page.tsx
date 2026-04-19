"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RedirectToSignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import {
    Users,
    Search,
    Plus,
    ChevronLeft,
    ChevronRight,
    Phone,
    Calendar,
    Pill,
    AlertCircle,
    UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AddPatientModal from "@/components/AddPatientModal";
import { getDoctorPatients, addPrescription } from "@/services/api.routes";
import { Patient, Prescriptions } from "@/types";

const PAGE_SIZE = 15;

const EMPTY_PRESCRIPTION: Prescriptions = {
    id: "",
    patient: { id: "", phone: "", name: "", age: 0, gender: "", weight: 0, height: 0, is_active: true },
    doctor: { id: "", name: "", is_active: false, is_verified: false, is_approved: false, is_rejected: false },
    reason_for_visit: "",
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

interface PatientRxSummary {
    id: string;
    prescription_date: string;
    prescription_text: string;
    is_active: boolean;
    medicine_list: { id: string; name: string }[];
}

interface PatientRow extends Omit<Patient, "prescriptions"> {
    prescriptions?: PatientRxSummary[];
}

function SkeletonRow() {
    return (
        <TableRow>
            {Array.from({ length: 7 }).map((_, i) => (
                <TableCell key={i}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </TableCell>
            ))}
        </TableRow>
    );
}

export default function PatientsPage() {
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const [patients, setPatients] = useState<PatientRow[]>([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Prescriptions>(EMPTY_PRESCRIPTION);
    const [formLoading, setFormLoading] = useState(false);

    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debounce search input
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 400);
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [search]);

    const fetchPatients = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getDoctorPatients({
                page,
                limit: PAGE_SIZE,
                search: debouncedSearch || undefined,
            });
            setPatients(data.patients);
            setTotal(data.total);
            setTotalPages(data.totalPages);
        } catch {
            setError("Failed to load patients. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch]);

    useEffect(() => {
        if (isLoaded && user) fetchPatients();
    }, [isLoaded, user, fetchPatients]);

    const handleAddPatient = async (patientData: Prescriptions) => {
        setFormLoading(true);
        try {
            await addPrescription(patientData);
            setIsModalOpen(false);
            setFormData(EMPTY_PRESCRIPTION);
            await fetchPatients();
        } catch (err) {
            console.error("Error adding patient:", err);
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
    const endRecord = Math.min(page * PAGE_SIZE, total);

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
                            <Users className="h-5 w-5 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900">Patients</h1>
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
                        Add Patient
                    </Button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Search bar */}
                <div className="mb-5">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, phone or email…"
                            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                        <button onClick={fetchPatients} className="ml-auto underline font-medium hover:text-red-900">
                            Retry
                        </button>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200/70 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                                <TableHead className="pl-5 text-xs uppercase tracking-wide text-gray-500 font-semibold">Patient</TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Phone</TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Age / Gender</TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Blood Group</TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Allergies</TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Last Prescription</TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Rx Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : patients.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <div className="py-16 flex flex-col items-center text-center gap-3">
                                            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                                                <UserRound className="h-7 w-7 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {debouncedSearch ? "No patients match your search" : "No patients yet"}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {debouncedSearch
                                                        ? "Try a different name or phone number"
                                                        : "Add your first patient to get started"}
                                                </p>
                                            </div>
                                            {!debouncedSearch && (
                                                <Button size="sm" onClick={() => setIsModalOpen(true)} className="mt-1">
                                                    <Plus className="h-4 w-4 mr-1" /> Add Patient
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                patients.map((patient) => {
                                    const latestRx = patient.prescriptions?.[0];
                                    const rxCount = patient.prescriptions?.length ?? 0;
                                    const medicines = latestRx?.medicine_list?.map((m) => m.name).slice(0, 2) ?? [];

                                    return (
                                        <TableRow
                                            key={patient.id}
                                            className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                                        >
                                            {/* Patient name + id */}
                                            <TableCell className="pl-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shrink-0">
                                                        <span className="text-sm font-semibold text-blue-700">
                                                            {(patient.name ?? "?").charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                                                            {patient.name ?? <span className="text-gray-400 italic">Unnamed</span>}
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                            {patient.id.slice(0, 8)}…
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Phone */}
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                                    {patient.phone ?? <span className="text-gray-400">—</span>}
                                                </div>
                                            </TableCell>

                                            {/* Age / Gender */}
                                            <TableCell>
                                                <div className="text-sm text-gray-700 space-y-0.5">
                                                    {patient.age ? (
                                                        <span>{patient.age} yrs</span>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                    {patient.gender && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2 text-xs capitalize px-1.5 py-0"
                                                        >
                                                            {patient.gender}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Blood group */}
                                            <TableCell>
                                                {patient.blood_group ? (
                                                    <Badge className="bg-red-50 text-red-700 border-red-200 font-semibold text-xs px-2">
                                                        {patient.blood_group}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">—</span>
                                                )}
                                            </TableCell>

                                            {/* Allergies */}
                                            <TableCell>
                                                {patient.allergies && patient.allergies.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {patient.allergies.slice(0, 2).map((a) => (
                                                            <Badge key={a} variant="warning" className="text-xs px-1.5 py-0">
                                                                {a}
                                                            </Badge>
                                                        ))}
                                                        {patient.allergies.length > 2 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{patient.allergies.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">None</span>
                                                )}
                                            </TableCell>

                                            {/* Last prescription */}
                                            <TableCell>
                                                {latestRx ? (
                                                    <div>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(latestRx.prescription_date).toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </div>
                                                        {medicines.length > 0 && (
                                                            <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-700">
                                                                <Pill className="h-3 w-3 text-blue-400" />
                                                                <span className="truncate max-w-[140px]">
                                                                    {medicines.join(", ")}
                                                                    {(latestRx.medicine_list?.length ?? 0) > 2 &&
                                                                        ` +${latestRx.medicine_list.length - 2}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">No prescriptions</span>
                                                )}
                                            </TableCell>

                                            {/* Rx count */}
                                            <TableCell>
                                                <span className={`text-sm font-semibold ${rxCount > 0 ? "text-blue-600" : "text-gray-400"}`}>
                                                    {rxCount}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Showing <span className="font-medium">{startRecord}–{endRecord}</span> of{" "}
                            <span className="font-medium">{total}</span> patients
                        </span>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                                className="h-8 w-8 p-0"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && typeof arr[idx - 1] === "number" && (p as number) - (arr[idx - 1] as number) > 1) {
                                        acc.push("…");
                                    }
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === "…" ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">…</span>
                                    ) : (
                                        <Button
                                            key={p}
                                            variant={p === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setPage(p as number)}
                                            className="h-8 w-8 p-0 text-xs"
                                        >
                                            {p}
                                        </Button>
                                    )
                                )}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="h-8 w-8 p-0"
                            >
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
