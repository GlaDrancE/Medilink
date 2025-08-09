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
            data: {
                address: req.body.clinic_address,
                bio: req.body.bio,
                experience: req.body.years_of_experience,
                hospital: req.body.clinic_name,
                license_number: req.body.license_number,
                specialization: req.body.specialization,
                phone: req.body.clinic_phone_number,
                consultation_fees: Number(req.body.consultation_fees),
                consultation_type: req.body.consultation_type,
                qualifications: req.body.qualifications,
            },
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



export const doctorWebhook = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        if (body.type === "user.created") {
            console.log(body.data)
            const doctor = await prisma.doctor.findUnique({
                where: {
                    id: body.data.id
                }
            })
            console.log(doctor)
            if (doctor) {
                res.status(200).json(doctor);
                return;
            }
            else {
                const doctor = await prisma.doctor.create({
                    data: {
                        id: body.data.id,
                        name: body.data.first_name + " " + body.data.last_name,
                        primary_email_address_id: body.data.primary_email_address_id || '',
                        username: body.data.username || '',
                    }
                });
                res.status(200).json(doctor);
                return;
            }
        }

    } catch (error) {
        console.log(error)
        res.status(400).json({ error: (error as Error).message });
    }
}