"use client";

import React from "react";
import { DoctorSidebar } from "@/components/DoctorSidebar";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import DoctorProfileWrapper from "@/components/DoctorProfileWrapper";

interface DoctorLayoutProps {
    children: React.ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
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
