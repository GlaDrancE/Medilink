"use client"
import { useState, useEffect } from "react"

type ServiceWorkerStatus = "registering" | "registered" | "unregistered" | "error" | "unsupported"

export const useServiceWorker = () => {
    const [state, setState] = useState<ServiceWorkerStatus>("registering")

    useEffect(() => {
        if (
            typeof window === "undefined" ||
            !("serviceWorker" in navigator)
        ) {
            setState("unsupported")
            return;
        }


        let registration: ServiceWorkerRegistration | null = null;

        const registerSW = async () => {
            try {
                registration = await navigator.serviceWorker.register("/worker.js", {
                    scope: "/"
                })
                console.log("Service worker registered", registration.scope)

                registration.addEventListener("updatefound", () => {
                    const newWorker = registration?.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener("statechange", () => {
                        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                            console.log("New service worker available")
                        }
                    })
                })
                if (registration.active) {
                    setState("registered")
                } else {
                    setState("registered")
                }

                navigator.serviceWorker.addEventListener("controllerchange", () => {
                    window.location.reload();
                })
            } catch (error) {
                console.error("Service worker registration failed", error)
                setState("error")
            }
        }
        if (document.readyState === "complete") {
            registerSW();
        } else {
            window.addEventListener("load", registerSW);
        }
        return () => {
            registration?.unregister();
        }

    }, [])
    return { state, isSupported: state !== "unsupported" }

}