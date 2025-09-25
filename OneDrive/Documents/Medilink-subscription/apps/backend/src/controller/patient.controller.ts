import { Response, Request } from "express";
import prisma from "@repo/db";

export const createPatient = async (req: Request, res: Response) => {
    try {
        
        const patient = await prisma.patient.create({ data: req.body });
        res.status(201).json(patient);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getAllPatients = async (_req: Request, res: Response) => {
    try {
        const patients = await prisma.patient.findMany();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const getPatientById = async (req: Request, res: Response) => {
    const id = req.userId;

    try {
        const patient = await prisma.patient.findFirst({
            where: { id },
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
                },
                documents: {
                    select: {
                        file_url: true,
                        type: true,
                        name: true,
                    }
                }
            }
        });
        if (!patient) res.status(404).json({ message: "Patient not found" });
        res.status(200).json(patient);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: (error as Error).message });
    }
};

export const searchPatientByPhone = async (req: Request, res: Response) => {
    const { phone } = req.query;

    if (!phone || typeof phone !== 'string') {
        return res.status(400).json({ message: "Phone number is required" });
    }

    try {
        const patient = await prisma.patient.findMany({
            where: {
                phone: phone,
                is_active: true
            },
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
                },
                documents: {
                    select: {
                        id: true,
                        file_url: true,
                        type: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        });

        // if (!patient) {
        //     return res.status(404).json({ message: "Patient not found" });
        // }

        res.status(200).json(patient);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updatePatient = async (req: Request, res: Response) => {
    const id = req.userId;
    try {
        const patient = await prisma.patient.update({ where: { id }, data: req.body });
        res.status(200).json(patient);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deletePatient = async (req: Request, res: Response) => {
    const id = req.userId;
    try {
        await prisma.patient.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};




export const uploadDocument = async (req: Request, res: Response) => {
    const patientId = req.userId
    const fileUrl = req.body.fileUrl;
    const type = req.body.type;
    const name = req.body.name;
    try {
        const document = await prisma.$transaction(async (tx) => {
            const patient = await tx.patient.findFirst({ where: { id: patientId } })
            console.log("Calling controller")
            if (!patient) throw new Error("Patient not found")
            const newDocument = await tx.document.create({
                data: {
                    patient_id: patientId,
                    file_url: fileUrl,
                    type: type,
                    name: name,
                }
            })
            await tx.patient.update({
                where: { id: patientId },
                data: {
                    document_id: newDocument.id,
                }
            })
            return newDocument;
        })
        console.log(document)
        res.status(200).json(document);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: (error as Error).message });
    }
}