import { API_ROUTES } from './api.routes';

export interface VoiceInputResponse {
    text: string;
    audioUrl?: string;
    intent?: string;
    data?: any;
}

class VoiceAssistantService {
    /**
     * Process voice input - sends audio to backend for STT, intent recognition, and TTS
     */
    async processVoiceInput(
        audioBlob: Blob,
        patientId: string,
        transcript?: string
    ): Promise<VoiceInputResponse> {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-input.webm');
        formData.append('patientId', patientId);
        if (transcript) {
            formData.append('transcript', transcript);
        }

        const response = await fetch(API_ROUTES.VOICE_ASSISTANT.PROCESS, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to process voice input');
        }

        return response.json();
    }

    /**
     * Send text query (alternative to voice input)
     */
    async sendTextQuery(query: string, patientId: string): Promise<VoiceInputResponse> {
        const response = await fetch(API_ROUTES.VOICE_ASSISTANT.QUERY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, patientId }),
        });

        if (!response.ok) {
            throw new Error('Failed to process text query');
        }

        return response.json();
    }

    /**
     * Get patient context for voice assistant
     */
    async getPatientContext(patientId: string) {
        const response = await fetch(
            API_ROUTES.VOICE_ASSISTANT.CONTEXT(patientId),
            {
                method: 'GET',
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch patient context');
        }

        return response.json();
    }

    /**
     * Convert text to speech (direct TTS)
     */
    async textToSpeech(text: string): Promise<string> {
        const response = await fetch(API_ROUTES.VOICE_ASSISTANT.TTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        if (!response.ok) {
            throw new Error('Failed to convert text to speech');
        }

        const data = await response.json();
        return data.audioUrl;
    }
}

export const voiceAssistantService = new VoiceAssistantService();

