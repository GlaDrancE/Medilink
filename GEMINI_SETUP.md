# Gemini AI Integration Setup Guide

This guide will help you set up Gemini AI for analyzing medical documents and images in Medilink.

## What is Gemini AI?

Gemini is Google's most advanced AI model that can analyze images, extract text, and provide intelligent insights. In Medilink, it's used to:
- 📋 Analyze medical prescriptions
- 🧪 Extract data from lab reports
- 📄 Understand medical documents
- 💊 Identify medications and dosages
- 🔍 Detect medical conditions

## Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### Alternative: Use Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Generative Language API"
4. Go to "APIs & Services" → "Credentials"
5. Click "Create Credentials" → "API Key"
6. Copy your API key

## Step 2: Add API Key to Environment Variables

### Backend Setup

1. Navigate to `apps/backend/`
2. Create or edit `.env` file:

```env
# Add this line with your actual API key
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

3. Restart your backend server:
```bash
npm run dev
# or
bun run dev
```

## Step 3: Install Dependencies

The required package is already added to `package.json`. Just run:

```bash
cd apps/backend
npm install
# or
bun install
```

## Step 4: Test the Integration

### Option 1: Using the API Directly

```bash
curl -X POST http://localhost:3000/api/v1/ai/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "documentType": "prescription"
  }'
```

### Option 2: Using the Frontend

1. Navigate to the patient dashboard
2. Click the "Add" button in the bottom navigation
3. Select "Upload Document" or "Take Photo"
4. Choose a medical document (prescription, lab report, etc.)
5. The AI analysis will automatically run and display results

## API Response Format

```json
{
  "success": true,
  "analysis": {
    "summary": "This is a prescription for...",
    "keyFindings": [
      "Medication prescribed: Amoxicillin 500mg",
      "Dosage: 3 times daily for 7 days"
    ],
    "recommendations": [
      "Take medication with food",
      "Complete full course"
    ],
    "documentType": "prescription",
    "confidence": 0.95,
    "medications": ["Amoxicillin 500mg"],
    "detectedConditions": ["Bacterial Infection"]
  }
}
```

## Features

### 1. Prescription Analysis
- Extracts medication names and dosages
- Identifies dosing schedules
- Detects special instructions

### 2. Lab Report Analysis
- Extracts all test names and values
- Identifies abnormal values
- Provides health insights

### 3. General Medical Document Analysis
- OCR text extraction
- Medical term identification
- Condition detection

## API Endpoints

### Single Document Analysis
```
POST /api/v1/ai/analyze
Body: {
  imageData: string (base64),
  documentType: string
}
```

### Batch Document Analysis
```
POST /api/v1/ai/analyze/batch
Body: {
  documents: Array<{
    imageData: string,
    documentType: string
  }>
}
```

## Pricing & Limits

- **Free Tier**: 60 requests per minute
- **Cost**: Free for most use cases
- See [Google AI Pricing](https://ai.google.dev/pricing) for details

## Troubleshooting

### Error: "API key not found"
- Make sure `GEMINI_API_KEY` is set in your `.env` file
- Restart your backend server after adding the key

### Error: "API key not valid"
- Verify your API key at [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key if needed

### Error: "Resource has been exhausted"
- You've hit the rate limit (60 requests/minute)
- Wait a minute and try again

### Poor Analysis Quality
- Ensure images are clear and well-lit
- Use high-resolution images
- Make sure text is legible

## Best Practices

1. **Image Quality**: Use clear, high-resolution images
2. **Document Type**: Always specify the correct document type
3. **Error Handling**: Handle AI analysis failures gracefully
4. **User Privacy**: Never store sensitive medical data unnecessarily
5. **Disclaimers**: Always show AI analysis as assistive, not definitive

## Security Considerations

- ⚠️ Never expose your API key in client-side code
- ✅ API key is only used in backend services
- ✅ All requests are authenticated
- ✅ Images are processed on-the-fly, not stored

## Support

For issues or questions:
- Check [Gemini AI Documentation](https://ai.google.dev/docs)
- Open an issue on GitHub
- Contact the development team

---

**Note**: AI analysis is for informational purposes only and should not replace professional medical advice.

