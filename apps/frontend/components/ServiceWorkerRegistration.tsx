"use client"
import { useServiceWorker } from '@/hooks/useServiceWorker'
import React, { useEffect } from 'react'

type Props = {}

const ServiceWorkerRegistration = () => {
    const { state, isSupported } = useServiceWorker();

    useEffect(() => {
        if (state === "registered") {
            console.log("Service worker is active");
        } else if (state === "error") {
            console.error("Service worker registration failed");
        } else if (state === "unsupported") {
            console.log("Service worker is not supported");
        }
    }, [state, isSupported])

    return null
}
export default ServiceWorkerRegistration