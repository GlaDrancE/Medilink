"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, Check, Image as ImageIcon, X, RotateCw, CheckCircle } from "lucide-react";
import { Patient } from "@/types";
import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../ui/dialog";
import { Select, SelectContent, SelectItem } from "../ui/select";
import Input from "../ui/input";
import { Label } from "../ui/label";
import { AlertCircle } from "lucide-react";
export interface TakePictureProps {
    onCapture: (file: File, dataUrl: string, type: string, name?: string) => void;
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

    const [isStarting, setIsStarting] = useState<boolean>(false);
    const [isCapturing, setIsCapturing] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
    const [capturedDataUrl, setCapturedDataUrl] = useState<string>("");
    const [documentType, setDocumentType] = useState<"lab" | "prescription" | "diagnosis" | "visit" | null>(null);
    const [selectDocumentType, setSelectDocumentType] = useState<boolean>(false);
    const [showNameDialog, setShowNameDialog] = useState<boolean>(false);
    const [documentName, setDocumentName] = useState<string>("");
    const [nameError, setNameError] = useState<string>("");
    const [typeError, setTypeError] = useState<string>("");
    const [showSuccessMessage, setShowSuccessMessage] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);

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
        
        // Check if document type is selected
        if (!documentType) {
            setTypeError("Please select a document type before proceeding.");
            setSelectDocumentType(true);
            return;
        }
        
        // Clear any previous errors
        setTypeError("");
        setNameError("");
        
        // Show name input dialog
        setShowNameDialog(true);
    };

    const handleNameSubmit = async () => {
        // Validate document name
        if (!documentName.trim()) {
            setNameError("Please enter a name for the document.");
            return;
        }
        
        if (!documentType) {
            setTypeError("Please select a document type.");
            setShowNameDialog(false);
            setSelectDocumentType(true);
            return;
        }
        
        // Clear errors and show uploading state
        setNameError("");
        setTypeError("");
        setIsUploading(true);
        
        try {
            const file = await dataUrlToFile(capturedDataUrl);
            await onCapture(file, capturedDataUrl, documentType, documentName.trim());
            
            // Show success message
            setShowNameDialog(false);
            setShowSuccessMessage(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setShowSuccessMessage(false);
                // Reset all states
                setCapturedDataUrl("");
                setDocumentName("");
                setDocumentType(null);
                // Restart camera for next capture
                startCamera();
            }, 3000);
            
        } catch (error) {
            console.error('Upload failed:', error);
            setNameError("Failed to upload document. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleCancelName = () => {
        setShowNameDialog(false);
        setDocumentName("");
        setNameError("");
    };

    const handleSelectType = (type: "lab" | "prescription" | "diagnosis" | "visit") => {
        setDocumentType(type);
        setSelectDocumentType(false);
        setTypeError("");
    };

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        // Check if document type is selected
        if (!documentType) {
            setTypeError("Please select a document type before uploading.");
            setSelectDocumentType(true);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
            setCapturedDataUrl(String(reader.result || ""));
            // Show name dialog for uploaded files too
            setShowNameDialog(true);
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
                        <Button onClick={() => setSelectDocumentType(true)} className="" variant={documentType ? "outline" : "secondary"}>
                            {documentType || "Select Type"}
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

            {/* Document Type Selection Dialog */}
            {selectDocumentType && (
                <Dialog open={selectDocumentType} onOpenChange={setSelectDocumentType}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Select Document Type</DialogTitle>
                        </DialogHeader>
                        
                        {typeError && (
                            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{typeError}</span>
                            </div>
                        )}
                        
                        <div className="space-y-2">
                            <Button 
                                onClick={() => handleSelectType("prescription")} 
                                variant="outline" 
                                className="w-full justify-start"
                            >
                                Prescription
                            </Button>
                            <Button 
                                onClick={() => handleSelectType("lab")} 
                                variant="outline" 
                                className="w-full justify-start"
                            >
                                Lab Test
                            </Button>
                            <Button 
                                onClick={() => handleSelectType("diagnosis")} 
                                variant="outline" 
                                className="w-full justify-start"
                            >
                                Diagnosis
                            </Button>
                            <Button 
                                onClick={() => handleSelectType("visit")} 
                                variant="outline" 
                                className="w-full justify-start"
                            >
                                Visit Report
                            </Button>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                            <Button variant="outline" onClick={() => setSelectDocumentType(false)} className="flex-1">
                                Cancel
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Document Name Input Dialog */}
            {showNameDialog && (
                <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
                    <DialogContent className="max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Enter Document Name</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="documentName">Document Name</Label>
                                <Input
                                    id="documentName"
                                    value={documentName}
                                    onChange={(e) => {
                                        setDocumentName(e.target.value);
                                        if (nameError) setNameError("");
                                    }}
                                    placeholder={`Enter ${documentType} name...`}
                                    className="mt-1"
                                />
                                {nameError && (
                                    <div className="flex items-center space-x-2 text-red-600 mt-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span className="text-sm">{nameError}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                                <p><strong>Type:</strong> {documentType}</p>
                                <p><strong>Patient:</strong> {patient?.name || 'Unknown'}</p>
                            </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                            <Button variant="outline" onClick={handleCancelName} className="flex-1" disabled={isUploading}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleNameSubmit} 
                                className="flex-1 bg-green-600 hover:bg-green-700" 
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Document'
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 text-center shadow-xl">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Document Uploaded Successfully!
                        </h3>
                        <p className="text-gray-600 text-sm mb-1">
                            <strong>{documentName}</strong>
                        </p>
                        <p className="text-gray-500 text-xs">
                            Type: {documentType} • Patient: {patient?.name}
                        </p>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-green-600 h-1 rounded-full animate-pulse" style={{width: '100%'}}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Redirecting...</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TakePicture;
