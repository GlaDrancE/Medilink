import { MedicineEntry, Prescriptions } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, Check, Clock, Stethoscope } from "lucide-react";
import { Button } from "../ui/button";
import { formatDate } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useState } from "react";

export const PrescriptionWindow = ({ prescription, isRecent = false }: { prescription: Prescriptions, isRecent: boolean }) => {

    const [completedCheckups, setCompletedCheckups] = useState<{ [key: string]: boolean }>({});
    const toggleCheckup = (checkupId: string) => {
        setCompletedCheckups(prev => ({
            ...prev,
            [checkupId]: !prev[checkupId]
        }));
    };

    return (
        <>
            {prescription && (
                <Card className="w-full mb-3 border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2 pt-4">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex-1">
                                <CardTitle className="text-base font-bold text-gray-900 leading-tight">
                                    {isRecent ? '📋 Recent Prescription' : `Prescription - ${prescription.createdAt ? formatDate(prescription.createdAt.toString()) : ''}`}
                                </CardTitle>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                <Calendar className="w-3 h-3 mr-1" />
                                {prescription.createdAt ? formatDate(prescription.createdAt.toString()) : ''}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        {/* Medicines */}
                        <div className="space-y-2">
                            {prescription.medicine_list.map((medicine: MedicineEntry, idx: number) => (
                                <div key={idx} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                                    <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-1">{medicine.name}</h4>

                                    {/* Compact Dosage Grid */}
                                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                                        <div className="bg-white rounded-md p-1.5 text-center border border-blue-200">
                                            <div className="text-[10px] text-gray-500 font-medium">Morning</div>
                                            <div className="text-blue-700 font-bold text-sm">
                                                {medicine.dosage.morning || '-'}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-md p-1.5 text-center border border-blue-200">
                                            <div className="text-[10px] text-gray-500 font-medium">Afternoon</div>
                                            <div className="text-blue-700 font-bold text-sm">
                                                {medicine.dosage.afternoon || '-'}
                                            </div>
                                        </div>
                                        <div className="bg-white rounded-md p-1.5 text-center border border-blue-200">
                                            <div className="text-[10px] text-gray-500 font-medium">Night</div>
                                            <div className="text-blue-700 font-bold text-sm">
                                                {medicine.dosage.night || '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center text-gray-600">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDate(medicine.time)}
                                        </div>
                                        <div className="bg-white px-2 py-0.5 rounded-full border border-blue-200">
                                            <span className="font-semibold text-blue-700">{medicine.before_after_food}</span>
                                            <span className="text-gray-600"> food</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Checkups */}
                        {prescription.checkups && prescription.checkups.length > 0 && (
                            <div className="space-y-1.5">
                                <h4 className="font-semibold text-gray-800 text-xs flex items-center">
                                    <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
                                    Recommended Tests
                                </h4>
                                {prescription.checkups.map((checkup) => (
                                    <div key={checkup.id} className="flex items-center justify-between bg-amber-50 p-2 rounded-md border border-amber-200">
                                        <span className="text-xs text-gray-700 font-medium">{checkup.name}</span>
                                        <Button
                                            size="sm"
                                            variant={completedCheckups[checkup.id] || checkup.completed ? "default" : "outline"}
                                            onClick={() => toggleCheckup(checkup.id)}
                                            className="h-6 px-2 text-xs"
                                        >
                                            <Check className="w-3 h-3 mr-1" />
                                            {completedCheckups[checkup.id] || checkup.completed ? 'Done' : 'Mark'}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Prescription & Doctor Details - Combined */}
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-xs mb-1.5">Prescription</h4>
                                    <div className="space-y-0.5 text-[11px]">
                                        <p className="text-gray-600 truncate">ID: {prescription.id.slice(0, 8)}...</p>
                                        <p className="text-gray-600">{formatDate(prescription.prescription_date)}</p>
                                        {prescription.prescription_text && (
                                            <p className="text-gray-600 line-clamp-2">{prescription.prescription_text}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-800 text-xs mb-1.5">Doctor</h4>
                                    <div className="space-y-0.5 text-[11px]">
                                        <p className="text-gray-900 font-medium line-clamp-1">Dr. {prescription.doctor.name}</p>
                                        <p className="text-gray-600 line-clamp-1">{prescription.doctor.specialization}</p>
                                        <p className="text-gray-600 line-clamp-1">{prescription.doctor.hospital}</p>
                                        {prescription.doctor.experience && (
                                            <p className="text-gray-600">{prescription.doctor.experience} yrs exp</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>);
};

