# Voice Assistant Documentation

## Overview

The MediLink Voice Assistant is an AI-powered feature that allows patients to interact with their medical records using natural language voice commands. The system uses Google/Gemini AI services for speech recognition, natural language understanding, and text-to-speech synthesis.

## Architecture

```
User Voice Input
    ↓
Frontend (VoiceAssistant Component)
    ↓ (Audio Recording)
Backend Voice API
    ↓
Speech-to-Text (Google Cloud / Gemini)
    ↓
Intent Router (Gemini-powered NLU)
    ↓
Voice Service (Business Logic + DB queries)
    ↓
Gemini (Response Generation)
    ↓
Text-to-Speech (Google Cloud TTS)
    ↓
Audio Response to User
```

## Components

### Frontend

#### 1. **VoiceAssistant.tsx** (`apps/frontend/components/VoiceAssistant.tsx`)

Main component that provides the voice interface:

**Features:**
- Floating action button for easy access
- Expandable chat-like interface
- Real-time speech recognition feedback
- Audio playback of responses
- Mute/unmute controls
- Clear conversation history

**Key Functions:**
- `startListening()` - Initiates microphone recording
- `stopListening()` - Stops recording and processes input
- `processVoiceInput()` - Sends audio to backend
- `playAudioResponse()` - Plays TTS audio response

#### 2. **voiceAssistant.api.ts** (`apps/frontend/services/voiceAssistant.api.ts`)

API service layer for voice assistant:

**Methods:**
- `processVoiceInput(audioBlob, patientId, transcript)` - Main processing endpoint
- `sendTextQuery(query, patientId)` - Alternative text-based query
- `getPatientContext(patientId)` - Fetch patient context
- `textToSpeech(text)` - Direct TTS conversion

### Backend

#### 1. **voice.routes.ts** (`apps/backend/src/routes/voice.routes.ts`)

API routes for voice assistant:

```typescript
POST /api/v1/voice/process      // Process voice input
POST /api/v1/voice/query        // Process text query
GET  /api/v1/voice/context/:id  // Get patient context
POST /api/v1/voice/tts          // Text-to-speech
```

#### 2. **voice.controller.ts** (`apps/backend/src/controllers/voice.controller.ts`)

Controllers that orchestrate the voice processing pipeline:

- `processVoiceInput()` - Main entry point for voice input
- `processTextQuery()` - Text-based alternative
- `getPatientContext()` - Context retrieval
- `textToSpeech()` - TTS conversion

#### 3. **intentRouter.service.ts** (`apps/backend/src/services/intentRouter.service.ts`)

AI-powered intent classification:

**Supported Intents:**
- `GET_PRESCRIPTIONS` - Retrieve prescription information
- `GET_DOCUMENTS` - Access medical documents
- `GET_SUMMARY` - Get medical history summary
- `GET_MEDICATIONS` - List medications
- `GET_LAB_RESULTS` - View lab test results
- `GET_APPOINTMENTS` - View appointments (future)
- `GET_DOCTOR_INFO` - Doctor information
- `EXPLAIN_CONDITION` - Medical condition explanations
- `EXPLAIN_MEDICATION` - Medication information
- `GENERAL_HEALTH_QUERY` - General health questions
- `CHITCHAT` - Casual conversation
- `UNKNOWN` - Fallback for unclear intents

#### 4. **voice.service.ts** (`apps/backend/src/services/voice.service.ts`)

Core business logic for processing intents:

**Key Functions:**
- `processIntent()` - Routes intent to appropriate handler
- `getPatientContext()` - Retrieves complete patient medical data
- `handleGetPrescriptions()` - Processes prescription queries
- `handleGetDocuments()` - Processes document queries
- `handleGetSummary()` - Generates comprehensive summaries
- `handleGetMedications()` - Lists all medications
- `handleGetLabResults()` - Processes lab result queries
- `handleExplanation()` - Provides medical explanations
- `handleChitChat()` - Handles casual conversation
- `handleUnknown()` - Fallback handler

#### 5. **geminiSTT.service.ts** (`apps/backend/src/services/geminiSTT.service.ts`)

Speech-to-Text conversion:

**Features:**
- Google Cloud Speech-to-Text API integration
- Fallback to Gemini (when audio support available)
- Audio format conversion
- Support for multiple audio formats

#### 6. **geminiTTS.service.ts** (`apps/backend/src/services/geminiTTS.service.ts`)

Text-to-Speech synthesis:

**Features:**
- Google Cloud Text-to-Speech API integration
- Cloudinary integration for audio storage
- Multiple voice options
- MP3 audio format output

## Setup & Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Google Cloud (for STT/TTS)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# Cloudinary (for audio storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Google Cloud Setup

1. **Enable APIs:**
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API

2. **Create Service Account:**
   ```bash
   gcloud iam service-accounts create medilink-voice-assistant
   ```

3. **Download Credentials:**
   ```bash
   gcloud iam service-accounts keys create credentials.json \
     --iam-account=medilink-voice-assistant@PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Grant Permissions:**
   ```bash
   gcloud projects add-iam-policy-binding PROJECT_ID \
     --member="serviceAccount:medilink-voice-assistant@PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/speech.client"
   ```

### Dependencies

**Frontend:**
```json
{
  "dependencies": {
    "lucide-react": "^latest"
  }
}
```

**Backend:**
```json
{
  "dependencies": {
    "@google/generative-ai": "^latest",
    "google-auth-library": "^latest",
    "multer": "^latest",
    "uuid": "^latest",
    "axios": "^latest"
  }
}
```

## Usage

### For Users

1. **Open Voice Assistant:**
   - Click the purple chat icon in the bottom-right corner

2. **Start Speaking:**
   - Click the "Speak" button
   - Speak your query clearly
   - Click "Stop" when finished

3. **Listen to Response:**
   - The assistant will process your request
   - A text response will appear in the chat
   - Audio response will play automatically (unless muted)

### Example Queries

```
✓ "What are my recent prescriptions?"
✓ "Show me my medical documents"
✓ "Summarize my medical history"
✓ "What medications am I taking?"
✓ "Do I have any lab results?"
✓ "Explain what diabetes is"
✓ "Tell me about aspirin"
✓ "What were my test results?"
```

## How It Works

### 1. Voice Input

```typescript
// User clicks "Speak" button
startListening() {
  // Start MediaRecorder
  // Start Web Speech Recognition (for real-time display)
  // Record audio as Blob
}
```

### 2. Speech-to-Text

```typescript
// Backend receives audio
const text = await GeminiSTTService.transcribeAudio(audioBuffer);
// Result: "What are my recent prescriptions?"
```

### 3. Intent Detection

```typescript
// Gemini analyzes the query
const intent = await IntentRouterService.detectIntent(text);
// Result: { type: "GET_PRESCRIPTIONS", confidence: 0.95, entities: {} }
```

### 4. Business Logic

```typescript
// Retrieve patient context
const context = await VoiceService.getPatientContext(patientId);
// Context includes: patient data, prescriptions, documents, AI analyses

// Process intent
const response = await VoiceService.processIntent(intent, query, patientId);
// Result: "You have 3 prescriptions. The most recent one is from..."
```

### 5. Response Generation

```typescript
// Gemini generates natural response
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
const result = await model.generateContent(prompt);
// Result: Natural, conversational response text
```

### 6. Text-to-Speech

```typescript
// Convert to audio
const audioUrl = await GeminiTTSService.synthesizeSpeech(responseText);
// Result: URL to MP3 file hosted on Cloudinary
```

### 7. Playback

```typescript
// Frontend plays audio
await playAudioResponse(audioUrl);
```

## Document Summary Integration

The voice assistant has access to all AI-analyzed document summaries:

```typescript
const documentSummaries = patient.documents
    .filter(doc => doc.ai_summary)
    .map(doc => ({
        type: doc.type,
        summary: doc.ai_summary,
        keyFindings: doc.ai_key_findings,
        detectedConditions: doc.ai_detected_conditions,
        medications: doc.ai_medications,
        labValues: doc.ai_lab_values,
    }));
```

This allows the assistant to provide comprehensive answers based on all medical records.

## Best Practices

### For Users

1. **Speak Clearly:** Enunciate words clearly for better recognition
2. **One Question at a Time:** Ask one question per recording
3. **Be Specific:** "Recent prescriptions" vs "all prescriptions"
4. **Use Medical Terms:** The system understands medical terminology

### For Developers

1. **Error Handling:** Always have fallback responses
2. **Context Awareness:** Use patient context for personalized responses
3. **Privacy:** Ensure proper authentication and authorization
4. **Logging:** Log all voice interactions for debugging
5. **Testing:** Test with various accents and speaking styles

## Security & Privacy

- All voice interactions are authenticated
- Audio files are not stored permanently (only transcripts)
- Patient data access is role-based
- Voice queries are logged for audit purposes
- TTS audio files can be set to expire after playback

## Limitations

1. **Language:** Currently supports English only
2. **Audio Quality:** Requires clear audio for accurate transcription
3. **Complex Queries:** Works best with simple, direct questions
4. **Context:** Limited to current patient's data
5. **Medical Advice:** Cannot provide medical diagnoses or treatment recommendations

## Troubleshooting

### "Unable to access microphone"
- Check browser permissions
- Ensure HTTPS connection
- Try different browser

### "Failed to process voice input"
- Check backend logs
- Verify API keys are configured
- Ensure Google Cloud APIs are enabled

### "No audio response"
- Check if muted
- Verify TTS service is configured
- Check Cloudinary settings

### Poor transcription quality
- Speak more clearly
- Reduce background noise
- Check microphone quality
- Try text input as alternative

## Future Enhancements

- [ ] Multi-language support
- [ ] Offline mode with cached responses
- [ ] Voice biometric authentication
- [ ] Appointment scheduling via voice
- [ ] Medicine reminder setup
- [ ] Emergency contact features
- [ ] Voice-to-doctor messaging
- [ ] Symptom checker integration

## API Reference

See individual service files for detailed API documentation:
- [Voice Routes](../src/routes/voice.routes.ts)
- [Voice Controller](../src/controllers/voice.controller.ts)
- [Intent Router](../src/services/intentRouter.service.ts)
- [Voice Service](../src/services/voice.service.ts)
- [STT Service](../src/services/geminiSTT.service.ts)
- [TTS Service](../src/services/geminiTTS.service.ts)

