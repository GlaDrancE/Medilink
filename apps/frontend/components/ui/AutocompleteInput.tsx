import { useState, useRef } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    onSelect: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

interface DrugHit {
    name: string;
    rxcui: string;
    detail?: string;
}

// ── Source 1: RxNav drugs.json ─────────────────────────────────────────────
// Returns exact/near-exact drug matches with dose-form details.
// Searches SCD (generic+dose), SBD (branded), and IN (ingredient) groups.
const fetchFromDrugsJson = async (query: string): Promise<DrugHit[]> => {
    const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    const groups: any[] = data?.drugGroup?.conceptGroup ?? [];
    const hits: DrugHit[] = [];
    const seen = new Set<string>();

    const addFromGroup = (tty: string, useDetail: boolean) => {
        const group = groups.find((g: any) => g.tty === tty && Array.isArray(g.conceptProperties));
        if (!group) return;
        for (const prop of group.conceptProperties) {
            // For SBD use the brand synonym as the primary name
            const displayName: string = tty === 'SBD' && prop.synonym
                ? prop.synonym
                : prop.name;
            if (!displayName) continue;
            const key = displayName.toLowerCase();
            if (seen.has(key)) continue;
            seen.add(key);
            hits.push({
                name: displayName,
                rxcui: prop.rxcui ?? '',
                detail: useDetail ? prop.name : undefined,
            });
        }
    };

    // Priority: SCD (generic + dose) > SBD (branded) > IN (ingredient)
    addFromGroup('SCD', false);
    addFromGroup('SBD', true);
    addFromGroup('IN', false);

    return hits.slice(0, 12);
};

// ── Source 2: RxNav approximateTerm ────────────────────────────────────────
// Fuzzy-matches partial / misspelled queries — fills in when drugs.json
// returns nothing (e.g. "aspir", "metf", "para").
const fetchFromApproximateTerm = async (query: string): Promise<DrugHit[]> => {
    const url = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=20`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    const candidates: any[] = data?.approximateGroup?.candidate ?? [];
    const hits: DrugHit[] = [];
    const seenRxcui = new Set<string>();

    for (const c of candidates) {
        if (!c.name || !c.rxcui) continue;
        if (seenRxcui.has(c.rxcui)) continue;
        seenRxcui.add(c.rxcui);
        // Normalise casing (API returns ALLCAPS from some sources)
        const displayName: string =
            c.name === c.name.toUpperCase()
                ? c.name.charAt(0).toUpperCase() + c.name.slice(1).toLowerCase()
                : c.name;
        hits.push({ name: displayName, rxcui: c.rxcui });
    }

    return hits.slice(0, 10);
};

// ── Combined fetcher ────────────────────────────────────────────────────────
const fetchMedicines = async (query: string): Promise<DrugHit[]> => {
    if (!query || query.trim().length < 2) return [];
    const q = query.trim();

    const [drugsResult, approxResult] = await Promise.allSettled([
        fetchFromDrugsJson(q),
        fetchFromApproximateTerm(q),
    ]);

    const fromDrugs = drugsResult.status === 'fulfilled' ? drugsResult.value : [];
    const fromApprox = approxResult.status === 'fulfilled' ? approxResult.value : [];

    // Merge: drugs.json results first (richer), then any new names from approx
    const seen = new Set<string>(fromDrugs.map((d) => d.name.toLowerCase()));
    const merged = [...fromDrugs];
    for (const hit of fromApprox) {
        if (!seen.has(hit.name.toLowerCase())) {
            seen.add(hit.name.toLowerCase());
            merged.push(hit);
        }
    }

    return merged.slice(0, 15);
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
                <ul className="absolute z-10 left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow max-h-52 overflow-y-auto mt-1">
                    {suggestions.map((drug, index) => (
                        <li
                            key={`${drug.rxcui}-${index}`}
                            className="px-4 py-2.5 hover:bg-green-50 cursor-pointer text-sm text-black border-b border-gray-100 last:border-0"
                            onMouseDown={() => handleSelect(drug.name)}
                        >
                            <span className="font-medium">{drug.name}</span>
                            {drug.detail && drug.detail !== drug.name && (
                                <span className="block text-xs text-gray-500 mt-0.5 truncate">{drug.detail}</span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
        </div>
    );
};

export default AutocompleteInput; 