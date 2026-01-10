"use client"
import { useEffect, useState } from 'react';
import { ChevronDown, Languages } from 'lucide-react';

// Load debug utilities in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    import('@/utils/googleTranslateDebug').catch(() => {
        // Ignore if file doesn't exist
    });
}

interface Language {
    code: string;
    name: string;
    nativeName: string;
}

const languages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
];

declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: () => void;
    }
}

export default function LanguageSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(languages[0]);
    const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    // Helper functions for cookie management
    const setCookie = (name: string, value: string, days: number, domain?: string) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
        let cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
        if (domain) {
            cookie += `;domain=${domain}`;
        }
        document.cookie = cookie;
    };

    const getCookie = (name: string) => {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };

    useEffect(() => {
        // Check if there's a saved language preference
        const savedLang = getCookie('googtrans');
        if (savedLang) {
            const langCode = savedLang.split('/')[2];
            const lang = languages.find(l => l.code === langCode);
            if (lang) {
                setSelectedLanguage(lang);
            }
        }
    }, []);

    useEffect(() => {
        // Load Google Translate script
        const addScript = () => {
            const script = document.createElement('script');
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        };

        // Initialize Google Translate Element
        window.googleTranslateElementInit = () => {
            if (window.google && window.google.translate) {
                try {
                    new window.google.translate.TranslateElement(
                        {
                            pageLanguage: 'en',
                            includedLanguages: 'en,hi,te,ta,kn,mr',
                            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                            autoDisplay: false,
                            multilanguagePage: true,
                        },
                        'google_translate_element'
                    );
                    setIsGoogleLoaded(true);
                    console.log('Google Translate initialized successfully');
                } catch (error) {
                    console.error('Error initializing Google Translate:', error);
                }
            }
        };

        // Check if script already exists
        if (!document.querySelector('script[src*="translate.google.com"]')) {
            addScript();
        } else if (window.google && window.google.translate) {
            setIsGoogleLoaded(true);
        }

        // Hide default Google Translate widget
        const style = document.createElement('style');
        style.innerHTML = `
            #google_translate_element {
                display: none !important;
            }
            .goog-te-banner-frame {
                display: none !important;
            }
            .goog-te-banner {
                display: none !important;
            }
            body {
                top: 0 !important;
            }
            .skiptranslate {
                display: none !important;
            }
            .goog-logo-link {
                display: none !important;
            }
            .goog-te-gadget {
                color: transparent !important;
            }
            .goog-te-gadget span {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            // Cleanup if needed
        };
    }, []);

    const changeLanguage = (language: Language) => {
        setSelectedLanguage(language);
        setIsOpen(false);
        setIsTranslating(true);

        // Clear existing Google Translate cookies
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + window.location.hostname;

        if (language.code === 'en') {
            // If switching back to English, just clear cookies and reload
            window.location.reload();
            return;
        }

        // Set the new language cookie
        const cookieValue = `/en/${language.code}`;
        setCookie('googtrans', cookieValue, 1);
        setCookie('googtrans', cookieValue, 1, window.location.hostname);

        // Also try to trigger the Google Translate widget directly
        const triggerGoogleTranslate = () => {
            const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;

            if (selectElement) {
                selectElement.value = language.code;
                selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                selectElement.dispatchEvent(new Event('input', { bubbles: true }));

                // Click the select to trigger translation
                const clickEvent = new MouseEvent('click', { bubbles: true });
                selectElement.dispatchEvent(clickEvent);

                return true;
            }

            return false;
        };

        // Try to trigger without reload first
        let triggered = false;
        const retryIntervals = [100, 300, 500];

        retryIntervals.forEach((delay, index) => {
            setTimeout(() => {
                if (!triggered && triggerGoogleTranslate()) {
                    triggered = true;
                    console.log(`Google Translate triggered after ${delay}ms`);
                    setIsTranslating(false);
                }
            }, delay);
        });

        // If translation doesn't happen within 1.5 seconds, reload the page
        setTimeout(() => {
            if (!triggered || !document.documentElement.classList.contains('translated-ltr')) {
                console.log('Reloading page to apply translation...');
                window.location.reload();
            }
        }, 1500);
    };

    return (
        <div className="relative">
            {/* Hidden Google Translate Element */}
            <div id="google_translate_element" className="hidden"></div>

            {/* Custom Language Selector */}
            <div className="relative z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={isTranslating}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isTranslating ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    ) : (
                        <Languages className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {selectedLanguage.nativeName}
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        ></div>

                        {/* Dropdown */}
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                            <div className="py-1">
                                {languages.map((language) => (
                                    <button
                                        key={language.code}
                                        onClick={() => changeLanguage(language)}
                                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col gap-0.5 ${selectedLanguage.code === language.code
                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                            : ''
                                            }`}
                                    >
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {language.nativeName}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {language.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

