import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import prisma from "@repo/db";
import { PatientContextCache, NormalisedPatientContext } from "./patientContextCache.service";
import { selectContext, ContextSelection } from "./contextSelector.service";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

interface AIAnalysisResult {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    documentType: string;
    confidence: number;
    detectedConditions?: string[];
    medications?: string[];
    labValues?: Record<string, string>;
}

/**
 * Analyze medical document or image using Gemini AI
 * @param imageData Base64 encoded image data or file buffer
 * @param documentType Type of document (lab, prescription, diagnosis, etc.)
 * @returns AI analysis results
 */
export async function analyzeMedicalDocument(
    imageData: string,
    documentType: string = "general"
): Promise<AIAnalysisResult> {
    try {

        // Remove data URL prefix if present
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");

        const prompt = `You are a medical AI assistant analyzing a medical document/image.
Document Type: ${documentType}

Please analyze this medical document and provide:
1. A brief summary of what this document contains
2. Key findings or important information
3. Any medications mentioned (if applicable)
4. Any lab values or test results (if applicable)
5. Detected medical conditions or diagnoses
6. Recommendations or important notes for the patient

Format your response as JSON with the following structure:
{
  "summary": "Brief overview of the document",
  "keyFindings": ["Finding 1", "Finding 2", ...],
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "documentType": "detected document type (lab report, prescription, diagnosis, etc.)",
  "confidence": 0.0-1.0 (your confidence in the analysis),
  "detectedConditions": ["Condition 1", "Condition 2", ...] (if any),
  "medications": ["Medicine 1", "Medicine 2", ...] (if any),
  "labValues": {"Test Name": "Value", ...} (if applicable)
}

Important: 
- Be accurate and only state what you can clearly see
- If something is unclear, mention it in the summary
- For lab reports, extract all visible test names and values
- For prescriptions, extract all medication names and dosages
- Always prioritize patient safety in recommendations`;

        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                prompt,
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Data,
                    },
                },
            ],
        });

        const text = await result.text;
        if (!text) {
            throw new Error("No text response from AI");
        }

        // Parse JSON response
        let analysisResult: AIAnalysisResult;
        try {
            // Remove markdown code blocks if present
            const cleanText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            analysisResult = JSON.parse(cleanText);
        } catch (parseError) {
            // If JSON parsing fails, create a structured response from the text
            analysisResult = {
                summary: text,
                keyFindings: [],
                recommendations: [],
                documentType: documentType,
                confidence: 0.7,
            };
        }

        return analysisResult;
    } catch (error) {
        console.error("Error analyzing document with Gemini:", error);
        throw new Error("Failed to analyze document. Please try again.");
    }
}

/**
 * Analyze prescription image specifically
 */
export async function analyzePrescription(imageData: string): Promise<AIAnalysisResult> {
    const result = await analyzeMedicalDocument(imageData, "prescription");
    return result;
}

/**
 * Analyze lab report image specifically
 */
export async function analyzeLabReport(imageData: string): Promise<AIAnalysisResult> {
    const result = await analyzeMedicalDocument(imageData, "lab");
    return result;
}

export interface PatientQueryResult {
    text: string;
    contextMeta: {
        slicesUsed: string[];
        fromCache: boolean;
        prescriptionCount: number;
        documentCount: number;
    };
}

/**
 * Fetch and normalise patient context from DB, then cache it
 */
async function fetchAndCachePatientContext(patientId: string): Promise<NormalisedPatientContext> {
    const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: {
            id: true,
            name: true,
            age: true,
            gender: true,
            blood_group: true,
            prescriptions: {
                orderBy: { prescription_date: 'desc' },
                take: 5,
                select: {
                    prescription_date: true,
                    doctor: { select: { name: true } },
                    medicine_list: { select: { name: true, dosage: true } },
                },
            },
            documents: {
                select: {
                    type: true,
                    name: true,
                    ai_summary: true,
                    ai_key_findings: true,
                    ai_detected_conditions: true,
                    ai_medications: true,
                    ai_lab_values: true,
                },
            },
        },
    });

    if (!patient) {
        throw new Error("Patient not found");
    }

    // Flatten medications from all prescriptions
    const medicationSet = new Set<string>();
    patient.prescriptions.forEach(rx => {
        rx.medicine_list.forEach(m => medicationSet.add(m.name));
    });

    // Flatten conditions from all documents
    const conditionSet = new Set<string>();
    patient.documents.forEach(doc => {
        (doc.ai_detected_conditions as string[] | null)?.forEach(c => conditionSet.add(c));
    });

    const labDocuments = patient.documents
        .filter(doc => doc.type === 'lab' || doc.type === 'lab_report')
        .map(doc => ({
            name: doc.name,
            summary: doc.ai_summary,
            keyFindings: doc.ai_key_findings as string[] | null,
            detectedConditions: doc.ai_detected_conditions as string[] | null,
            medications: doc.ai_medications as string[] | null,
            labValues: doc.ai_lab_values as Record<string, string> | null,
        }));

    const otherDocuments = patient.documents
        .filter(doc => doc.type !== 'lab' && doc.type !== 'lab_report')
        .map(doc => ({
            name: doc.name,
            summary: doc.ai_summary,
            keyFindings: doc.ai_key_findings as string[] | null,
            detectedConditions: doc.ai_detected_conditions as string[] | null,
            medications: doc.ai_medications as string[] | null,
            labValues: null,
        }));

    const normalised: NormalisedPatientContext = {
        profile: {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            blood_group: patient.blood_group,
        },
        medications: Array.from(medicationSet),
        recentPrescriptions: patient.prescriptions.map(rx => ({
            date: rx.prescription_date
                ? new Date(rx.prescription_date).toISOString().split('T')[0]
                : 'unknown date',
            doctorName: rx.doctor?.name ?? 'Unknown',
            medicines: rx.medicine_list.map(m => ({
                name: m.name,
                dosage: m.dosage ?? null,
                frequency: null,
            })),
        })),
        labDocuments,
        otherDocuments,
        conditions: Array.from(conditionSet),
        prescriptionCount: patient.prescriptions.length,
        documentCount: patient.documents.length,
    };

    PatientContextCache.set(patientId, normalised);
    return normalised;
}

/**
 * Answer a free-form patient query using cached context + keyword-selected slices
 */
export async function analyzePatientQuery(
    query: string,
    patientId: string
): Promise<PatientQueryResult> {
    // Cache check — DB hit only on miss
    let fromCache = true;
    let context = PatientContextCache.get(patientId);
    if (!context) {
        fromCache = false;
        context = await fetchAndCachePatientContext(patientId);
    }

    // Select only the relevant context slices for this query
    const selection: ContextSelection = selectContext(query, context);

    const prompt = `You are a medical AI assistant. Answer the patient's question using ONLY the data below.
If something is not in the data, say so — do not guess.

--- PATIENT DATA ---
${selection.text}
--------------------

QUESTION: ${query}

Rules:
- Cite specific values or dates from the data when relevant
- Keep the answer clear and factual
- End with: "Please consult your doctor before making any changes."`;

    const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = result.text ?? "I was unable to generate a response. Please try again.";

    return {
        text,
        contextMeta: {
            slicesUsed: selection.slicesUsed,
            fromCache,
            prescriptionCount: context.prescriptionCount,
            documentCount: context.documentCount,
        },
    };
}

/**
 * Extract text from medical document (OCR)
 */
export async function extractTextFromDocument(imageData: string): Promise<string> {
    try {

        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");

        const result = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                "Extract all text from this medical document. Return only the extracted text, maintaining the original structure as much as possible.",
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Data,
                    },
                },
            ],
        });

        const text = await result.text;
        if (!text) {
            throw new Error("No text response from AI");
        }
        return text;
    } catch (error) {
        console.error("Error extracting text:", error);
        throw new Error("Failed to extract text from document.");
    }
}

