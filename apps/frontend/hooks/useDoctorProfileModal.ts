"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useDoctor } from "./useDoctor";

export const useDoctorProfileModal = () => {
    const { user, isLoaded } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasShownModal, setHasShownModal] = useState(false);
    const { doctor } = useDoctor();

    useEffect(() => {
        if (!isLoaded || !user || hasShownModal) return;


        // Check if profile is completed by looking at localStorage first
        const profileCompleted = localStorage.getItem("doctorProfileCompleted") === "true";
        if (profileCompleted) return;
        
        // Also check if doctor data indicates incomplete profile
        const hasRequiredFields = doctor && 
            doctor.hospital && // clinic_name maps to hospital
            doctor.address && // clinic_address maps to address  
            doctor.license_number && // medical_registration_number maps to license_number
            doctor.experience && // years_of_experience maps to experience
            doctor.specialization && 
            doctor.bio; // short_bio maps to bio

        if (!hasRequiredFields) {
            // Show modal after 2 seconds to allow page to load
            const timer = setTimeout(() => {
                if (!hasShownModal) { // Double check to prevent race conditions
                    setIsModalOpen(true);
                    setHasShownModal(true);
                }
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [user, isLoaded, doctor, hasShownModal]);

    const openModal = () => {
        setIsModalOpen(true);
        setHasShownModal(true);
    };
    const closeModal = () => setIsModalOpen(false);

    return {
        isModalOpen,
        openModal,
        closeModal,
    };
};