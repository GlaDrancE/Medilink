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
    date_of_birth?: string | null
    blood_group?: string | null
    allergies?: string[]
    medical_history?: string[]
    is_active: boolean
    createdAt?: string
    updatedAt?: string
    prescriptions?: Prescriptions[]
}

export interface Prescriptions {
    id: string
    index?: number
    patient_id: string
    doctor_id: string
    prescription_date: string
    prescription_text: string
    is_active: boolean
    createdAt?: string
    updatedAt?: string
    medicine_list: MedicineEntry[]
    checkups?: Checkup[]
    doctor: Doctor
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