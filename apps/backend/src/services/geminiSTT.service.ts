import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';

export class GeminiSTTService {
    private static genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

    /**
     * Transcribe audio using Google Cloud Speech-to-Text API
     * Falls back to Gemini if Google Speech API is not available
     */
    static async transcribeAudio(audioBuffer: Buffer): Promise<string> {
        try {
            // Try Google Cloud Speech-to-Text first (if credentials available)
            if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
                return await this.googleSpeechToText(audioBuffer);
            }

            // Fallback to Gemini (if it supports audio in the future)
            // For now, return a placeholder
            console.warn('Google Speech-to-Text not configured. Using fallback.');
            return await this.geminiAudioToText(audioBuffer);

        } catch (error) {
            console.error('Error transcribing audio:', error);
            throw new Error('Failed to transcribe audio');
        }
    }

    /**
     * Google Cloud Speech-to-Text API
     */
    private static async googleSpeechToText(audioBuffer: Buffer): Promise<string> {
        try {
            const auth = new GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            });

            const client = await auth.getClient();
            const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
            const url = `https://speech.googleapis.com/v1/speech:recognize`;

            // Convert audio buffer to base64
            const audioContent = audioBuffer.toString('base64');

            const requestBody = {
                config: {
                    encoding: 'WEBM_OPUS',
                    sampleRateHertz: 48000,
                    languageCode: 'en-US',
                    enableAutomaticPunctuation: true,
                    model: 'default',
                },
                audio: {
                    content: audioContent,
                },
            };

            const response = await axios.post(url, requestBody, {
                headers: {
                    'Authorization': `Bearer ${await client.getAccessToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.results && response.data.results.length > 0) {
                const transcript = response.data.results
                    .map((result: any) => result.alternatives[0].transcript)
                    .join(' ');
                return transcript;
            }

            throw new Error('No transcription results');

        } catch (error) {
            console.error('Google Speech-to-Text error:', error);
            throw error;
        }
    }

    /**
     * Gemini-based audio transcription (placeholder for future support)
     */
    private static async geminiAudioToText(audioBuffer: Buffer): Promise<string> {
        // Note: Gemini 1.5 Pro supports audio input
        // This is a placeholder implementation
        try {
            // For now, we can't directly process audio with Gemini in the same way
            // You would need to convert audio to text using a different method
            // or wait for better audio support in Gemini API

            throw new Error('Gemini audio transcription not yet implemented. Please use Google Speech-to-Text API or provide transcript directly.');

        } catch (error) {
            console.error('Gemini audio transcription error:', error);
            throw error;
        }
    }

    /**
     * Convert audio to compatible format if needed
     */
    private static async convertAudioFormat(audioBuffer: Buffer): Promise<Buffer> {
        // TODO: Add audio format conversion logic if needed
        // You might need to use ffmpeg or similar library
        return audioBuffer;
    }
}

