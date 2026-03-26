import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Intent {
    type: string;
    confidence: number;
    entities: Record<string, any>;
    data?: any;
}

export class IntentRouterService {
    private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    /**
     * Detect intent from user query using Gemini
     */
    static async detectIntent(query: string): Promise<Intent> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

            const prompt = `
You are an intent classifier for a medical voice assistant. Analyze the user's query and classify it into one of these intents:

Intents:
1. GET_PRESCRIPTIONS - User wants to see/know about prescriptions
2. GET_DOCUMENTS - User wants to see medical documents/reports
3. GET_SUMMARY - User wants a summary of their medical history
4. GET_MEDICATIONS - User wants to know about specific medications
5. GET_LAB_RESULTS - User wants to see lab test results
6. GET_APPOINTMENTS - User wants to see appointments
7. GET_DOCTOR_INFO - User wants information about their doctor
8. EXPLAIN_CONDITION - User wants explanation about a medical condition
9. EXPLAIN_MEDICATION - User wants explanation about a medication
10. GENERAL_HEALTH_QUERY - General health-related question
11. CHITCHAT - Casual conversation/greetings
12. UNKNOWN - Cannot determine intent

User Query: "${query}"

Respond ONLY with a JSON object in this format:
{
  "type": "INTENT_TYPE",
  "confidence": 0.95,
  "entities": {
    "medication": "aspirin",
    "timeframe": "recent",
    "document_type": "lab_report"
  }
}

Extract any relevant entities from the query. Confidence should be between 0 and 1.
`;

            const result = await model.generateContent(prompt);
            const response = result.response.text();

            // Parse JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Failed to parse intent from response');
            }

            const intent: Intent = JSON.parse(jsonMatch[0]);

            return intent;

        } catch (error) {
            console.error('Error detecting intent:', error);
            // Return unknown intent as fallback
            return {
                type: 'UNKNOWN',
                confidence: 0.0,
                entities: {}
            };
        }
    }

    /**
     * Validate if intent requires specific permissions
     */
    static validatePermissions(intent: Intent, userRole: string): boolean {
        // Add permission logic here if needed
        // For now, all intents are allowed
        return true;
    }
}

