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
        </>);
};

