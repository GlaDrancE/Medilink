"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { updateDoctorProfile } from "@/services/api.routes";

interface DoctorProfileData {
    id: string;
    clinicName: string;
    clinicAddress: string;
    clinicPhoneNumber: string;
    medicalRegistrationNumber: string;
    yearsOfExperience: string;
    consultationType: string;
    specialization: string;
    qualifications: string;
    consultationFees: string;
    shortBio: string;
}

interface DoctorProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function DoctorProfileModal({ isOpen, onClose, onSuccess }: DoctorProfileModalProps) {
    const { user } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<DoctorProfileData>>({});

    const [formData, setFormData] = useState<DoctorProfileData>({
        id: "",
        clinicName: "",
        clinicAddress: "",
        clinicPhoneNumber: "",
        medicalRegistrationNumber: "",
        yearsOfExperience: "",
        consultationType: "",
        specialization: "",
        qualifications: "",
        consultationFees: "",
        shortBio: "",
    });

    // Validate form fields
    const validateForm = (): boolean => {
        const newErrors: Partial<DoctorProfileData> = {};

        if (!formData.clinicName.trim()) newErrors.clinicName = "Clinic name is required";
        if (!formData.clinicAddress.trim()) newErrors.clinicAddress = "Clinic address is required";
        if (!formData.clinicPhoneNumber.trim()) newErrors.clinicPhoneNumber = "Phone number is required";
        if (!formData.medicalRegistrationNumber.trim()) newErrors.medicalRegistrationNumber = "Medical registration number is required";
        if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = "Years of experience is required";
        if (!formData.consultationType.trim()) newErrors.consultationType = "Consultation type is required";
        if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required";
        if (!formData.qualifications.trim()) newErrors.qualifications = "Qualifications are required";
        if (!formData.shortBio.trim()) newErrors.shortBio = "Short bio is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const doctorData = {
                id: user?.id,
                clinic_name: formData.clinicName,
                clinic_address: formData.clinicAddress,
                clinic_phone_number: formData.clinicPhoneNumber,
                medical_registration_number: formData.medicalRegistrationNumber,
                years_of_experience: parseInt(formData.yearsOfExperience),
                consultation_type: formData.consultationType,
                specialization: formData.specialization,
                qualifications: formData.qualifications,
                consultation_fees: formData.consultationFees,
                bio: formData.shortBio,
            };

            await updateDoctorProfile(doctorData);

            // Store completion status in localStorage
            localStorage.setItem("doctorProfileCompleted", "true");

            onSuccess?.();
            onClose();
        } catch (error) {
            console.error("Error updating doctor profile:", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof DoctorProfileData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl mx-4">
                <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Complete Your Profile</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Please complete your profile to start accepting patients
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Clinic Name</label>
                            <input
                                type="text"
                                value={formData.clinicName}
                                onChange={(e) => handleInputChange("clinicName", e.target.value)}
                                placeholder="Enter your clinic name"
                                className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.clinicName ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                    } focus:ring-[1.5px] focus:ring-blue-600`}
                            />
                            {errors.clinicName && <p className="text-sm text-red-500">{errors.clinicName}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Clinic Address</label>
                        <input
                            type="text"
                            value={formData.clinicAddress}
                            onChange={(e) => handleInputChange("clinicAddress", e.target.value)}
                            placeholder="Enter your clinic address"
                            className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.clinicAddress ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                } focus:ring-[1.5px] focus:ring-blue-600`}
                        />
                        {errors.clinicAddress && <p className="text-sm text-red-500">{errors.clinicAddress}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Phone Number</label>
                            <input
                                type="tel"
                                value={formData.clinicPhoneNumber}
                                onChange={(e) => handleInputChange("clinicPhoneNumber", e.target.value)}
                                placeholder="Enter your clinic phone number"
                                className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.clinicPhoneNumber ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                    } focus:ring-[1.5px] focus:ring-blue-600`}
                            />
                            {errors.clinicPhoneNumber && <p className="text-sm text-red-500">{errors.clinicPhoneNumber}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Medical Registration Number</label>
                            <input
                                type="text"
                                value={formData.medicalRegistrationNumber}
                                onChange={(e) => handleInputChange("medicalRegistrationNumber", e.target.value)}
                                placeholder="Enter your medical registration number"
                                className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.medicalRegistrationNumber ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                    } focus:ring-[1.5px] focus:ring-blue-600`}
                            />
                            {errors.medicalRegistrationNumber && <p className="text-sm text-red-500">{errors.medicalRegistrationNumber}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Years of Experience</label>
                            <input
                                type="number"
                                value={formData.yearsOfExperience}
                                onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                                placeholder="Enter your total professional experience in years"
                                className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.yearsOfExperience ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                    } focus:ring-[1.5px] focus:ring-blue-600`}
                            />
                            {errors.yearsOfExperience && <p className="text-sm text-red-500">{errors.yearsOfExperience}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-900">Consultation Type</label>
                            <select
                                value={formData.consultationType}
                                onChange={(e) => handleInputChange("consultationType", e.target.value)}
                                className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.consultationType ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                    } focus:ring-[1.5px] focus:ring-blue-600`}
                            >
                                <option value="">Select consultation type</option>
                                <option value="online">Online</option>
                                <option value="in-person">In-person</option>
                                <option value="both">Both</option>
                            </select>
                            {errors.consultationType && <p className="text-sm text-red-500">{errors.consultationType}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Specialization(s)</label>
                        <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) => handleInputChange("specialization", e.target.value)}
                            placeholder="e.g., Dermatologist, Cardiologist"
                            className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.specialization ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                } focus:ring-[1.5px] focus:ring-blue-600`}
                        />
                        {errors.specialization && <p className="text-sm text-red-500">{errors.specialization}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Qualifications</label>
                        <input
                            type="text"
                            value={formData.qualifications}
                            onChange={(e) => handleInputChange("qualifications", e.target.value)}
                            placeholder="e.g., MBBS, MD, DNB, etc."
                            className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.qualifications ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                } focus:ring-[1.5px] focus:ring-blue-600`}
                        />
                        {errors.qualifications && <p className="text-sm text-red-500">{errors.qualifications}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Consultation Fees (Optional)</label>
                        <input
                            type="text"
                            value={formData.consultationFees}
                            onChange={(e) => handleInputChange("consultationFees", e.target.value)}
                            placeholder="e.g., Online: $50, In-person: $75"
                            className="w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-gray-300 hover:ring-gray-400 focus:ring-[1.5px] focus:ring-blue-600"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">Short Bio</label>
                        <textarea
                            value={formData.shortBio}
                            onChange={(e) => handleInputChange("shortBio", e.target.value)}
                            placeholder="Tell patients about yourself and your expertise"
                            rows={4}
                            className={`w-full rounded-md px-3.5 py-2 text-sm outline-none ring-1 ring-inset ${errors.shortBio ? "ring-red-400" : "ring-gray-300 hover:ring-gray-400"
                                } focus:ring-[1.5px] focus:ring-blue-600`}
                        />
                        {errors.shortBio && <p className="text-sm text-red-500">{errors.shortBio}</p>}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
