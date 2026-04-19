export interface CompactRx {
    date: string;
    doctorName: string;
    medicines: { name: string; dosage: string | null; frequency: string | null }[];
}

export interface CompactDoc {
    name: string;
    summary: string | null;
    keyFindings: string[] | null;
    detectedConditions: string[] | null;
    medications: string[] | null;
    labValues: Record<string, string> | null;
}

export interface NormalisedPatientContext {
    profile: {
        id: string;
        name: string;
        age: number | null;
        gender: string | null;
        blood_group: string | null;
    };
    medications: string[];
    recentPrescriptions: CompactRx[];
    labDocuments: CompactDoc[];
    otherDocuments: CompactDoc[];
    conditions: string[];
    prescriptionCount: number;
    documentCount: number;
}

interface CachedEntry {
    data: NormalisedPatientContext;
    cachedAt: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const store = new Map<string, CachedEntry>();

// Sweep expired entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
        if (now - entry.cachedAt > TTL_MS) {
            store.delete(key);
        }
    }
}, 10 * 60 * 1000);

export const PatientContextCache = {
    get(patientId: string): NormalisedPatientContext | null {
        const entry = store.get(patientId);
        if (!entry) return null;
        if (Date.now() - entry.cachedAt > TTL_MS) {
            store.delete(patientId);
            return null;
        }
        return entry.data;
    },

    set(patientId: string, data: NormalisedPatientContext): void {
        store.set(patientId, { data, cachedAt: Date.now() });
    },

    invalidate(patientId: string): void {
        store.delete(patientId);
    },

    size(): number {
        return store.size;
    },
};
