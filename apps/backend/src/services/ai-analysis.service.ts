import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

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

