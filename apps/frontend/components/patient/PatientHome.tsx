import { Patient, Prescriptions } from "@/types";
import { Card, CardContent } from "../ui/card";
import { ChevronDown, ChevronUp, FileText, Pill } from "lucide-react";
import { PrescriptionWindow } from "./PrescriptionWindow";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Button } from "../ui/button";

const PatientHome = ({ patient }: { patient: Patient }) => {
    const [expandedPrescription, setExpandedPrescription] = useState(0);
    const [completedCheckups, setCompletedCheckups] = useState<{ [key: string]: boolean }>({});
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const handleExpandPrescription = (index: number) => {
        setExpandedPrescription(expandedPrescription === index ? -1 : index);
    };
    // Check if there are no prescriptions
    const hasNoPrescriptions = !patient.prescriptions || patient.prescriptions.length === 0;

    return (
        <div className="space-y-4">
            {hasNoPrescriptions ? (
                /* Empty State - No Prescriptions */
                <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50/30">
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                <Pill className="w-10 h-10 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Prescriptions Yet</h3>
                                <p className="text-gray-600 max-w-md">
                                    You don't have any prescriptions at the moment. Your prescriptions will appear here once your doctor adds them.
                                </p>
                            </div>
                            <div className="flex gap-3 mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/dashboard/patient/records')}
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                >
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Records
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Recent Prescription */}
                    {patient.prescriptions && patient.prescriptions.length > 0 && (
                        <PrescriptionWindow prescription={patient.prescriptions[0] as Prescriptions} isRecent={true} />
                    )}

                    {/* Other Prescriptions */}
                    {patient.prescriptions && patient.prescriptions.length > 1 && (
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Previous Prescriptions</h3>
                            {patient.prescriptions.slice(1, 5).map((prescription, index) => (
                                <div key={prescription.id}>
                                    <Card
                                        className="cursor-pointer hover:shadow-md transition-shadow"
                                        onClick={() => handleExpandPrescription(index + 1)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-800">Prescription - {prescription && prescription.createdAt ? formatDate(prescription.createdAt.toString()) : ''}</p>
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
                    )}
                </>
            )}
        </div>
    );
};

export default PatientHome;