import { GoogleAuth } from 'google-auth-library';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';

export class GeminiTTSService {
    /**
     * Synthesize speech from text using Google Cloud Text-to-Speech API
     */
    static async synthesizeSpeech(text: string): Promise<string> {
        try {
            // Use Google Cloud Text-to-Speech
            if (process.env.GOOGLE_CLOUD_PROJECT_ID) {
                return await this.googleTextToSpeech(text);
            }

            // Fallback to a simple URL return (for development)
            console.warn('Google Text-to-Speech not configured. Using fallback.');
            return await this.fallbackTTS(text);

        } catch (error) {
            console.error('Error synthesizing speech:', error);
            throw new Error('Failed to synthesize speech');
        }
    }

    /**
     * Google Cloud Text-to-Speech API
     */
    private static async googleTextToSpeech(text: string): Promise<string> {
        try {
            const auth = new GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            });

            const client = await auth.getClient();
            const url = `https://texttospeech.googleapis.com/v1/text:synthesize`;

            const requestBody = {
                input: { text },
                voice: {
                    languageCode: 'en-US',
                    name: 'en-US-Neural2-F', // Female voice
                    ssmlGender: 'FEMALE',
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: 1.0,
                    pitch: 0.0,
                    volumeGainDb: 0.0,
                },
            };

            const response = await axios.post(url, requestBody, {
                headers: {
                    'Authorization': `Bearer ${await client.getAccessToken()}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.audioContent) {
                // Save audio to temporary file or upload to cloud storage
                const audioBuffer = Buffer.from(response.data.audioContent, 'base64');
                const audioUrl = await this.saveAudioFile(audioBuffer);
                return audioUrl;
            }

            throw new Error('No audio content in response');

        } catch (error) {
            console.error('Google Text-to-Speech error:', error);
            throw error;
        }
    }

    /**
     * Save audio file to storage and return URL
     * In production, you should upload to cloud storage (S3, Cloudinary, etc.)
     */
    private static async saveAudioFile(audioBuffer: Buffer): Promise<string> {
        try {
            const filename = `${uuidv4()}.mp3`;

            // For production: Upload to Cloudinary or S3
            if (process.env.CLOUDINARY_URL) {
                return await this.uploadToCloudinary(audioBuffer, filename);
            }

            // For development: Save locally
            const filepath = path.join(process.cwd(), 'public', 'audio', filename);
            await writeFile(filepath, audioBuffer);

            return `/audio/${filename}`;

        } catch (error) {
            console.error('Error saving audio file:', error);
            throw error;
        }
    }

    /**
     * Upload audio to Cloudinary
     */
    private static async uploadToCloudinary(audioBuffer: Buffer, filename: string): Promise<string> {
        try {
            const FormData = require('form-data');
            const formData = new FormData();

            formData.append('file', audioBuffer, {
                filename,
                contentType: 'audio/mpeg',
            });
            formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default');
            formData.append('resource_type', 'video'); // 'video' resource type for audio files

            const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dduj1ln0v';
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                formData,
                {
                    headers: formData.getHeaders(),
                }
            );

            return response.data.secure_url;

        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw error;
        }
    }

    /**
     * Fallback TTS (returns a mock URL for development)
     */
    private static async fallbackTTS(text: string): Promise<string> {
        // In development, you might want to use a free TTS API or return a mock URL
        console.log('TTS Fallback - Text:', text);

        // Option 1: Use Web Speech API on client side (return empty string to trigger client-side TTS)
        return '';

        // Option 2: Use a free TTS service (example: Google Translate TTS)
        // Note: This is not officially supported and may break
        // const encodedText = encodeURIComponent(text);
        // return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=en&client=tw-ob`;
    }

    /**
     * Delete temporary audio file
     */
    static async deleteAudioFile(filepath: string): Promise<void> {
        try {
            await unlink(filepath);
        } catch (error) {
            console.error('Error deleting audio file:', error);
        }
    }
}

