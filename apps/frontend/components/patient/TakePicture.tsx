"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, Image as ImageIcon, X, RotateCw } from "lucide-react";
import { Patient } from "@/types";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../ui/dialog";
import Select from "../ui/select";
import { usePatientActiveTab } from "@/hooks/patientActiveTab";
import { useRouter } from "next/navigation";
export interface TakePictureProps {
    onCapture: (file: File, dataUrl: string, type: string) => void;
    onCancel?: () => void;
    aspect?: "original" | "document"; // document ~ A4-ish crop
    enableFileUpload?: boolean;
    className?: string;
    patient?: Patient;
}

const A4_ASPECT_RATIO = 1 / Math.sqrt(2); // ~0.707

const TakePicture: React.FC<TakePictureProps> = ({
    onCapture,
    onCancel,
    aspect = "document",
    enableFileUpload = true,
    className,
    patient,
}) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const router = useRouter();

    const [isStarting, setIsStarting] = useState<boolean>(false);
    const [isCapturing, setIsCapturing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
    const [capturedDataUrl, setCapturedDataUrl] = useState<string>("");
    const [documentType, setDocumentType] = useState<"lab" | "prescription" | "diagnosis" | "visit" | null>(null);
    const [selectDocumentType, setSelectDocumentType] = useState<boolean>(false);
    const { activeTab, setActiveTab } = usePatientActiveTab();
    const stopCamera = useCallback(() => {
        const currentStream = streamRef.current;
        if (currentStream) {
            currentStream.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        setError("");
        setIsStarting(true);
        setCapturedDataUrl("");
        try {
            stopCamera();
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode,
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
                audio: false,
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                const videoPromise = videoRef.current.play();
                if (videoPromise !== undefined) {
                    videoPromise.then(() => {
                        console.log('Video played successfully');
                    }).catch((error) => {
                        console.log('Video playback failed', error);
                    });
                }
            }
        } catch (e) {
            console.log(e)
            setError("Unable to access camera. You can upload from files instead.");
        } finally {
            setIsStarting(false);
        }
    }, [facingMode, stopCamera]);

    useEffect(() => {
        if (!("mediaDevices" in navigator)) {
            setError("Camera not supported by this browser.");
            return;
        }
        startCamera();
        return () => {
            stopCamera();
        };
    }, [startCamera, stopCamera]);

    const flipCamera = async () => {
        setFacingMode((m) => (m === "environment" ? "user" : "environment"));
    };

    const captureToCanvas = (): HTMLCanvasElement | null => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return null;

        const videoWidth = video.videoWidth || 1280;
        const videoHeight = video.videoHeight || 720;

        // Determine target crop based on desired aspect
        let targetWidth = videoWidth;
        let targetHeight = videoHeight;
        if (aspect === "document") {
            const targetRatio = A4_ASPECT_RATIO; // ~0.707 (w/h)
            const currentRatio = videoWidth / videoHeight;
            if (currentRatio > targetRatio) {
                // too wide: reduce width
                targetWidth = Math.floor(videoHeight * targetRatio);
                targetHeight = videoHeight;
            } else {
                // too tall: reduce height
                targetWidth = videoWidth;
                targetHeight = Math.floor(videoWidth / targetRatio);
            }
        }

        // Compute source crop rect centered
        const sx = Math.floor((videoWidth - targetWidth) / 2);
        const sy = Math.floor((videoHeight - targetHeight) / 2);
        const sWidth = targetWidth;
        const sHeight = targetHeight;

        canvas.width = sWidth;
        canvas.height = sHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
        return canvas;
    };

    const dataUrlToFile = async (dataUrl: string): Promise<File> => {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        return new File([blob], `document-${patient?.name || 'patient' + '-' + Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
    };

    const handleCapture = async () => {
        setIsCapturing(true);
        try {
            const canvas = captureToCanvas();
            if (!canvas) return;
            const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
            setCapturedDataUrl(dataUrl);
        } catch (e) {
            console.log(e)
        } finally {
            setIsCapturing(false);
        }
    };

    const handleRetake = () => {
        startCamera();
        setCapturedDataUrl("");
    };

    const handleConfirm = async () => {
        if (!capturedDataUrl) return;
        const file = await dataUrlToFile(capturedDataUrl);
        if (!documentType) {
            setSelectDocumentType(true);
            return;
        }
        onCapture(file, capturedDataUrl, documentType);

        setCapturedDataUrl("")

    };

    const handleSelectTypeAndConfirm = async (type: "lab" | "prescription" | "diagnosis" | "visit") => {
        setDocumentType(type);
        if (capturedDataUrl) {
            const file = await dataUrlToFile(capturedDataUrl);
            setSelectDocumentType(false);
            onCapture(file, capturedDataUrl, documentType || "prescription");
        } else {
            setSelectDocumentType(false);
        }
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            onCapture(file, String(reader.result || ""), documentType || "");
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className={`w-full h-full ${className || ""}`}>
            {/* Video Preview / Captured Image */}
            <div className="relative w-full h-full overflow-hidden rounded-md border bg-black">
                {!capturedDataUrl ? (
                    <video ref={videoRef} className="w-full h-[35rem] object-contain bg-black" playsInline muted />
                ) : (
                    <img src={capturedDataUrl} alt="Captured document" className="w-full h-[35rem] object-contain bg-black" />
                )}

                {/* Document guide overlay (A4 frame) */}
                {!capturedDataUrl && aspect === "document" && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-white/60 rounded-sm" style={{ width: "70%", aspectRatio: `${A4_ASPECT_RATIO} / 1` }} />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-3 flex flex-wrap gap-2 items-center">
                {!capturedDataUrl ? (
                    <>
                        <Button onClick={handleCapture} disabled={isStarting || !!error} className="bg-blue-600 hover:bg-blue-700">
                            <Camera className="w-4 h-4 mr-2" /> Capture
                        </Button>
                        <Button onClick={startCamera} variant="outline" disabled={isStarting}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                        </Button>
                        <Button onClick={flipCamera} variant="outline" disabled={isStarting}>
                            <RotateCw className="w-4 h-4 mr-2" /> Flip
                        </Button>
                        {enableFileUpload && (
                            <label className="inline-flex items-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFileInput}
                                />
                                <span className="inline-flex">
                                    <Button type="button" variant="outline">
                                        <ImageIcon className="w-4 h-4 mr-2" /> Upload
                                    </Button>
                                </span>
                            </label>
                        )}
                        {onCancel && (
                            <Button onClick={onCancel} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
                            <Check className="w-4 h-4 mr-2" /> Use Photo
                        </Button>
                        <Button onClick={() => setSelectDocumentType(true)} className="">
                            {documentType}
                        </Button>
                        <Button onClick={handleRetake} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" /> Retake
                        </Button>
                        {onCancel && (
                            <Button onClick={onCancel} variant="outline">
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Error */}
            {error && (
                <div className="mt-2 text-xs text-red-600">{error}</div>
            )}
            <div className="mt-2 text-[10px] text-gray-500">
                Tip: For best results, place the document on a contrasting background with good lighting.
            </div>

            {selectDocumentType && (
                <Dialog open={selectDocumentType} onOpenChange={setSelectDocumentType}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Select Document Type</DialogTitle>
                        </DialogHeader>
                        <Select
                            options={[
                                { label: "None", value: "" },
                                { label: "Lab Test", value: "lab" },
                                { label: "Prescription", value: "prescription" },
                                { label: "Diagnosis", value: "diagnosis" },
                                { label: "Visit", value: "visit" },
                            ]}
                            onChange={(e) => handleSelectTypeAndConfirm(e.target.value as "lab" | "prescription" | "diagnosis" | "visit")}
                        >
                        </Select>
                    </DialogContent>
                </Dialog>
            )}


        </div>
    );
};

export default TakePicture;