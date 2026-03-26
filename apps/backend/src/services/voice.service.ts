import { GoogleGenerativeAI } from '@google/generative-ai';
import { Intent } from './intentRouter.service';
import prisma from '@repo/db';

export class VoiceService {
    private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    /**
     * Process intent and generate response
     */
    static async processIntent(
        intent: Intent,
        query: string,
        patientId: string,
        user: any
    ): Promise<string> {
        try {
            // Get patient context (all medical data)
            const context = await this.getPatientContext(patientId, user);

            // Route to appropriate handler based on intent
            switch (intent.type) {
                case 'GET_PRESCRIPTIONS':
                    return await this.handleGetPrescriptions(context, query, intent);

                case 'GET_DOCUMENTS':
                    return await this.handleGetDocuments(context, query, intent);

                case 'GET_SUMMARY':
                    return await this.handleGetSummary(context, query, intent);

                case 'GET_MEDICATIONS':
                    return await this.handleGetMedications(context, query, intent);

                case 'GET_LAB_RESULTS':
                    return await this.handleGetLabResults(context, query, intent);

                case 'EXPLAIN_CONDITION':
                case 'EXPLAIN_MEDICATION':
                case 'GENERAL_HEALTH_QUERY':
                    return await this.handleExplanation(context, query, intent);

                case 'CHITCHAT':
                    return await this.handleChitChat(query);

                default:
                    return await this.handleUnknown(context, query);
            }

        } catch (error) {
            console.error('Error processing intent:', error);
            return 'I apologize, but I encountered an error processing your request. Please try again.';
        }
    }

    /**
     * Get complete patient context including all documents and summaries
     */
    static async getPatientContext(patientId: string, user: any) {
        try {
            const patient = await prisma.patient.findUnique({
                where: { id: patientId },
                include: {
                    documents: true,
                    prescriptions: {
                        include: {
                            doctor: true,
                        },
                        orderBy: {
                            prescription_date: 'desc',
                        },
                    },
                },
            });

            if (!patient) {
                throw new Error('Patient not found');
            }

            // Compile all AI summaries and analyses
            const documentSummaries = patient.documents
                .filter(doc => doc.ai_summary)
                .map(doc => ({
                    type: doc.type,
                    name: doc.name,
                    summary: doc.ai_summary,
                    keyFindings: doc.ai_key_findings,
                    detectedConditions: doc.ai_detected_conditions,
                    medications: doc.ai_medications,
                    labValues: doc.ai_lab_values,
                    analyzedAt: doc.ai_analyzed_at,
                }));

            return {
                patient: {
                    id: patient.id,
                    name: patient.name,
                    age: patient.age,
                    gender: patient.gender,
                    blood_group: patient.blood_group,
                },
                prescriptions: patient.prescriptions,
                documents: documentSummaries,
                documentCount: patient.documents.length,
                prescriptionCount: patient.prescriptions.length,
            };

        } catch (error) {
            console.error('Error getting patient context:', error);
            throw error;
        }
    }

    /**
     * Handle GET_PRESCRIPTIONS intent
     */
    private static async handleGetPrescriptions(context: any, query: string, intent: Intent): Promise<string> {
        const prescriptions = context.prescriptions;

        if (prescriptions.length === 0) {
            return `I don't see any prescriptions on record for ${context.patient.name}. Would you like me to help you with something else?`;
        }

        // Use Gemini to generate natural response
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
You are a medical voice assistant. The user asked: "${query}"

Patient Information:
- Name: ${context.patient.name}
- Age: ${context.patient.age}
- Gender: ${context.patient.gender}

Prescriptions (${prescriptions.length} total):
${JSON.stringify(prescriptions, null, 2)}

Generate a natural, conversational response that:
1. Answers the user's query about prescriptions
2. Is concise and easy to understand when spoken aloud
3. Highlights the most important information
4. Uses a warm, helpful tone

Keep the response under 200 words.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Handle GET_DOCUMENTS intent
     */
    private static async handleGetDocuments(context: any, query: string, intent: Intent): Promise<string> {
        const documents = context.documents;

        if (documents.length === 0) {
            return `I don't see any medical documents on record for ${context.patient.name}. Would you like to upload some documents?`;
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
You are a medical voice assistant. The user asked: "${query}"

Patient Information:
- Name: ${context.patient.name}

Documents (${documents.length} total):
${JSON.stringify(documents, null, 2)}

Generate a natural, conversational response that:
1. Lists the available documents by type
2. Mentions any important findings from AI analysis
3. Is easy to understand when spoken aloud
4. Uses a warm, helpful tone

Keep the response under 200 words.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Handle GET_SUMMARY intent
     */
    private static async handleGetSummary(context: any, query: string, intent: Intent): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
You are a medical voice assistant. The user asked: "${query}"

Complete Patient Context:
${JSON.stringify(context, null, 2)}

Generate a comprehensive but concise summary that:
1. Provides an overview of the patient's medical history
2. Highlights key findings from AI analysis of documents
3. Mentions recent prescriptions and medications
4. Notes any detected health conditions
5. Is conversational and easy to understand when spoken aloud
6. Uses a warm, professional tone

Keep the summary under 300 words.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Handle GET_MEDICATIONS intent
     */
    private static async handleGetMedications(context: any, query: string, intent: Intent): Promise<string> {
        // Collect all medications from prescriptions and AI analysis
        const allMedications = new Set<string>();

        context.prescriptions.forEach((rx: any) => {
            rx.medicine_list?.forEach((med: any) => {
                allMedications.add(med.name);
            });
        });

        context.documents.forEach((doc: any) => {
            doc.medications?.forEach((med: string) => {
                allMedications.add(med);
            });
        });

        if (allMedications.size === 0) {
            return `I don't see any medications on record for ${context.patient.name}. Would you like me to help you with something else?`;
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
You are a medical voice assistant. The user asked: "${query}"

Patient: ${context.patient.name}
Medications found: ${Array.from(allMedications).join(', ')}

Full context:
${JSON.stringify(context, null, 2)}

Generate a natural response that:
1. Lists the medications the patient is taking
2. Provides brief information about dosage if available
3. Is conversational and easy to understand
4. Uses a warm, helpful tone

Keep the response under 200 words.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Handle GET_LAB_RESULTS intent
     */
    private static async handleGetLabResults(context: any, query: string, intent: Intent): Promise<string> {
        const labDocuments = context.documents.filter((doc: any) => doc.type === 'lab' || doc.type === 'lab_report');

        if (labDocuments.length === 0) {
            return `I don't see any lab results on record for ${context.patient.name}. Would you like me to help you with something else?`;
        }

        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
You are a medical voice assistant. The user asked: "${query}"

Patient: ${context.patient.name}

Lab Results:
${JSON.stringify(labDocuments, null, 2)}

Generate a natural response that:
1. Summarizes the lab results
2. Highlights any abnormal values or important findings
3. Mentions when the tests were done
4. Is conversational and easy to understand
5. Uses a warm, professional tone
6. Reminds the patient to consult their doctor for interpretation

Keep the response under 250 words.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Handle explanation requests (EXPLAIN_CONDITION, EXPLAIN_MEDICATION, GENERAL_HEALTH_QUERY)
     */
    private static async handleExplanation(context: any, query: string, intent: Intent): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
You are a medical voice assistant. The user asked: "${query}"

Patient context (for personalization):
${JSON.stringify(context, null, 2)}

Generate a helpful, educational response that:
1. Explains the medical concept in simple terms
2. Relates it to the patient's context if relevant
3. Is accurate but easy to understand
4. Avoids medical jargon or explains terms clearly
5. Is conversational and appropriate for voice output
6. Includes a disclaimer about consulting healthcare providers
7. Uses a warm, professional tone

Keep the response under 300 words.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }

    /**
     * Handle chitchat
     */
    private static async handleChitChat(query: string): Promise<string> {
        const greetings = [
            "Hello! I'm your medical voice assistant. How can I help you today?",
            "Hi there! I'm here to help you with your medical records and health information. What would you like to know?",
            "Good to hear from you! I can help you with prescriptions, medical documents, and health questions. What do you need?",
        ];

        if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
            return greetings[Math.floor(Math.random() * greetings.length)];
        }

        if (query.toLowerCase().includes('thank')) {
            return "You're welcome! Is there anything else I can help you with?";
        }

        if (query.toLowerCase().includes('bye') || query.toLowerCase().includes('goodbye')) {
            return "Goodbye! Feel free to ask me anything about your health records anytime. Take care!";
        }

        return "I'm here to help you with your medical records and health information. What would you like to know?";
    }

    /**
     * Handle unknown intents
     */
    private static async handleUnknown(context: any, query: string): Promise<string> {
        const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `
You are a medical voice assistant. The user asked: "${query}"

Available patient context:
${JSON.stringify(context, null, 2)}

The intent wasn't clearly identified. Try to:
1. Understand what the user is asking for
2. Provide a helpful response based on available data
3. If you can't answer, suggest what they might be looking for
4. Be conversational and appropriate for voice output
5. Use a warm, helpful tone

Keep the response under 200 words.
`;

        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}

