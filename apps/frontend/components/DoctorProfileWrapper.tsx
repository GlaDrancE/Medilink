"use client";

import { useDoctorProfileModal } from "@/hooks/useDoctorProfileModal";
import DoctorProfileModal from "./DoctorProfile";
import { useEffect } from "react";

export default function DoctorProfileWrapper() {
    const { isModalOpen, closeModal } = useDoctorProfileModal();
    useEffect(() => {
        console.log(isModalOpen)
    }, [isModalOpen])

    const handleSuccess = () => {
        // You can add any success handling here
        console.log(isModalOpen)
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