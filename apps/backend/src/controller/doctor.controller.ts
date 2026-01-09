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
        if (!doctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }
        return res.status(200).json(doctor);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: (error as Error).message });
    }
};


export const getAllDoctors = async (_req: Request, res: Response) => {
    try {
        const doctors = await prisma.doctor.findMany();
        res.status(200).json(doctors);
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: (error as Error).message });
    }
};

export const updateDoctor = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const doctor = await prisma.doctor.upsert({
            where: { id: id as string },
            update: {
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
            create: {
                id: id as string,
                primary_email_address_id: req.body.primary_email_address_id,
                medical_registration_number: req.body.medical_registration_number,
                name: req.body.clinic_name,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
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
            }
        });
        res.status(200).json(doctor);
    } catch (error) {
        console.log(error)
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

export const getRecentPatients = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { page = 1, limit = 10 } = req.query;
        console.log(userId)
        const patients = await prisma.patient.findMany({
            where: {
                doctor_id: userId
            },
            orderBy: {
                updatedAt: 'desc'
            },
        });
        console.log(patients)
        res.status(200).json(patients);
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: (error as Error).message });
    }
}



export const doctorWebhook = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        if (body.type === "user.created") {
            const doctor = await prisma.doctor.findUnique({
                where: {
                    id: body.data.id
                }
            })
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

