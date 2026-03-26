"use client";

import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import DoctorProfileWrapper from "@/components/DoctorProfileWrapper";
import { setDoctorTokenGetter, clearDoctorTokenGetter } from "@/lib/tokenManager";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
    const { getToken } = useAuth();

    useEffect(() => {
        // Register the Clerk token getter so the axios interceptor always gets a fresh token
        setDoctorTokenGetter(getToken);
        return () => clearDoctorTokenGetter();
    }, [getToken]);

    return (
        <SubscriptionProvider>
            <div className="flex h-screen bg-gray-50">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <DoctorSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">{children}</div>
            </div>

            {/* Doctor Profile Modal */}
            <DoctorProfileWrapper />
        </SubscriptionProvider>
    );
}
