# Language Selector Troubleshooting Guide

## How the Language Selector Works

The language selector uses Google Translate's free widget to translate the entire page. Here's the flow:

1. **Google Translate Script Loads**: On component mount, the Google Translate script is loaded
2. **Hidden Widget Created**: A hidden Google Translate widget is initialized
3. **User Selects Language**: User clicks dropdown and selects a language
4. **Translation Triggered**: Multiple methods attempt to trigger translation:
   - Direct widget manipulation via `.goog-te-combo` select element
   - Cookie-based approach (`googtrans` cookie)
   - Page reload as fallback (after 1.5 seconds)

## Common Issues and Solutions

### Issue 1: Language Not Changing

**Symptoms**: Clicking a language doesn't translate the page

**Solutions**:
1. **Check Browser Console**: Open DevTools (F12) and look for errors
2. **Check Network Tab**: Ensure Google Translate script is loading (look for `translate.google.com` requests)
3. **Check Cookies**: In DevTools > Application > Cookies, look for `googtrans` cookie
4. **Wait for Reload**: The page should reload after 1.5 seconds if translation doesn't trigger immediately

### Issue 2: Google Translate Script Blocked

**Symptoms**: Console shows script loading errors

**Solutions**:
1. **Disable Ad Blockers**: Some ad blockers block Google Translate
2. **Check Content Security Policy**: Ensure CSP allows `translate.google.com`
3. **Check Network Restrictions**: Corporate networks may block Google services

### Issue 3: Translation Looks Broken

**Symptoms**: Page layout is messed up after translation

**Solutions**:
1. **Add `notranslate` class**: Add to elements that shouldn't be translated:
   ```html
   <div className="notranslate">Don't translate this</div>
   ```
2. **Use `translate="no"` attribute**: HTML attribute to prevent translation:
   ```html
   <span translate="no">Keep original</span>
   ```

### Issue 4: Selected Language Not Persisting

**Symptoms**: Language resets after page navigation

**Solutions**:
1. **Check Cookie Persistence**: Cookies should be set with 1-day expiration
2. **Domain Issues**: Ensure cookies are set for the correct domain
3. **Use Context Provider**: Wrap app with `LanguageProvider` for global state

## Debugging Steps

### Step 1: Check Google Translate Widget
```javascript
// In browser console
console.log(document.querySelector('#google_translate_element'));
console.log(document.querySelector('.goog-te-combo'));
```

### Step 2: Check Cookies
```javascript
// In browser console
console.log(document.cookie);
// Look for: googtrans=/en/hi (or other language code)
```

### Step 3: Manually Trigger Translation
```javascript
// In browser console
const select = document.querySelector('.goog-te-combo');
if (select) {
    select.value = 'hi'; // Change to Hindi
    select.dispatchEvent(new Event('change', { bubbles: true }));
}
```

### Step 4: Check Translation State
```javascript
// In browser console
console.log(document.documentElement.classList.contains('translated-ltr'));
console.log(document.documentElement.lang);
```

## Advanced Configuration

### Preventing Translation of Specific Elements

Use the `notranslate` class:
```tsx
<div className="notranslate">
    <img src="/logo.png" alt="Logo" />
    <span>Brand Name</span>
</div>
```

### Forcing Translation of Dynamic Content

After adding new content dynamically:
```javascript
// Trigger re-translation
window.dispatchEvent(new Event('load'));
```

## Performance Considerations

- **Initial Load**: Google Translate adds ~200KB to page load
- **Translation Time**: 1-3 seconds for average page
- **Page Reload**: Fallback reload adds 2-5 seconds
- **Caching**: Translations are cached by Google Translate

## Known Limitations

1. **SEO Impact**: Translated content is client-side only
2. **Translation Quality**: Varies by language pair
3. **Dynamic Content**: May need manual re-translation triggers
4. **Input Fields**: Some inputs may not translate placeholders
5. **iframes**: Content in iframes won't be translated

## Testing Checklist

- [ ] Language selector appears in top-right corner
- [ ] Dropdown opens and shows all 6 languages
- [ ] Clicking a language triggers translation
- [ ] Loading spinner appears during translation
- [ ] Page reloads if translation doesn't trigger
- [ ] Selected language persists after reload
- [ ] Switching back to English works
- [ ] Translation works on all pages
- [ ] No console errors
- [ ] Cookies are set correctly

## Getting Help

If issues persist:
1. Check browser console for specific errors
2. Test in different browser (Chrome, Firefox, Safari)
3. Disable browser extensions temporarily
4. Try incognito/private browsing mode
5. Check if Google Translate service is accessible in your region

