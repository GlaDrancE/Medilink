# Language Selector - Developer Guide

## Quick Start

The language selector has been added to the patient layout and is ready to use!

### Location
The language selector appears as a button in the top-right corner of the patient dashboard.

### How It Works

1. Click the language selector button
2. Choose from 6 languages: English, Hindi, Telugu, Tamil, Kannada, Marathi
3. The page will automatically translate to the selected language
4. If instant translation fails, the page will reload (takes ~1.5 seconds)

## Implementation Details

### Component: `LanguageSelector.tsx`

```typescript
// Already added to: apps/frontend/app/dashboard/patient/layout.tsx
import LanguageSelector from "@/components/LanguageSelector";

// In JSX:
<div className="fixed top-4 right-4 z-50">
    <LanguageSelector />
</div>
```

### Features

- ✅ Custom dropdown UI (no native select)
- ✅ Native language names (e.g., "हिंदी" for Hindi)
- ✅ Loading spinner during translation
- ✅ Cookie-based persistence
- ✅ Automatic fallback to page reload
- ✅ Dark mode support
- ✅ Keyboard accessible

### Translation Flow

```
User clicks language
    ↓
Set cookie (googtrans=/en/[code])
    ↓
Try to trigger Google Translate widget (0-500ms retries)
    ↓
If successful: Translation applied ✓
    ↓
If failed: Page reloads after 1.5s ↻
    ↓
Translation applied via cookie ✓
```

## Debugging

### Browser Console

In development mode, debug utilities are automatically loaded:

```javascript
// Run full diagnostics
GoogleTranslateDebug.diagnose()

// Check current status
GoogleTranslateDebug.checkStatus()

// Manually translate to Hindi
GoogleTranslateDebug.translate('hi')

// Reset to English
GoogleTranslateDebug.resetToEnglish()

// List all GT elements
GoogleTranslateDebug.listElements()

// Check for errors
GoogleTranslateDebug.checkErrors()
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Language not changing | Google Translate not loaded | Check Network tab, disable ad blockers |
| Page keeps reloading | Translation failing | Check console for errors, test in incognito |
| Layout broken | Elements being translated incorrectly | Add `notranslate` class to those elements |
| Slow translation | Large page content | Normal behavior, page reload is fallback |

### Console Logs

The component logs helpful information:

```
✓ Google Translate initialized successfully
✓ Google Translate triggered after 300ms
ℹ Reloading page to apply translation...
```

## Customization

### Add More Languages

Edit `apps/frontend/components/LanguageSelector.tsx`:

```typescript
const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    // Add more languages:
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
];
```

Don't forget to update the `includedLanguages` in the initialization:

```typescript
includedLanguages: 'en,hi,te,ta,kn,mr,bn,gu',
```

### Prevent Translation of Elements

Add the `notranslate` class:

```tsx
<div className="notranslate">
    This will not be translated
</div>
```

Or use the HTML attribute:

```tsx
<span translate="no">Keep original text</span>
```

### Change Position

Edit `apps/frontend/app/dashboard/patient/layout.tsx`:

```tsx
{/* Currently: top-right */}
<div className="fixed top-4 right-4 z-50">
    <LanguageSelector />
</div>

{/* Example: bottom-right */}
<div className="fixed bottom-4 right-4 z-50">
    <LanguageSelector />
</div>
```

### Styling

The component uses Tailwind CSS. Modify classes in `LanguageSelector.tsx`:

```typescript
// Button styling
className="flex items-center gap-2 px-4 py-2 bg-white ..."

// Dropdown styling  
className="absolute right-0 mt-2 w-56 bg-white ..."
```

## Best Practices

### 1. Don't Translate Everything

```tsx
{/* Logo and brand names */}
<div className="notranslate">
    <img src="/logo.png" alt="MediLink" />
    <h1>MediLink</h1>
</div>

{/* Technical terms, codes, IDs */}
<span className="notranslate">
    Patient ID: #{patient.id}
</span>

{/* Dates and numbers (optional) */}
<time className="notranslate">
    2026-01-10
</time>
```

### 2. Test All Languages

```bash
# Manual testing checklist
- [ ] English (baseline)
- [ ] Hindi
- [ ] Telugu  
- [ ] Tamil
- [ ] Kannada
- [ ] Marathi

# Check for:
- Layout breaking
- Text overflow
- Button sizes
- Modal dialogs
- Form labels
```

### 3. Performance

```typescript
// The component is already optimized:
- Lazy loads Google Translate script
- Uses cookie-based persistence
- Minimal re-renders
- Fallback to reload prevents hanging
```

### 4. Accessibility

```typescript
// Already implemented:
- Keyboard navigation (Tab, Enter)
- ARIA labels (via semantic HTML)
- Focus management
- Screen reader friendly
```

## Testing

### Manual Testing

1. Open patient dashboard
2. Click language selector (top-right)
3. Select different languages
4. Verify translation occurs
5. Reload page - language should persist
6. Navigate to different pages - translation should remain

### Automated Testing (TODO)

```typescript
// Example test structure
describe('LanguageSelector', () => {
  it('should render language button', () => {});
  it('should open dropdown on click', () => {});
  it('should change language', () => {});
  it('should persist selection', () => {});
  it('should handle translation failure', () => {});
});
```

## Resources

- [Documentation](./LANGUAGE_SUPPORT.md) - User-facing documentation
- [Troubleshooting](./LANGUAGE_TROUBLESHOOTING.md) - Common issues and solutions
- [Google Translate Widget Docs](https://translate.google.com/intl/en/about/website/)

## Support

For issues or questions:
1. Check console logs
2. Run `GoogleTranslateDebug.diagnose()` in browser console
3. Review troubleshooting guide
4. Test in different browser/incognito mode

