import { useState, useRef } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

// Algolia API details
const ALGOLIA_URL = 'https://0z9q3se3dl-3.algolianet.com/1/indexes/prod_meds_query_suggestions_new/query';
const ALGOLIA_APP_ID = '0Z9Q3SE3DL';
const ALGOLIA_API_KEY = 'daff858f97cc3361e1a3f722e3729753';

interface AlgoliaHit {
    display_name: string[];
    brand_name?: string;
}

const fetchMedicines = async (query: string): Promise<AlgoliaHit[]> => {
    if (!query) return [];
    try {
        const res = await fetch(ALGOLIA_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-algolia-application-id': ALGOLIA_APP_ID,
                'x-algolia-api-key': ALGOLIA_API_KEY,
            },
            body: JSON.stringify({
                params: `query=${encodeURIComponent(query)}&hitsPerPage=8&clickAnalytics=true`
            })
        });
        console.log(res)
        const data = await res.json();
        const hits = (data.hits || []).map((hit: any) => ({
            display_name: hit.display_name,
            brand_name: hit.brand_name
        }));
        console.log(hits)
        return hits;
    } catch {
        return [];
    }
};

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    value,
    onChange,
    onSelect,
    placeholder,
    disabled,
    className = ''
}) => {
    const [suggestions, setSuggestions] = useState<AlgoliaHit[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [error, setError] = useState('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        onChange(val);
        setError('');
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (!val) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        setLoading(true);
        timeoutRef.current = setTimeout(async () => {
            try {
                const meds = await fetchMedicines(val);
                setSuggestions(meds);
                setShowDropdown(true);
                setError(meds.length === 0 ? 'No medicines found' : '');
            } catch {
                setError('Error fetching medicines');
            } finally {
                setLoading(false);
            }
        }, 400);
    };

    const handleSelect = (display_name: string) => {
        onSelect(display_name);
        setShowDropdown(false);
        setSuggestions([]);
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="text"
                value={value}
                onChange={handleInput}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-green-500 bg-white text-black"
                autoComplete="off"
                onFocus={() => value && suggestions.length > 0 && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 animate-spin text-green-600" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                </div>
            )}
            {showDropdown && suggestions.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow max-h-48 overflow-y-auto mt-1">
                    {suggestions.map((s) => (
                        s.display_name.map((name: string, i: number) => (
                            <li
                                key={i}
                                className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm text-black"
                                onMouseDown={() => handleSelect(name)}
                            >
                                {name}
                            </li>
                        ))
                    ))}
                </ul>
            )}
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>
    );
};

export default AutocompleteInput; 