import { Router } from 'express';
import multer from 'multer';
import { VoiceController } from '../controllers/voice.controller';
import { authMiddleware } from "../middleware/patientAuthMiddleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All voice routes require authentication
// router.use(authMiddleware);

/**
 * POST /api/v1/voice/process
 * Process voice input: STT -> Intent Recognition -> Business Logic -> TTS
 */
router.post('/process', upload.single('audio'), VoiceController.processVoiceInput);

/**
 * POST /api/v1/voice/query
 * Process text query (alternative to voice)
 */
router.post('/query', VoiceController.processTextQuery);

/**
 * GET /api/v1/voice/context/:patientId
 * Get patient context for voice assistant
 */
router.get('/context/:patientId', VoiceController.getPatientContext);

/**
 * POST /api/v1/voice/tts
 * Convert text to speech
 */
router.post('/tts', VoiceController.textToSpeech);

export default router;

