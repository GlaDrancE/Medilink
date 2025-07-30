import { Request, Response } from 'express';
import prisma from "@repo/db";
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';

const SALT_ROUNDS = 10;



// Patient Auth
export const registerPatient = async (req: Request, res: Response) => {
    try {
        // const hashedPassword = await bcrypt.hash(req.body.password, SALT_ROUNDS);
        const patient = await prisma.patient.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                age: Number(req.body.age),
                weight: Number(req.body.weight),
                phone: req.body.phone
            }
        });
        const token = generateToken({ id: patient.id }, "patient");
        res.status(201).json({ patient, token });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: (error as Error).message });
    }
};

export const loginPatient = async (req: Request, res: Response) => {
    try {
        const patient = await prisma.patient.findUnique({ where: { id: req.body.id } });
        if (!patient) return res.status(404).json({ message: "Patient not found" });
        const token = generateToken({ id: patient.id }, "patient");
        console.log(token);

        res.status(200).json({ patient, token });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
};
