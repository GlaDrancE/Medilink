/**
 * Google Translate Debug Utilities
 * 
 * Use these functions in the browser console to debug translation issues
 */

export const GoogleTranslateDebug = {
    /**
     * Check if Google Translate is loaded and initialized
     */
    checkStatus: () => {
        const widget = document.querySelector('#google_translate_element');
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        const isTranslated = document.documentElement.classList.contains('translated-ltr');
        const cookie = document.cookie.split(';').find(c => c.trim().startsWith('googtrans='));

        console.log('=== Google Translate Status ===');
        console.log('Widget element:', widget ? '✓ Found' : '✗ Not found');
        console.log('Select element:', select ? '✓ Found' : '✗ Not found');
        console.log('Page translated:', isTranslated ? '✓ Yes' : '✗ No');
        console.log('Cookie:', cookie || '✗ Not set');
        console.log('Current language:', select?.value || 'Unknown');
        console.log('Available languages:', select ? Array.from(select.options).map(o => o.value) : []);

        return {
            widgetExists: !!widget,
            selectExists: !!select,
            isTranslated,
            cookie: cookie || null,
            currentLanguage: select?.value || null,
            availableLanguages: select ? Array.from(select.options).map(o => o.value) : []
        };
    },

    /**
     * Manually trigger translation to a specific language
     */
    translate: (languageCode: string) => {
        console.log(`Attempting to translate to: ${languageCode}`);

        // Method 1: Direct select manipulation
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select) {
            select.value = languageCode;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✓ Triggered via select element');
        } else {
            console.log('✗ Select element not found');
        }

        // Method 2: Cookie-based
        document.cookie = `googtrans=/en/${languageCode}; path=/; max-age=86400`;
        console.log('✓ Set cookie');

        // Method 3: Reload
        setTimeout(() => {
            if (!document.documentElement.classList.contains('translated-ltr')) {
                console.log('Translation not applied, reloading...');
                window.location.reload();
            }
        }, 2000);
    },

    /**
     * Reset to English (original language)
     */
    resetToEnglish: () => {
        console.log('Resetting to English...');
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.reload();
    },

    /**
     * Check for errors in console
     */
    checkErrors: () => {
        const errors = [];

        // Check if script loaded
        const script = document.querySelector('script[src*="translate.google.com"]');
        if (!script) {
            errors.push('Google Translate script not loaded');
        }

        // Check if widget element exists
        const widget = document.querySelector('#google_translate_element');
        if (!widget) {
            errors.push('Widget container element not found');
        }

        // Check if select element exists
        const select = document.querySelector('.goog-te-combo');
        if (!select) {
            errors.push('Select element not found (Google Translate may not be initialized)');
        }

        console.log('=== Error Check ===');
        if (errors.length === 0) {
            console.log('✓ No errors found');
        } else {
            console.log('✗ Errors found:');
            errors.forEach(error => console.log(`  - ${error}`));
        }

        return errors;
    },

    /**
     * List all Google Translate related elements in the DOM
     */
    listElements: () => {
        console.log('=== Google Translate Elements ===');

        const elements = {
            widget: document.querySelector('#google_translate_element'),
            select: document.querySelector('.goog-te-combo'),
            banner: document.querySelector('.goog-te-banner-frame'),
            menuFrame: document.querySelector('.goog-te-menu-frame'),
            balloonFrame: document.querySelector('.goog-te-balloon-frame'),
            scripts: document.querySelectorAll('script[src*="translate.google.com"]'),
            iframes: document.querySelectorAll('iframe[src*="translate.google.com"]'),
        };

        Object.entries(elements).forEach(([name, element]) => {
            if (element) {
                if (element instanceof NodeList) {
                    console.log(`${name}: ${element.length} found`);
                } else {
                    console.log(`${name}:`, element);
                }
            } else {
                console.log(`${name}: Not found`);
            }
        });

        return elements;
    },

    /**
     * Get current cookies related to Google Translate
     */
    getCookies: () => {
        const cookies = document.cookie.split(';')
            .map(c => c.trim())
            .filter(c => c.includes('goog'));

        console.log('=== Google Translate Cookies ===');
        if (cookies.length === 0) {
            console.log('No Google Translate cookies found');
        } else {
            cookies.forEach(cookie => console.log(cookie));
        }

        return cookies;
    },

    /**
     * Run all diagnostic checks
     */
    diagnose: () => {
        console.log('\n🔍 Running full Google Translate diagnostics...\n');

        const status = GoogleTranslateDebug.checkStatus();
        console.log('\n');

        const errors = GoogleTranslateDebug.checkErrors();
        console.log('\n');

        GoogleTranslateDebug.getCookies();
        console.log('\n');

        console.log('=== Recommendations ===');
        if (!status.widgetExists) {
            console.log('⚠️  Widget not found - Check if component is mounted');
        }
        if (!status.selectExists) {
            console.log('⚠️  Select not found - Wait for Google Translate to initialize or check for script loading errors');
        }
        if (status.cookie && !status.isTranslated) {
            console.log('⚠️  Cookie set but page not translated - Try reloading the page');
        }

        return {
            status,
            errors,
            recommendation: errors.length === 0 ? 'Everything looks good!' : 'Issues detected, see above'
        };
    }
};

// Make it available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as any).GoogleTranslateDebug = GoogleTranslateDebug;
    console.log('💡 Google Translate Debug utilities loaded! Use GoogleTranslateDebug.diagnose() to run diagnostics');
}

export default GoogleTranslateDebug;

