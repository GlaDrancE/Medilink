"use client";

import { useDoctorProfileModal } from "@/hooks/useDoctorProfileModal";
import DoctorProfileModal from "./DoctorProfile";
import { useEffect } from "react";
import { useDoctor } from "@/hooks/useDoctor";

export default function DoctorProfileWrapper() {
    const { isModalOpen, closeModal } = useDoctorProfileModal();

    const handleSuccess = () => {
        // Mark profile as completed
        localStorage.setItem("doctorProfileCompleted", "true");
        
        // Close the modal
        closeModal();
        
        // Optionally refresh the page or update state
        console.log("Doctor profile updated successfully");
    };

    return (
        <DoctorProfileModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onSuccess={handleSuccess}
        />
    );
} 