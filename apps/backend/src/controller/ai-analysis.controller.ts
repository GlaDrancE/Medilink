import { Request, Response } from "express";
import { analyzeMedicalDocument, analyzePrescription, analyzeLabReport, analyzePatientQuery } from "../services/ai-analysis.service";

export const analyzeDocument = async (req: Request, res: Response) => {
    try {
        const { imageData, documentType } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: "Image data is required" });
        }

        let analysisResult;

        // Route to specific analyzer based on document type
        switch (documentType) {
            case "prescription":
                analysisResult = await analyzePrescription(imageData);
                break;
            case "lab":
                analysisResult = await analyzeLabReport(imageData);
                break;
            default:
                analysisResult = await analyzeMedicalDocument(imageData, documentType);
        }

        res.status(200).json({
            success: true,
            analysis: analysisResult,
        });
    } catch (error) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({
            error: "Failed to analyze document",
            message: (error as Error).message,
        });
    }
};

export const analyzeDocumentBatch = async (req: Request, res: Response) => {
    try {
        const { documents } = req.body; // Array of {imageData, documentType}

        if (!Array.isArray(documents) || documents.length === 0) {
            return res.status(400).json({ error: "Documents array is required" });
        }

        const analyses = await Promise.all(
            documents.map(async (doc) => {
                try {
                    return await analyzeMedicalDocument(doc.imageData, doc.documentType);
                } catch (error) {
                    return {
                        error: "Failed to analyze document",
                        documentType: doc.documentType,
                    };
                }
            })
        );

        res.status(200).json({
            success: true,
            analyses,
        });
    } catch (error) {
        console.error("Batch AI Analysis Error:", error);
        res.status(500).json({
            error: "Failed to analyze documents",
            message: (error as Error).message,
        });
    }
};

export const analyzePatientQueryHandler = async (req: Request, res: Response) => {
    try {
        const { query, patientId } = req.body;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({ error: "query is required and must be a non-empty string" });
        }

        if (!patientId || typeof patientId !== 'string') {
            return res.status(400).json({ error: "patientId is required" });
        }

        const result = await analyzePatientQuery(query.trim(), patientId);

        res.status(200).json({
            success: true,
            text: result.text,
            contextMeta: result.contextMeta,
        });
    } catch (error) {
        console.error("Patient Query AI Error:", error);
        const message = (error as Error).message;
        if (message === "Patient not found") {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.status(500).json({
            error: "Failed to process patient query",
            message,
        });
    }
};

