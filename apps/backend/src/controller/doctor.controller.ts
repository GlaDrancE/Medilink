import { Response, Request } from "express";
import prisma from "@repo/db";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const getDoctorById = async (req: Request, res: Response) => {
    try {
        const id = req.userId;
        const doctor = await prisma.doctor.findUnique({
            where: {
                id: id as string
            }
        })
        res.status(200).json(doctor);

    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};


export const createDoctor = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const doctor = await prisma.doctor.create({ data: { name: req.body.name, email: req.body.email, password: req.body.password, id: userId } });
        const token = generateToken({ id: doctor.id, role: "doctor" });
        res.status(201).json({ doctor, token });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const getAllDoctors = async (_req: Request, res: Response) => {
    try {
        const doctors = await prisma.doctor.findMany();
        res.status(200).json(doctors);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateDoctor = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const doctor = await prisma.doctor.update({
            where: { id },
            data: req.body,
        });
        res.status(200).json(doctor);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

export const deleteDoctor = async (req: Request, res: Response) => {
    const id = req.userId;
    try {
        await prisma.doctor.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};

