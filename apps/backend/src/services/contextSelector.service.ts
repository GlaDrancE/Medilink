import { NormalisedPatientContext } from './patientContextCache.service';

type SliceKey = 'profile' | 'medications' | 'recentPrescriptions' | 'labDocuments' | 'otherDocuments' | 'conditions';

interface SliceRule {
    keywords: string[];
    slices: SliceKey[];
}

const SLICE_RULES: SliceRule[] = [
    {
        keywords: ['medicine', 'drug', 'medication', 'dose', 'dosage', 'tablet', 'capsule', 'pill', 'taking', 'prescribed medicine'],
        slices: ['profile', 'medications', 'recentPrescriptions'],
    },
    {
        keywords: ['lab', 'test', 'result', 'blood', 'report', 'value', 'level', 'count', 'hb', 'sugar', 'cholesterol'],
        slices: ['profile', 'labDocuments', 'conditions'],
    },
    {
        keywords: ['condition', 'diagnosis', 'disease', 'disorder', 'illness', 'suffer', 'problem', 'ailment', 'chronic'],
        slices: ['profile', 'conditions', 'otherDocuments'],
    },
    {
        keywords: ['doctor', 'physician', 'specialist', 'prescribed', 'prescription', 'checkup', 'visit'],
        slices: ['profile', 'recentPrescriptions'],
    },
    {
        keywords: ['history', 'summary', 'overview', 'everything', 'all', 'background', 'overall', 'general'],
        slices: ['profile', 'medications', 'conditions', 'recentPrescriptions', 'labDocuments', 'otherDocuments'],
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
        .map(m => [m.name, m.dosage, m.frequency].filter(Boolean).join(' '))
        .join(', ');
    return `[${rx.date} · Dr. ${rx.doctorName}] ${meds || 'No medicines listed'}`;
}

function formatDoc(doc: NormalisedPatientContext['labDocuments'][number]): string {
    const parts: string[] = [];
    if (doc.summary) parts.push(`Summary: ${doc.summary}`);
    if (doc.keyFindings?.length) parts.push(`Findings: ${doc.keyFindings.join('; ')}`);
    if (doc.detectedConditions?.length) parts.push(`Conditions: ${doc.detectedConditions.join(', ')}`);
    if (doc.labValues && Object.keys(doc.labValues).length) {
        const vals = Object.entries(doc.labValues).map(([k, v]) => `${k}: ${v}`).join(', ');
        parts.push(`Lab values: ${vals}`);
    }
    return `[${doc.name}] ${parts.join(' | ')}`;
}

export interface ContextSelection {
    text: string;
    slicesUsed: SliceKey[];
}

export function selectContext(query: string, ctx: NormalisedPatientContext): ContextSelection {
    const slices = detectSlices(query);
    const lines: string[] = [];

    if (slices.includes('profile')) {
        const p = ctx.profile;
        lines.push(`PROFILE: ${p.name}, ${p.age ?? 'unknown age'}, ${p.gender ?? 'unknown gender'}, blood group ${p.blood_group ?? 'unknown'}`);
        lines.push(`RECORDS: ${ctx.prescriptionCount} prescription(s), ${ctx.documentCount} document(s)`);
    }

    if (slices.includes('medications') && ctx.medications.length > 0) {
        lines.push(`MEDICATIONS: ${ctx.medications.join(', ')}`);
    }

    if (slices.includes('conditions') && ctx.conditions.length > 0) {
        lines.push(`CONDITIONS: ${ctx.conditions.join(', ')}`);
    }

    if (slices.includes('recentPrescriptions') && ctx.recentPrescriptions.length > 0) {
        lines.push('RECENT PRESCRIPTIONS:');
        ctx.recentPrescriptions.forEach(rx => lines.push(`  - ${formatRx(rx)}`));
    }

    if (slices.includes('labDocuments') && ctx.labDocuments.length > 0) {
        lines.push('LAB REPORTS:');
        ctx.labDocuments.forEach(doc => lines.push(`  - ${formatDoc(doc)}`));
    }

    if (slices.includes('otherDocuments') && ctx.otherDocuments.length > 0) {
        lines.push('OTHER MEDICAL DOCUMENTS:');
        ctx.otherDocuments.forEach(doc => lines.push(`  - ${formatDoc(doc)}`));
    }

    return {
        text: lines.join('\n'),
        slicesUsed: slices,
    };
}
