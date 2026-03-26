import { Request, Response } from 'express';
import { VoiceService } from '../services/voice.service';
import { IntentRouterService } from '../services/intentRouter.service';
import { GeminiSTTService } from '../services/geminiSTT.service';
import { GeminiTTSService } from '../services/geminiTTS.service';

export class VoiceController {
    /**
     * Process voice input from user
     */
    static async processVoiceInput(req: Request, res: Response) {
        try {
            const audioFile = req.file;
            const { patientId, transcript } = req.body;

            if (!audioFile && !transcript) {
                return res.status(400).json({
                    success: false,
                    message: 'Audio file or transcript is required'
                });
            }

            if (!patientId) {
                return res.status(400).json({
                    success: false,
                    message: 'Patient ID is required'
                });
            }

            // Step 1: Use transcript if provided, otherwise try to transcribe audio
            let textQuery = transcript;

            if (!textQuery && audioFile) {
                // Only attempt transcription if Google Cloud is configured
                if (process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                    try {
                        console.log('Transcribing audio with Google Cloud STT...');
                        textQuery = await GeminiSTTService.transcribeAudio(audioFile.buffer);
                    } catch (sttError) {
                        console.error('STT failed:', sttError);
                        return res.status(400).json({
                            success: false,
                            message: 'Audio transcription failed and no transcript provided.',
                            error: 'STT_FAILED'
                        });
                    }
                } else {
                    return res.status(400).json({
                        success: false,
                        message: 'Transcript is required (Google Cloud STT not configured)'
                    });
                }
            }

            if (!textQuery) {
                return res.status(400).json({
                    success: false,
                    message: 'No query text available'
                });
            }

            console.log('Processing query:', textQuery);

            // Step 2: Intent Recognition & Routing
            const intent = await IntentRouterService.detectIntent(textQuery);

            // Step 3: Process based on intent
            const responseText = await VoiceService.processIntent(
                intent,
                textQuery,
                patientId,
                req.userId
            );

            // Step 4: Skip TTS in development (or use browser TTS)
            // const audioUrl = await GeminiTTSService.synthesizeSpeech(responseText);

            return res.status(200).json({
                success: true,
                text: responseText,
                audioUrl: '', // Empty - frontend will use browser TTS
                intent: intent.type,
                data: intent.data
            });

        } catch (error: any) {
            console.error('Error processing voice input:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process voice input',
                error: error.message
            });
        }
    }

    /**
     * Process text query (alternative to voice)
     */
    static async processTextQuery(req: Request, res: Response) {
        try {
            const { query, patientId } = req.body;

            if (!query || !patientId) {
                return res.status(400).json({
                    success: false,
                    message: 'Query and patient ID are required'
                });
            }

            // Step 1: Intent Recognition & Routing
            const intent = await IntentRouterService.detectIntent(query);

            // Step 2: Process based on intent
            const responseText = await VoiceService.processIntent(
                intent,
                query,
                patientId,
                req.userId
            );

            // Step 3: Text-to-Speech (optional)
            const audioUrl = await GeminiTTSService.synthesizeSpeech(responseText);

            return res.status(200).json({
                success: true,
                text: responseText,
                audioUrl,
                intent: intent.type,
                data: intent.data
            });

        } catch (error: any) {
            console.error('Error processing text query:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to process text query',
                error: error.message
            });
        }
    }

    /**
     * Get patient context for voice assistant
     */
    static async getPatientContext(req: Request, res: Response) {
        try {
            const { patientId } = req.params;

            if (!patientId) {
                return res.status(400).json({
                    success: false,
                    message: 'Patient ID is required'
                });
            }

            const context = await VoiceService.getPatientContext(patientId, req.userId);

            return res.status(200).json({
                success: true,
                context
            });

        } catch (error: any) {
            console.error('Error getting patient context:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get patient context',
                error: error.message
            });
        }
    }

    /**
     * Convert text to speech
     */
    static async textToSpeech(req: Request, res: Response) {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({
                    success: false,
                    message: 'Text is required'
                });
            }

            const audioUrl = await GeminiTTSService.synthesizeSpeech(text);

            return res.status(200).json({
                success: true,
                audioUrl
            });

        } catch (error: any) {
            console.error('Error converting text to speech:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to convert text to speech',
                error: error.message
            });
        }
    }
}

