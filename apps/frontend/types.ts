export interface Doctor {
    id: string
    name: string
    email?: string
    password?: string
    address?: string
    hospital?: string
    license_number?: string
    specialization?: string
    experience?: number
    bio?: string
    profile_picture?: string
    is_active: boolean
    is_verified: boolean
    is_approved: boolean
    is_rejected: boolean
    createdAt?: Date
    updatedAt?: Date
    patients?: Patient[]
    prescriptions?: Prescriptions[]
}

export interface Patient {
    id: string
    doctor_id?: string | null
    name: string
    email?: string
    password?: string | null
    phone: string
    address?: string | null
    gender?: string | null
    age: number
    weight: number
    height: number
    date_of_birth?: string | null
    blood_group?: string | null
    allergies?: string[]

    document_id?: string | null
    documents?: Document[]
    is_active: boolean
    createdAt?: string
    updatedAt?: string
    prescriptions?: Prescriptions[]
}

export interface Document {
    id: string
    file_url: string
    type: string
    name?: string
    createdAt: string
    updatedAt: string
    
    // AI Analysis fields
    ai_summary?: string | null
    ai_key_findings?: string[]
    ai_recommendations?: string[]
    ai_detected_conditions?: string[]
    ai_medications?: string[]
    ai_lab_values?: Record<string, string> | null
    ai_confidence?: number | null
    ai_analyzed_at?: string | null
}

export interface AIAnalysisResult {
    summary: string
    keyFindings: string[]
    recommendations: string[]
    documentType: string
    confidence: number
    detectedConditions?: string[]
    medications?: string[]
    labValues?: Record<string, string>
}

export interface Prescriptions {
    id: string
    index?: number
    disease?: string
    nextAppointment?: Date
    patient_id?: string
    doctor_id?: string
    prescription_date: string
    prescription_text: string
    is_active: boolean
    createdAt: Date
    updatedAt: Date
    medicine_list: MedicineEntry[]
    checkups?: Checkup[]
    doctor: Doctor
    name?: string
    patient: Patient
}

export interface MedicineEntry {
    id: string
    name: string
    dosage: {
        morning: string
        afternoon: string
        night: string
    }
    time: string
    notes?: string
    before_after_food: string
    prescription_id: string
}

export interface Checkup {
    id: string
    name: string
    description: string
    date: Date
    completed: boolean
    doctor: Doctor
    patient: Patient
    suggestedHospital: string
    suggestedDoctor: string
    createdAt?: Date
    updatedAt?: Date
}