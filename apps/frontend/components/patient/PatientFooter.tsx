"use client"
import { Camera, Home, Plus, Upload, UserCircle, X, FileText, Pill, Minus } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import gsap from 'gsap'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import Select from '../ui/select'
import Input from '../ui/input'
import AutocompleteInput from '../ui/AutocompleteInput'
import { useHandleCapture } from '@/hooks/useHandleCapture'

const PatientFooter = ({ activeTab, setActiveTab, onCapture }: { activeTab: string, setActiveTab: (tab: string) => void, onCapture: (file: File, dataUrl: string, type: string) => void }) => {
    const router = useRouter();
    const [documentType, setDocumentType] = useState<string>("");
    const [selectDocumentType, setSelectDocumentType] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [medicineName, setMedicineName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [dosage, setDosage] = useState({ morning: "", afternoon: "", night: "" });
    const [beforeAfterFood, setBeforeAfterFood] = useState<"before" | "after" | "">("");

    async function blobToBase64(blob: Blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result?.toString().split(','); // Extract Base64 part
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    const handleSelectDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFile(file);
        if (!documentType) {
            setSelectDocumentType(true);
            return;
        }
        const reader = new FileReader();
        reader.onload = async () => {
            console.log(reader.readAsDataURL)
            console.log(file)
            onCapture(file, reader.result?.toString().split(',')[1] as string, documentType);
        };
        reader.readAsDataURL(file);
    };


    const handleCapture = async (file: File, dataUrl: string, type: string) => {
        const response = await useHandleCapture(file, dataUrl, type)
    }

    const handleUploadPhoto = () => {
        // setActiveTab('upload')
        router.push('/dashboard/patient/upload')
        handleCloseUpload();
    };
    const handleUploadDoc = () => {
        gsap.to('#upload-background', {
            opacity: 0.5,
            duration: 0.3,
            display: 'block',
            ease: 'power2.inOut'
        })
        gsap.to('#upload-modal', {
            bottom: '0',
            duration: 0.3,
            ease: 'power2.inOut'
        })
    }
    const handleCloseUpload = () => {
        gsap.to('#upload-background', {
            opacity: 0,
            duration: 0.1,
            display: 'none',
            ease: 'power2.inOut'
        })
        gsap.to('#upload-modal', {
            bottom: '-100%',
            duration: 0.1,
            ease: 'power2.inOut'
        })
    }

    const handleSelectTypeAndConfirm = async (type: "lab" | "prescription" | "diagnosis" | "visit") => {
        setDocumentType(type);
        setSelectDocumentType(false);
        if (file) {
            const base64 = await blobToBase64(file)
            onCapture(file, (base64 as string[])[0] + ',' + (base64 as string[])[1] as string, type);
        }
        handleCloseUpload();
        setFile(null);
    }

    const handleAddPrescription = () => {
        setShowPrescriptionForm(true);
    }

    const handleClosePrescriptionForm = () => {
        setShowPrescriptionForm(false);
        setMedicineName("");
        setQuantity(1);
        setDosage({ morning: "", afternoon: "", night: "" });
        setBeforeAfterFood("");
    }

    const handleSavePrescription = () => {
        // TODO: Implement prescription save logic
        console.log("Saving prescription:", { medicineName, quantity, dosage, beforeAfterFood });
        handleClosePrescriptionForm();
        handleCloseUpload();
    }

    const adjustQuantity = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    }
    return (
        <>
            {/* Document Type Selection Dialog */}
            {selectDocumentType && (
                <Dialog open={selectDocumentType} onOpenChange={(open) => setSelectDocumentType(open)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold text-gray-900">Select Document Type</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <Select
                                options={[
                                    { label: "None", value: "" },
                                    { label: "Lab Test", value: "lab" },
                                    { label: "Prescription", value: "prescription" },
                                    { label: "Diagnosis", value: "diagnosis" },
                                    { label: "Visit", value: "visit" },
                                ]}
                                onChange={(e) => setDocumentType(e.target.value as "lab" | "prescription" | "diagnosis" | "visit")}
                            />
                            <Button
                                onClick={() => handleSelectTypeAndConfirm(documentType as "lab" | "prescription" | "diagnosis" | "visit")}
                                disabled={!documentType}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Submit
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Upload Modal Background */}
            <div
                className='fixed w-full top-0 left-0 h-screen bg-black/40 backdrop-blur-sm -z-50 opacity-0 hidden transition-opacity duration-300'
                id='upload-background'
                onClick={handleCloseUpload}
            />

            {/* Upload Modal */}
            <div className='fixed w-full -bottom-full left-0 bg-white z-50 rounded-t-3xl shadow-2xl transition-all duration-300' id='upload-modal'>
                <div className="relative">
                    {/* Handle bar */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full" />

                    {/* Close button */}
                    <button
                        onClick={() => {
                            handleCloseUpload();
                            handleClosePrescriptionForm();
                        }}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>

                    {/* Content */}
                    {!showPrescriptionForm ? (
                        <div className='flex flex-col items-center justify-center min-h-[280px] gap-3 p-6 pt-12'>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New</h3>
                            <div className="w-full max-w-sm space-y-3">
                                <Button
                                    variant="default"
                                    className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all'
                                    onClick={handleAddPrescription}
                                >
                                    <Pill className="w-5 h-5 mr-2" />
                                    Add Prescription
                                </Button>
                                <input type="file" className='hidden' id='document-input' onChange={handleSelectDocument} accept="image/*,.pdf" />
                                <Button
                                    variant="outline"
                                    className='w-full border-2 border-blue-500 text-blue-600 hover:bg-blue-50 h-14 text-base font-semibold'
                                    onClick={() => document.getElementById('document-input')?.click()}
                                >
                                    <Upload className="w-5 h-5 mr-2" />
                                    Upload Document
                                </Button>
                                <Button
                                    variant="outline"
                                    className='w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50 h-14 text-base font-semibold'
                                    onClick={handleUploadPhoto}
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    Take Photo
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col min-h-[400px] gap-4 p-6 pt-12 overflow-y-auto max-h-[80vh]'>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Pill className="w-6 h-6 text-emerald-600" />
                                Add Prescription
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Medicine Name *</label>
                                    <AutocompleteInput
                                        value={medicineName}
                                        onChange={setMedicineName}
                                        onSelect={setMedicineName}
                                        placeholder="Enter medicine name"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => adjustQuantity(-1)}
                                            className="w-10 h-10 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 text-center">
                                            <span className="text-2xl font-bold text-gray-900">{quantity}</span>
                                            <span className="text-sm text-gray-500 ml-2">tablets</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => adjustQuantity(1)}
                                            className="w-10 h-10 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dosage Schedule</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Morning</label>
                                            <Input
                                                type="text"
                                                value={dosage.morning}
                                                onChange={(e) => setDosage(prev => ({ ...prev, morning: e.target.value }))}
                                                placeholder="e.g., 1"
                                                className="text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Afternoon</label>
                                            <Input
                                                type="text"
                                                value={dosage.afternoon}
                                                onChange={(e) => setDosage(prev => ({ ...prev, afternoon: e.target.value }))}
                                                placeholder="e.g., 1"
                                                className="text-center"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Night</label>
                                            <Input
                                                type="text"
                                                value={dosage.night}
                                                onChange={(e) => setDosage(prev => ({ ...prev, night: e.target.value }))}
                                                placeholder="e.g., 1"
                                                className="text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Take Medicine</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setBeforeAfterFood("before")}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${beforeAfterFood === "before"
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                }`}
                                        >
                                            Before Food
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setBeforeAfterFood("after")}
                                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${beforeAfterFood === "after"
                                                ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold"
                                                : "border-gray-200 text-gray-600 hover:border-gray-300"
                                                }`}
                                        >
                                            After Food
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleClosePrescriptionForm}
                                        className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 h-12 font-semibold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSavePrescription}
                                        disabled={!medicineName.trim()}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white h-12 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Save Prescription
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-lg z-40">
                <div className="relative flex justify-around items-center px-1 py-2 max-w-2xl mx-auto h-16">
                    {/* Home Tab */}
                    <button
                        onClick={() => { router.push('/dashboard/patient'); setActiveTab('home') }}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-200 ${activeTab === 'home'
                            ? 'bg-blue-50 text-blue-600 scale-105'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Home className={`w-5 h-5 mb-0.5 ${activeTab === 'home' ? 'scale-110' : ''} transition-transform`} />
                        <span className="text-[10px] font-medium">Home</span>
                    </button>

                    {/* Prescription Tab */}
                    <button
                        onClick={() => { router.push('/dashboard/patient'); setActiveTab('prescriptions') }}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-200 ${activeTab === 'prescriptions'
                            ? 'bg-purple-50 text-purple-600 scale-105'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <Pill className={`w-5 h-5 mb-0.5 ${activeTab === 'prescriptions' ? 'scale-110' : ''} transition-transform`} />
                        <span className="text-[10px] font-medium">Prescriptions</span>
                    </button>

                    {/* Upload/Add Tab - Center Button (Overflowing) */}
                    <button
                        onClick={handleUploadDoc}
                        className="flex flex-col items-center justify-center flex-1 -mt-8 transition-all duration-200"
                    >
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl border-4 border-white ${activeTab === 'upload'
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white scale-110 shadow-emerald-300'
                            : 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-600 hover:scale-105'
                            }`}>
                            <Plus className="w-7 h-7" strokeWidth={2.5} />
                        </div>
                        <span className={`text-[10px] font-medium mt-1 ${activeTab === 'upload' ? 'text-emerald-600' : 'text-gray-500'}`}>Add</span>
                    </button>

                    {/* Account Tab */}
                    <button
                        onClick={() => { router.push('/dashboard/patient/account'); setActiveTab('account') }}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-200 ${activeTab === 'account'
                            ? 'bg-blue-50 text-blue-600 scale-105'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <UserCircle className={`w-5 h-5 mb-0.5 ${activeTab === 'account' ? 'scale-110' : ''} transition-transform`} />
                        <span className="text-[10px] font-medium">Account</span>
                    </button>

                    {/* Records Tab */}
                    <button
                        onClick={() => { router.push('/dashboard/patient/records'); setActiveTab('records') }}
                        className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all duration-200 ${activeTab === 'records'
                            ? 'bg-blue-50 text-blue-600 scale-105'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <FileText className={`w-5 h-5 mb-0.5 ${activeTab === 'records' ? 'scale-110' : ''} transition-transform`} />
                        <span className="text-[10px] font-medium">Records</span>
                    </button>
                </div>
            </div>
        </>
    )
}
export default PatientFooter;