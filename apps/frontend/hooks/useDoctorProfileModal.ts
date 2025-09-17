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
        if (!isLoaded || !user) return;

        // Check if user is a doctor and profile is not completed
        const isDoctor = user.publicMetadata?.role === "doctor";
        const profileCompleted = localStorage.getItem("doctorProfileCompleted") === "true";

        if (!doctor?.hospital) {
            console.log(doctor)
            // Show modal after 3 seconds
            const timer = setTimeout(() => {
                setIsModalOpen(true);
                setHasShownModal(true);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [user, isLoaded, hasShownModal]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return {
        isModalOpen,
        openModal,
        closeModal,
    };
};