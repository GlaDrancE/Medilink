# Multi-Language Support

This application now supports multiple Indian languages along with English using Google Translate integration.

## Supported Languages

1. **English** - English
2. **Hindi** - हिंदी
3. **Telugu** - తెలుగు
4. **Tamil** - தமிழ்
5. **Kannada** - ಕನ್ನಡ
6. **Marathi** - मराठी

## Features

- **Custom Language Selector**: Beautiful, modern dropdown UI positioned at the top-right corner
- **Google Translate Integration**: Uses Google's powerful translation engine
- **Real-time Translation**: Content is translated instantly when language is changed
- **Native Language Names**: Each language is displayed in its native script
- **Persistent Selection**: Selected language is maintained across the session

## How It Works

The language selector uses Google Translate's free widget API. When a user selects a language:

1. The custom dropdown captures the selection
2. The underlying Google Translate widget is triggered programmatically
3. All page content is translated to the selected language
4. The Google Translate UI is hidden for a seamless user experience

## Usage

The language selector appears in the top-right corner of the patient dashboard. Simply:

1. Click on the language selector button
2. Choose your preferred language from the dropdown
3. The entire page content will be translated automatically

## Technical Details

### Components

- **LanguageSelector.tsx**: Custom dropdown component with Google Translate integration
- **LanguageContext.tsx**: Optional context provider for managing language state globally

### Implementation

The language selector:
- Loads the Google Translate script dynamically
- Hides the default Google Translate UI using CSS
- Provides a custom, branded interface
- Triggers translations programmatically through the Google Translate API

### Styling

The component uses Tailwind CSS and supports:
- Light and dark modes
- Smooth transitions and animations
- Responsive design
- Accessible UI patterns

## Notes

- The translation is powered by Google Translate's free widget
- Translations are performed client-side in real-time
- No API keys or additional configuration required
- The Google Translate attribution banner is hidden but the service remains free

