import { useState, useRef } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

// RxNav API endpoint
const RXNAV_API_BASE = 'https://rxnav.nlm.nih.gov/REST/drugs.json';

interface DrugHit {
    name: string;
    synonym?: string;
    rxcui: string;
}

const fetchMedicines = async (query: string): Promise<DrugHit[]> => {
    if (!query || query.trim().length < 2) return [];
    try {
        const encodedQuery = encodeURIComponent(query.trim());
        const url = `${RXNAV_API_BASE}?name=${encodedQuery}`;

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // Parse RxNav response structure
        // Find the conceptGroup with tty: "SBD" and extract conceptProperties
        const drugGroup = data?.drugGroup;
        if (!drugGroup || !drugGroup.conceptGroup) {
            return [];
        }

        const sbdGroup = drugGroup.conceptGroup.find(
            (group: any) => group.tty === 'SBD' && group.conceptProperties
        );

        if (!sbdGroup || !Array.isArray(sbdGroup.conceptProperties)) {
            return [];
        }

        // Extract drug names from conceptProperties
        const hits: DrugHit[] = sbdGroup.conceptProperties.map((prop: any) => ({
            name: prop.name || '',
            synonym: prop.synonym || undefined,
            rxcui: prop.rxcui || ''
        })).filter((hit: DrugHit) => hit.name); // Filter out entries without names

        return hits;
    } catch (error) {
        console.error('Error fetching medicines from RxNav:', error);
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
    const [suggestions, setSuggestions] = useState<DrugHit[]>([]);
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

    const handleSelect = (drugName: string) => {
        onSelect(drugName);
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
                    {suggestions.map((drug, index) => {
                        // Prefer synonym if available (more user-friendly), otherwise use name
                        const displayName = drug.synonym || drug.name;
                        return (
                            <li
                                key={`${drug.rxcui}-${index}`}
                                className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm text-black"
                                onMouseDown={() => handleSelect(displayName)}
                            >
                                {displayName}
                            </li>
                        );
                    })}
                </ul>
            )}
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>
    );
};

export default AutocompleteInput; 