# Voice Assistant - Quick Setup Guide

## Prerequisites

1. **Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Create an API key
   - Add to `.env`: `GEMINI_API_KEY=your_key_here`

2. **Google Cloud Account** (for production-grade STT/TTS)
   - Create project: https://console.cloud.google.com
   - Enable Speech-to-Text API
   - Enable Text-to-Speech API
   - Create service account and download credentials

3. **Cloudinary Account** (for audio storage)
   - Sign up: https://cloudinary.com
   - Get credentials from dashboard
   - Add to `.env`

## Installation Steps

### 1. Install Dependencies

```bash
# Backend
cd apps/backend
npm install @google/generative-ai google-auth-library multer uuid axios

# Frontend (if not already installed)
cd apps/frontend
npm install lucide-react
```

### 2. Configure Environment Variables

Create/update `apps/backend/.env`:

```env
# Required: Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Optional but recommended: Google Cloud
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json

# Optional: Cloudinary for audio storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=ml_default
```

### 3. Google Cloud Setup (Optional - for production)

```bash
# Install Google Cloud CLI
# Visit: https://cloud.google.com/sdk/docs/install

# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Enable APIs
gcloud services enable speech.googleapis.com
gcloud services enable texttospeech.googleapis.com

# Create service account
gcloud iam service-accounts create medilink-voice \
    --display-name="MediLink Voice Assistant"

# Create and download key
gcloud iam service-accounts keys create credentials.json \
    --iam-account=medilink-voice@YOUR_PROJECT_ID.iam.gserviceaccount.com

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:medilink-voice@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/speech.client"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:medilink-voice@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/texttospeech.client"

# Move credentials to backend folder
mv credentials.json apps/backend/
```

### 4. Test the Setup

**Start Backend:**
```bash
cd apps/backend
npm run dev
```

**Start Frontend:**
```bash
cd apps/frontend
npm run dev
```

**Test Voice Assistant:**
1. Navigate to patient dashboard
2. Click the purple chat icon (bottom-right)
3. Click "Speak"
4. Say: "What are my prescriptions?"
5. Listen to the response

## Development Mode (Without Google Cloud)

For development, you can use:

1. **Browser's Web Speech API** (free, built-in)
   - The frontend component already uses this for real-time transcription
   - Limited accuracy but good for testing

2. **Text-based queries** (no audio needed)
   - Use the text query endpoint instead
   - Good for testing business logic

3. **Client-side TTS** (fallback)
   - Browser's Speech Synthesis API
   - No audio file needed

## Minimal Setup (Development Only)

If you only want to test with minimal setup:

```env
# .env - Only this is required
GEMINI_API_KEY=your_gemini_api_key
```

The system will:
- Use browser's Web Speech API for STT (transcription)
- Use Gemini for intent detection and response generation
- Skip TTS audio generation (or use browser's TTS)

## Testing Voice Commands

Try these example queries:

### Prescriptions
- "What are my recent prescriptions?"
- "Do I have any prescriptions from Dr. Smith?"
- "What medications am I currently taking?"

### Documents
- "Show me my medical documents"
- "Do I have any lab reports?"
- "What documents do I have?"

### Summary
- "Summarize my medical history"
- "Give me an overview of my health records"
- "What do my records say?"

### Medications
- "What medicines am I taking?"
- "Tell me about my medications"
- "What is aspirin used for?"

### Lab Results
- "Show me my lab results"
- "What were my test results?"
- "Do I have any abnormal lab values?"

### Explanations
- "What is diabetes?"
- "Explain high blood pressure"
- "Tell me about cholesterol"

## Troubleshooting

### Microphone not working
```javascript
// Check browser permissions
navigator.permissions.query({ name: 'microphone' })
```

### API errors
```bash
# Check backend logs
cd apps/backend
npm run dev
# Watch for errors in console
```

### No audio response
- Check if muted in voice assistant UI
- Verify CLOUDINARY settings if using
- Check browser console for audio playback errors

### Poor transcription
- Speak clearly and slowly
- Reduce background noise
- Use text input as alternative

## Production Checklist

Before deploying to production:

- [ ] Configure Google Cloud STT/TTS
- [ ] Set up Cloudinary for audio storage
- [ ] Enable HTTPS for microphone access
- [ ] Add rate limiting to voice endpoints
- [ ] Set up monitoring and logging
- [ ] Test with various accents and languages
- [ ] Add audio file cleanup job
- [ ] Configure CDN for audio delivery
- [ ] Add analytics for voice usage
- [ ] Test on mobile devices

## Cost Considerations

**Google Cloud Pricing:**
- Speech-to-Text: ~$0.006 per 15 seconds
- Text-to-Speech: ~$4 per 1M characters
- Free tier: 60 minutes STT/month, 1M chars TTS/month

**Gemini API:**
- Gemini Pro: Free tier available
- Check current pricing: https://ai.google.dev/pricing

**Cloudinary:**
- Free tier: 25GB storage, 25GB bandwidth/month
- Audio files: ~50KB-500KB per response

**Estimated Monthly Cost (1000 users):**
- STT: ~$10-50
- TTS: ~$10-30
- Cloudinary: Free tier sufficient
- Gemini: Free tier sufficient for testing
- **Total: ~$20-80/month**

## Support

For issues or questions:
1. Check the [full documentation](./VOICE_ASSISTANT.md)
2. Review backend logs
3. Test with `curl` or Postman
4. Enable debug logging

## Next Steps

- Read the [full documentation](./VOICE_ASSISTANT.md)
- Customize voice responses in `voice.service.ts`
- Add more intents in `intentRouter.service.ts`
- Customize UI in `VoiceAssistant.tsx`
- Add analytics tracking
- Implement caching for common queries

