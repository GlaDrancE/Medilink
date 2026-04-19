import { Response, Request } from "express";
import prisma from "@repo/db";
import { randomUUIDv7 } from "bun";
import { sendPrescriptionEmail } from "../services/notification.service";
import { getDoctorFollowUps } from "../services/prescription.service";
import { PatientContextCache } from "../services/patientContextCache.service";

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

        const _patient = await prisma.patient.findFirst({
            where: { id: patient_id },
            include: { doctors: { select: { id: true } } },
        });
        let newPatient = null;
        
        const doctor = await prisma.doctor.findUnique({ where: { id: userId } });


        if (!doctor) {
            return res.status(404).json({ error: "Doctor not found" });
        }


        if (!_patient) {
            newPatient = await prisma.patient.create({
                data: {
                    id: randomUUIDv7() as string,
                    phone: patient.phone,
                    name: patient.name,
                    age: Number(patient.age),
                    gender: patient.gender,
                    weight: Number(patient.weight),
                    doctors: {
                        connect: { id: userId },
                    },
                },
                include: {
                    doctors: {
                        select: {
                            id: true,
                            name: true,
                            hospital: true,
                            specialization: true,
                        },
                    },
                },
            })
        } else {
            const alreadyLinked = _patient.doctors.some((d) => d.id === userId);
            if (!alreadyLinked) {
                await prisma.patient.update({
                    where: { id: _patient.id },
                    data: { doctors: { connect: { id: userId } } },
                });
            }
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

        // Fire email notification (non-blocking for DB transaction)
        try {
            const patientRecord =
                newPatient ??
                (await prisma.patient.findFirst({
                    where: { id: prescription.patient_id },
                }));

            if (patientRecord) {
                await sendPrescriptionEmail({
                    patient: {
                        name: patientRecord.name,
                        email: patientRecord.email,
                        age: patientRecord.age,
                        weight: patientRecord.weight,
                        // height is not persisted; use value from request body if present
                        height: patient.height ?? null,
                        phone: patientRecord.phone,
                    },
                    doctor: {
                        name: doctor.name,
                        hospital: doctor.hospital,
                    },
                    medicines: medicine_list ?? [],
                    prescriptionId: prescription.id,
                    prescriptionDate: prescription.createdAt,
                });
            }
        } catch (notifyError) {
            console.error(
                "Failed to send prescription email notification:",
                notifyError
            );
        }

        // Invalidate patient context cache so the next AI query gets fresh data
        PatientContextCache.invalidate(prescription.patient_id);

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

export const getFollowUp = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId;
        const followUps = await getDoctorFollowUps(doctorId);
        res.status(200).json(followUps);
    } catch (error) {
        console.error("getFollowUp error:", error);
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getDoctorPrescriptions = async (req: Request, res: Response) => {
    try {
        const doctorId = req.userId;
        const page  = Math.max(1, Number(req.query.page)  || 1);
        const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
        const search = req.query.search ? String(req.query.search).trim() : undefined;

        const where: any = { doctor_id: doctorId };
        if (search) {
            where.patient = { name: { contains: search, mode: "insensitive" } };
        }

        const [prescriptions, total] = await Promise.all([
            prisma.prescriptions.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    patient: {
                        select: { id: true, name: true, phone: true, age: true, gender: true, blood_group: true },
                    },
                    medicine_list: {
                        select: { id: true, name: true, dosage: true, before_after_food: true },
                    },
                    checkups: {
                        select: { id: true, checkup_text: true, checkup_date: true, is_active: true },
                    },
                },
                orderBy: { prescription_date: "desc" },
            }),
            prisma.prescriptions.count({ where }),
        ]);

        res.status(200).json({
            prescriptions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error("getDoctorPrescriptions error:", error);
        res.status(500).json({ error: (error as Error).message });
    }
}; 