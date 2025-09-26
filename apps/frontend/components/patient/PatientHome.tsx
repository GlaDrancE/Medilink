import { Patient, Prescriptions } from "@/types";
import { Card, CardContent } from "../ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PrescriptionWindow } from "./PrescriptionWindow";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

const PatientHome = ({ patient }: { patient: Patient }) => {
    const [expandedPrescription, setExpandedPrescription] = useState(0);
    const [completedCheckups, setCompletedCheckups] = useState<{ [key: string]: boolean }>({});
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);

    const handleExpandPrescription = (index: number) => {
        setExpandedPrescription(expandedPrescription === index ? -1 : index);
    };
    return (
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
        </div>);
};

export default PatientHome;