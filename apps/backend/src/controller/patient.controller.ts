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
                        id: true,
                        file_url: true,
                        type: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                        ai_summary: true,
                        ai_key_findings: true,
                        ai_recommendations: true,
                        ai_detected_conditions: true,
                        ai_medications: true,
                        ai_lab_values: true,
                        ai_confidence: true,
                        ai_analyzed_at: true
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
    const imageData = req.body.imageData; // Base64 image data for AI analysis
    console.log(imageData)

    try {
        // Perform AI analysis first if image data is provided
        let aiAnalysis = null;
        if (imageData) {
            try {
                const { analyzeMedicalDocument } = await import('../services/ai-analysis.service');
                aiAnalysis = await analyzeMedicalDocument(imageData, type);
                console.log("AI Analysis completed:", aiAnalysis);
            } catch (aiError) {
                console.error("AI Analysis failed:", aiError);
                // Continue even if AI analysis fails
            }
        }

        // Create document in database with AI analysis results
        const newDocument = await prisma.$transaction(async (tx) => {
            const patient = await tx.patient.findFirst({ where: { id: patientId } })
            console.log("Calling controller")
            if (!patient) throw new Error("Patient not found")

            const doc = await tx.document.create({
                data: {
                    patient_id: patientId,
                    file_url: fileUrl,
                    type: type,
                    // Save AI analysis results
                    ai_summary: aiAnalysis?.summary || undefined,
                    ai_key_findings: aiAnalysis?.keyFindings || [],
                    ai_recommendations: aiAnalysis?.recommendations || [],
                    ai_detected_conditions: aiAnalysis?.detectedConditions || [],
                    ai_medications: aiAnalysis?.medications || [],
                    ai_lab_values: aiAnalysis?.labValues || undefined,
                    ai_confidence: aiAnalysis?.confidence || undefined,
                    ai_analyzed_at: aiAnalysis ? new Date() : undefined,
                }
            })

            await tx.patient.update({
                where: { id: patientId },
                data: {
                    document_id: doc.id,
                }
            })

            return doc;
        })

        res.status(200).json({
            document: newDocument,
            aiAnalysis: aiAnalysis
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: (error as Error).message });
    }
}