import { Doctor, Patient, Prescriptions } from "@/types";
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3002/api/v1",
})
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

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
        return response.data;
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

export const addPrescription = async (data: Prescriptions) => {
    try {
        const response = await api.post(`/prescription`, data)
        return response;
    } catch (error) {
        throw error
    }
}

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
export const uploadDocument = async (data: { fileUrl: string, type: string, name?: string }) => {
    try {
        const response = await api.put('/patient/document', data)
        return response.data;
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