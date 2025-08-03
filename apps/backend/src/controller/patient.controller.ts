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

