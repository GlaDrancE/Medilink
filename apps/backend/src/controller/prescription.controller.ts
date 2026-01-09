import { Response, Request } from "express";
import prisma from "@repo/db";
import { randomUUIDv7 } from "bun";
import { sendPrescriptionEmail } from "../services/notification.service";

export const getPrescription = async (req: Request, res: Response) => {
    const userId = req.userId;
    const prescriptions = await prisma.patient.findFirst({
        where: { id: userId },
        include: {
            prescriptions: {
                include: {
                    medicine_list: true,
                    checkups: true,
                    doctor: {
                        select: {
                            name: true,
                            specialization: true,
                            hospital: true,
                            experience: true
                        }
                    }
                },
                orderBy: {
                    index: 'asc'
                }
            }
        }
    });
    res.status(200).json(prescriptions);
}

export const addPrescription = async (req: Request, res: Response) => {
    try {
        const { patient_id, prescription_text, patient, medicine_list } = req.body;
        const userId = req.userId;

        const _patient = await prisma.patient.findFirst({ where: { id: patient_id } });
        let newPatient = null;

        if (!_patient) {
            newPatient = await prisma.patient.create({
                data: {
                    id: randomUUIDv7() as string,
                    phone: patient.phone,
                    name: patient.name,
                    age: Number(patient.age),
                    gender: patient.gender,
                    weight: Number(patient.weight),
                }
            })
        }
        const doctor = await prisma.doctor.findUnique({ where: { id: userId } });


        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }

        const prescription = await prisma.$transaction(async (tx) => {
            // Get the max index for this patient
            const lastPrescription = await tx.prescriptions.findFirst({
                where: { patient_id: patient_id },
                orderBy: { index: 'desc' },
            });
            const newIndex = lastPrescription ? lastPrescription.index + 1 : 1;

            const prescription = await tx.prescriptions.create({
                data: {
                    index: newIndex,
                    patient_id: newPatient?.id || patient_id,
                    doctor_id: userId,
                    prescription_text,
                    is_active: true,
                }
            });
            await tx.medicine.createMany({
                data: medicine_list.map((medicine: any) => ({
                    name: medicine.name,
                    dosage: medicine.dosage,
                    time: new Date(medicine.time),
                    before_after_food: medicine.before_after_food.toUpperCase(),
                    prescription_id: prescription.id,
                }))
            });
            return prescription
        })
        res.status(201).json(prescription);
    } catch (error) {
        console.log("Error", error);
        res.status(400).json({ error: (error as Error).message });
    }
};

export const updateMedicine = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const medicine = await prisma.medicine.update({ where: { id }, data: req.body });
        res.status(200).json(medicine);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
}; 