import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { PrescriptionWindow } from "./PrescriptionWindow";
import { formatDate } from "@/lib/utils";
import { Patient, Prescriptions } from "@/types";
import { useState } from "react";

const PatientPrescription = ({ patient, prescriptions }: { patient: Patient, prescriptions: Prescriptions[] }) => {

    const [expandedPrescription, setExpandedPrescription] = useState(0);
    const handleExpandPrescription = (index: number) => {
        setExpandedPrescription(expandedPrescription === index ? -1 : index);
    };
    return (
        <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">All Prescriptions</h2>
            {patient.prescriptions && patient.prescriptions.map((prescription, index) => (
                <div key={prescription.id}>
                    <Card
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleExpandPrescription(index)}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-gray-800">Prescription - {formatDate(prescription.createdAt.toISOString())}</p>
                                    <p className="text-sm text-gray-600">ID: {prescription.id}</p>
                                </div>
                                {expandedPrescription === index ?
                                    <ChevronUp className="w-5 h-5 text-gray-500" /> :
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                }
                            </div>
                        </CardContent>
                    </Card>
                    {expandedPrescription === index && (
                        <div className="mt-2">
                            <PrescriptionWindow prescription={prescription} isRecent={false} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
export default PatientPrescription;