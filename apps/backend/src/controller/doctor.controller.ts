import { Response, Request } from "express";
import prisma from "@repo/db";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const getDoctorById = async (req: Request, res: Response) => {
    try {
        const id = req.userId;

        let doctor = await prisma.doctor.findUnique({ where: { id } });

        if (!doctor) {
            // First time the doctor hits the API — provision their record from Clerk
            const clerkUser = await clerkClient.users.getUser(id);
            const name =
                [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
                clerkUser.username ||
                "Doctor";
            const email = clerkUser.emailAddresses[0]?.emailAddress || "";
            const primaryEmailId = clerkUser.primaryEmailAddressId || clerkUser.id;

            doctor = await prisma.doctor.create({
                data: {
                    id,
                    name,
                    primary_email_address_id: primaryEmailId,
                    username: clerkUser.username || "",
                    email,
                },
            });
        }

        return res.status(200).json(doctor);
    } catch (error) {
        console.error(error);
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
                primary_email_address_id: req.body.primary_email_address_id || "",
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




