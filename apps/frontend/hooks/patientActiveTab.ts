"use client"
import { useState } from "react";

export const usePatientActiveTab = () => {
    const [activeTab, setActiveTab] = useState('home');
    return {
        activeTab,
        setActiveTab
    }
}