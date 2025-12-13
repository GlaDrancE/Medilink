import { useEffect, useState } from "react";

export const useConnectionStatus = () => {
    const [status, setStatus] = useState(navigator.onLine ? "online" : "offline");

    useEffect(() => {
        const update = () => setStatus(navigator.onLine ? "online" : "offline");
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "CONNECTION_STATE") {
                setStatus(event.data.online ? "online" : "offline");
            }
        };

        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        navigator.serviceWorker?.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
            navigator.serviceWorker?.removeEventListener("message", handleMessage);
        };
    }, []);

    return status;
};