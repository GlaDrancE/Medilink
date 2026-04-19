import { Doctor, Patient, Prescriptions } from "@/types";
import axios from "axios";
import { getAuthToken } from "@/lib/tokenManager";

const api = axios.create({
    // baseURL: "https://medilink-h77v.onrender.com/api/v1",
    baseURL: "http://localhost:3000/api/v1",
    timeout: 60000,
});

api.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const register = async (phone: string) => {
    try {
        const response = await api.post("/auth/login", {
            phone,
        })
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const loginPatient = async (id: string) => {
    try {
        const response = await api.post("/auth/patient/login", {
            id,
        })
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const registerPatient = async (data: Patient) => {
    try {
        const response = await api.post("/auth/patient/register", data)
        localStorage.setItem("token", response.data.token)
        return response;
    } catch (error) {
        throw error;
    }
}

export const searchPatientByPhone = async (phone: string) => {
    try {
        const response = await api.get(`/patient/search?phone=${encodeURIComponent(phone)}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}
export const createPatient = async (data: Patient) => {
    try {
        const response = await api.post(`/patient`, data)
        return response;
    } catch (error) {
        throw error;
    }
}
export const getDoctorById = async () => {
    try {
        const response = await api.get(`/doctor`)
        return response;
    } catch (error) {
        throw error
    }
}
export const getAllDoctors = async () => {
    try {
        const response = await api.get(`/doctor/all`)
        return response;
    } catch (error) {
        throw error
    }
}
export const createDoctor = async (data: Doctor) => {
    try {
        const response = await api.post(`/doctor`, data)
        return response;
    } catch (error) {
        throw error
    }
}
const updateDoctor = async (doctorId: string, data: Doctor) => {
    try {
        const response = await api.put(`/doctor?doctor=${doctorId}`, data)
        return response;
    } catch (error) {
        throw error
    }
}

export const getPrescription = async () => {
    try {
        const response = await api.get(`/prescription`)
        return response.data;
    } catch (error) {
        throw error
    }
}

export const getDoctorPrescriptionList = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
}) => {
    try {
        const query = new URLSearchParams();
        if (params?.page)   query.set("page",   String(params.page));
        if (params?.limit)  query.set("limit",  String(params.limit));
        if (params?.search?.trim()) query.set("search", params.search.trim());
        const response = await api.get(`/prescription/doctor?${query.toString()}`);
        return response.data as {
            prescriptions: PrescriptionListItem[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } catch (error) {
        throw error;
    }
};

export interface PrescriptionListItem {
    id: string;
    index: number;
    patient_id: string;
    doctor_id: string;
    prescription_date: string;
    prescription_text: string;
    is_active: boolean;
    follow_up_date: string | null;
    patient: {
        id: string;
        name: string | null;
        phone: string;
        age: number | null;
        gender: string | null;
        blood_group: string | null;
    };
    medicine_list: {
        id: string;
        name: string;
        dosage: { morning: string; afternoon: string; night: string };
        before_after_food: string;
    }[];
    checkups: {
        id: string;
        checkup_text: string;
        checkup_date: string;
        is_active: boolean;
    }[];
}

export const addPrescription = async (data: Prescriptions) => {
    try {
        const response = await api.post(`/prescription`, data)
        return response;
    } catch (error) {
        throw error
    }
}
export const getRecentPatients = async () => {
    try {
        const response = await api.get(`/doctor/recent`)
        return response.data;
    } catch (error) {
        throw error
    }
}

export const getDoctorFollowUps = async () => {
    try {
        const response = await api.get(`/follow-up/me`);
        return response.data as FollowUpItem[];
    } catch (error) {
        throw error;
    }
}

export interface FollowUpItem {
    id: string;
    patient_id: string;
    doctor_id: string;
    prescription_date: string;
    prescription_text: string;
    is_active: boolean;
    follow_up_date: string;
    patient: {
        id: string;
        name: string | null;
        phone: string;
        age: number | null;
        gender: string | null;
    };
    medicine_list: { id: string; name: string }[];
}

export const getDoctorPatients = async (params?: {
    page?: number;
    limit?: number;
    search?: string;
}) => {
    try {
        const query = new URLSearchParams();
        if (params?.page) query.set("page", String(params.page));
        if (params?.limit) query.set("limit", String(params.limit));
        if (params?.search?.trim()) query.set("search", params.search.trim());
        const response = await api.get(`/doctor/patients?${query.toString()}`);
        return response.data as {
            patients: any[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } catch (error) {
        throw error;
    }
};
export const updateDoctorProfile = async (data: any) => {
    try {
        const response = await api.put(`/doctor/${data.id}`, data)
        return response;
    } catch (error) {
        throw error
    }
}


export const getPatientById = async () => {
    try {
        const response = await api.get(`/patient`)
        return response.data;
    } catch (error) {
        throw error
    }
}
export const uploadDocument = async (data: { fileUrl: string, type: string, imageData?: string }) => {
    try {
        const response = await api.put('/patient/document', data)
        return response;
    } catch (error) {
        console.log(error)
        throw error
    }
}



// Upload Cloudinary 
export const uploadFile = async (formData: FormData) => {
    try {
        const response = await axios.post(`https://api.cloudinary.com/v1_1/dduj1ln0v/image/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        return response;
    } catch (error) {
        throw error
    }
}

// AI Analysis
export const analyzeDocument = async (imageData: string, documentType: string) => {
    try {
        const response = await api.post("/ai/analyze", {
            imageData,
            documentType,
        });
        return response.data;
    } catch (error) {
        console.error("AI Analysis error:", error);
        throw error;
    }
};

export const analyzeDocumentBatch = async (documents: Array<{ imageData: string; documentType: string }>) => {
    try {
        const response = await api.post("/ai/analyze/batch", {
            documents,
        });
        return response.data;
    } catch (error) {
        console.error("Batch AI Analysis error:", error);
        throw error;
    }
};

export const analyzePatientQuery = async (query: string, patientId: string) => {
    try {
        const response = await api.post("/ai/patient-query", { query, patientId });
        return response.data as { success: boolean; text: string; contextMeta: { slicesUsed: string[]; fromCache: boolean; prescriptionCount: number; documentCount: number } };
    } catch (error) {
        console.error("Patient query AI error:", error);
        throw error;
    }
};

// Voice Assistant
export const processVoiceInput = async (audioBlob: Blob, patientId: string, transcript?: string) => {
    try {
        const formData = new FormData();
        formData.append("audio", audioBlob, "voice-input.webm");
        formData.append("patientId", patientId);
        if (transcript) formData.append("transcript", transcript);

        const response = await api.post("/voice/process", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error) {
        console.error("Voice input error:", error);
        throw error;
    }
};

export const sendVoiceTextQuery = async (query: string, patientId: string) => {
    try {
        const response = await api.post("/voice/query", { query, patientId });
        return response.data;
    } catch (error) {
        console.error("Voice text query error:", error);
        throw error;
    }
};

export const getPatientVoiceContext = async (patientId: string) => {
    try {
        const response = await api.get(`/voice/context/${patientId}`);
        return response.data;
    } catch (error) {
        console.error("Voice context error:", error);
        throw error;
    }
};

export const textToSpeech = async (text: string) => {
    try {
        const response = await api.post("/voice/tts", { text });
        return response.data.audioUrl as string;
    } catch (error) {
        console.error("TTS error:", error);
        throw error;
    }
};

// API Routes Constants for Voice Assistant
export const API_ROUTES = {
    BASE_URL: "http://localhost:3000/api/v1",
    VOICE_ASSISTANT: {
        PROCESS: "http://localhost:3000/api/v1/voice/process",
        QUERY: "http://localhost:3000/api/v1/voice/query",
        CONTEXT: (patientId: string) => `http://localhost:3000/api/v1/voice/context/${patientId}`,
        TTS: "http://localhost:3000/api/v1/voice/tts",
    },
    AI_ANALYSIS: {
        PATIENT_QUERY: "http://localhost:3000/api/v1/ai/patient-query",
    },
};

