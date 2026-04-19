import { NormalisedPatientContext } from './patientContextCache.service';

// ── safe serialisation helpers ────────────────────────────────────────────────

/** Never lets an object slip through as "[object Object]" */
function safeStr(v: unknown): string {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return JSON.stringify(v);
}

/** Safely casts an unknown value to string[], handles Prisma Json arrays */
function safeArr(v: unknown): string[] {
    if (!Array.isArray(v)) return [];
    return v.map(item => safeStr(item));
}

// ─────────────────────────────────────────────────────────────────────────────

type SliceKey =
    | 'profile'
    | 'medications'
    | 'recentPrescriptions'
    | 'labDocuments'
    | 'otherDocuments'
    | 'conditions'
    | 'dosage'
    | 'timings'
    | 'labValues'
    | 'findings'
    | 'doctors';

interface SliceRule {
    keywords: string[];
    slices: SliceKey[];
}

const SLICE_RULES: SliceRule[] = [
    {
        keywords: ['medicine', 'drug', 'medication', 'tablet', 'capsule', 'pill', 'taking', 'prescribed medicine'],
        slices: ['profile', 'medications', 'recentPrescriptions'],
    },
    {
        keywords: ['dose', 'dosage', 'strength', 'mg', 'ml', 'how much', 'quantity', 'amount'],
        slices: ['profile', 'dosage', 'recentPrescriptions'],
    },
    {
        keywords: ['timing', 'schedule', 'frequency', 'when', 'morning', 'evening', 'night', 'twice', 'thrice', 'daily', 'weekly', 'after food', 'before food', 'how often'],
        slices: ['profile', 'timings', 'recentPrescriptions'],
    },
    {
        keywords: ['lab', 'test', 'result', 'report', 'value', 'level', 'count', 'hb', 'sugar', 'cholesterol', 'haemoglobin', 'hemoglobin', 'glucose', 'creatinine', 'urea'],
        slices: ['profile', 'labDocuments', 'labValues', 'conditions'],
    },
    {
        keywords: ['finding', 'observation', 'impression', 'noted', 'detected', 'abnormal', 'normal'],
        slices: ['profile', 'findings', 'labDocuments', 'otherDocuments'],
    },
    {
        keywords: ['condition', 'diagnosis', 'disease', 'disorder', 'illness', 'suffer', 'problem', 'ailment', 'chronic', 'acute', 'infection', 'syndrome', 'deficiency'],
        slices: ['profile', 'conditions', 'findings', 'otherDocuments'],
    },
    {
        keywords: ['doctor', 'physician', 'specialist', 'prescribed by', 'prescription', 'checkup', 'visit', 'consultant', 'dr.'],
        slices: ['profile', 'doctors', 'recentPrescriptions'],
    },
    {
        keywords: ['blood', 'blood group', 'blood type', 'rh'],
        slices: ['profile', 'labDocuments', 'labValues'],
    },
    {
        keywords: ['history', 'summary', 'overview', 'everything', 'all', 'background', 'overall', 'general'],
        slices: ['profile', 'medications', 'conditions', 'recentPrescriptions', 'labDocuments', 'otherDocuments', 'dosage', 'timings', 'labValues', 'findings', 'doctors'],
    },
];

const DEFAULT_SLICES: SliceKey[] = ['profile', 'medications', 'conditions'];

function detectSlices(query: string): SliceKey[] {
    const lower = query.toLowerCase();
    const matched = new Set<SliceKey>();

    for (const rule of SLICE_RULES) {
        if (rule.keywords.some(kw => lower.includes(kw))) {
            rule.slices.forEach(s => matched.add(s));
        }
    }

    if (matched.size === 0) {
        DEFAULT_SLICES.forEach(s => matched.add(s));
    }

    // profile is always present
    matched.add('profile');

    return Array.from(matched);
}

function formatRx(rx: NormalisedPatientContext['recentPrescriptions'][number]): string {
    const meds = rx.medicines
        .map(m => [m.name, safeStr(m.dosage), safeStr(m.frequency)].filter(Boolean).join(' '))
        .join(', ');
    return `[${rx.date} · Dr. ${rx.doctorName}] ${meds || 'No medicines listed'}`;
}

function formatDoc(doc: NormalisedPatientContext['labDocuments'][number]): string {
    const parts: string[] = [];
    if (doc.summary) parts.push(`Summary: ${safeStr(doc.summary)}`);
    const kf = safeArr(doc.keyFindings);
    const dc = safeArr(doc.detectedConditions);
    if (kf.length) parts.push(`Findings: ${kf.join('; ')}`);
    if (dc.length) parts.push(`Conditions: ${dc.join(', ')}`);
    if (doc.labValues && Object.keys(doc.labValues).length) {
        const vals = Object.entries(doc.labValues).map(([k, v]) => `${k}: ${safeStr(v)}`).join(', ');
        parts.push(`Lab values: ${vals}`);
    }
    return `[${safeStr(doc.name)}] ${parts.join(' | ')}`;
}

export interface SelectedContextData {
    profile?: {
        name: string;
        age: number | null;
        gender: string | null;
        blood_group: string | null;
        prescriptionCount: number;
        documentCount: number;
    };
    medications?: string[];
    conditions?: string[];
    recentPrescriptions?: NormalisedPatientContext['recentPrescriptions'];
    labDocuments?: NormalisedPatientContext['labDocuments'];
    otherDocuments?: NormalisedPatientContext['otherDocuments'];
    dosage?: Array<{ medicine: string; dosage: string; date: string }>;
    timings?: Array<{ medicine: string; frequency: string; date: string }>;
    labValues?: Array<{ document: string; values: Record<string, string> }>;
    findings?: Array<{ document: string; keyFindings: string[]; detectedConditions: string[] }>;
    doctors?: string[];
}

export interface ContextSelection {
    /** Human-readable text blob (kept for debugging / logging) */
    text: string;
    /** Structured data — use this when building AI prompts to avoid [object Object] */
    data: SelectedContextData;
    slicesUsed: SliceKey[];
}

export function selectContext(query: string, ctx: NormalisedPatientContext): ContextSelection {
    const slices = detectSlices(query);
    const lines: string[] = [];
    const data: SelectedContextData = {};

    if (slices.includes('profile')) {
        const p = ctx.profile;
        lines.push(`PROFILE: ${p.name}, ${p.age ?? 'unknown age'}, ${p.gender ?? 'unknown gender'}, blood group ${p.blood_group ?? 'unknown'}`);
        lines.push(`RECORDS: ${ctx.prescriptionCount} prescription(s), ${ctx.documentCount} document(s)`);
        data.profile = {
            name: p.name,
            age: p.age,
            gender: p.gender,
            blood_group: p.blood_group,
            prescriptionCount: ctx.prescriptionCount,
            documentCount: ctx.documentCount,
        };
    }

    if (slices.includes('medications') && ctx.medications.length > 0) {
        lines.push(`MEDICATIONS: ${ctx.medications.join(', ')}`);
        data.medications = ctx.medications;
    }

    if (slices.includes('conditions') && ctx.conditions.length > 0) {
        lines.push(`CONDITIONS: ${ctx.conditions.join(', ')}`);
        data.conditions = ctx.conditions;
    }

    if (slices.includes('recentPrescriptions') && ctx.recentPrescriptions.length > 0) {
        lines.push('RECENT PRESCRIPTIONS:');
        ctx.recentPrescriptions.forEach(rx => lines.push(`  - ${formatRx(rx)}`));
        data.recentPrescriptions = ctx.recentPrescriptions;
    }

    if (slices.includes('labDocuments') && ctx.labDocuments.length > 0) {
        lines.push('LAB REPORTS:');
        ctx.labDocuments.forEach(doc => lines.push(`  - ${formatDoc(doc)}`));
        data.labDocuments = ctx.labDocuments;
    }

    if (slices.includes('otherDocuments') && ctx.otherDocuments.length > 0) {
        lines.push('OTHER MEDICAL DOCUMENTS:');
        ctx.otherDocuments.forEach(doc => lines.push(`  - ${formatDoc(doc)}`));
        data.otherDocuments = ctx.otherDocuments;
    }

    if (slices.includes('dosage') && ctx.recentPrescriptions.length > 0) {
        const dosageEntries: NonNullable<SelectedContextData['dosage']> = [];
        const dosageLines: string[] = [];
        for (const rx of ctx.recentPrescriptions) {
            for (const m of rx.medicines) {
                if (m.dosage) {
                    const d = safeStr(m.dosage);
                    dosageLines.push(`  - ${m.name}: ${d} (${rx.date})`);
                    dosageEntries.push({ medicine: m.name, dosage: d, date: rx.date });
                }
            }
        }
        if (dosageLines.length > 0) {
            lines.push('DOSAGE DETAILS:');
            lines.push(...dosageLines);
            data.dosage = dosageEntries;
        }
    }

    if (slices.includes('timings') && ctx.recentPrescriptions.length > 0) {
        const timingEntries: NonNullable<SelectedContextData['timings']> = [];
        const timingLines: string[] = [];
        for (const rx of ctx.recentPrescriptions) {
            for (const m of rx.medicines) {
                if (m.frequency) {
                    const f = safeStr(m.frequency);
                    timingLines.push(`  - ${m.name}: ${f} (${rx.date})`);
                    timingEntries.push({ medicine: m.name, frequency: f, date: rx.date });
                }
            }
        }
        if (timingLines.length > 0) {
            lines.push('MEDICATION TIMINGS / SCHEDULE:');
            lines.push(...timingLines);
            data.timings = timingEntries;
        }
    }

    if (slices.includes('labValues')) {
        const allDocs = [...ctx.labDocuments, ...ctx.otherDocuments];
        const labValueEntries: NonNullable<SelectedContextData['labValues']> = [];
        const valueLines: string[] = [];
        for (const doc of allDocs) {
            if (doc.labValues && Object.keys(doc.labValues).length > 0) {
                const safeValues = Object.fromEntries(
                    Object.entries(doc.labValues).map(([k, v]) => [k, safeStr(v)])
                );
                valueLines.push(`  - [${doc.name}] ${Object.entries(safeValues).map(([k, v]) => `${k}: ${v}`).join(', ')}`);
                labValueEntries.push({ document: doc.name, values: safeValues });
            }
        }
        if (valueLines.length > 0) {
            lines.push('LAB VALUES:');
            lines.push(...valueLines);
            data.labValues = labValueEntries;
        }
    }

    if (slices.includes('findings')) {
        const allDocs = [...ctx.labDocuments, ...ctx.otherDocuments];
        const findingEntries: NonNullable<SelectedContextData['findings']> = [];
        const findingLines: string[] = [];
        for (const doc of allDocs) {
            const kf = safeArr(doc.keyFindings);
            const dc = safeArr(doc.detectedConditions);
            if (kf.length || dc.length) {
                const parts: string[] = [];
                if (kf.length) parts.push(kf.join('; '));
                if (dc.length) parts.push(`Detected: ${dc.join(', ')}`);
                findingLines.push(`  - [${doc.name}] ${parts.join(' | ')}`);
                findingEntries.push({ document: doc.name, keyFindings: kf, detectedConditions: dc });
            }
        }
        if (findingLines.length > 0) {
            lines.push('KEY FINDINGS:');
            lines.push(...findingLines);
            data.findings = findingEntries;
        }
    }

    if (slices.includes('doctors') && ctx.recentPrescriptions.length > 0) {
        const unique = [...new Set(ctx.recentPrescriptions.map(rx => rx.doctorName))];
        lines.push(`TREATING DOCTORS: ${unique.join(', ')}`);
        data.doctors = unique;
    }

    return {
        text: lines.join('\n'),
        data,
        slicesUsed: slices,
    };
}
