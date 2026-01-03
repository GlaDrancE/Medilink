"use client"
import { Camera, Home, Pill, Plus, Upload, UserCircle, X, FileText } from 'lucide-react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import gsap from 'gsap'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import Select from '../ui/select'

const PatientFooter = ({ activeTab, setActiveTab, onCapture }: { activeTab: string, setActiveTab: (tab: string) => void, onCapture: (file: File, dataUrl: string, type: string) => void }) => {
    const router = useRouter();
    const [documentType, setDocumentType] = useState<string>("");
    const [selectDocumentType, setSelectDocumentType] = useState<boolean>(false);
    const [file, setFile] = useState<File | null>(null);
    const handleSelectDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFile(file);
        if (!documentType) {
            setSelectDocumentType(true);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            onCapture(file, String(reader.result || ""), documentType || "");
        };
        reader.readAsDataURL(file);
    };
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

    const handleSelectTypeAndConfirm = (type: "lab" | "prescription" | "diagnosis" | "visit") => {
        setDocumentType(type);
        setSelectDocumentType(false);
        if (file) {
            onCapture(file, "", type);
        }
        handleCloseUpload();
        setFile(null);
    }
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
            <div className=''>
                {selectDocumentType && (
                    <Dialog open={selectDocumentType} onOpenChange={(open) => setSelectDocumentType(open)}>
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
                                onChange={(e) => setDocumentType(e.target.value as "lab" | "prescription" | "diagnosis" | "visit")}
                            >
                            </Select>
                            <Button onClick={() => handleSelectTypeAndConfirm(documentType as "lab" | "prescription" | "diagnosis" | "visit")} disabled={!documentType}>Submit</Button>
                        </DialogContent>
                    </Dialog>
                )}
                <div className='fixed w-full top-0 left-0 h-screen bg-gray-400 -z-50 opacity-0 hidden' id='upload-background' onClick={handleCloseUpload} onFocus={handleCloseUpload} onKeyDown={handleCloseUpload} onMouseDown={handleCloseUpload}>
                </div>
                <div className='fixed w-full -bottom-full left-0 h-1/4 bg-white z-10' id='upload-modal'>
                    <header className='flex items-center justify-end p-4 border-b border-gray-200 absolute top-0 right-0'>
                        <X className="w-6 h-6 mb-1" onClick={handleCloseUpload} />
                    </header>
                    <div className='flex flex-col items-center justify-center h-full gap-2 p-4'>
                        <input type="file" className='hidden' id='document-input' onChange={handleSelectDocument} />
                        <Button variant="default" className='w-full' onClick={() => document.getElementById('document-input')?.click()}>
                            <Upload className="w-6 h-6 mb-1" />
                            Select Document
                        </Button>
                        <Button variant="outline" className='w-full' onClick={handleUploadPhoto}>
                            <Camera className="w-6 h-6 mb-1" />
                            Upload Photo
                        </Button>
                    </div>

                </div>

            </div>
            <div className="flex justify-around">
                <Button
                    variant={activeTab === 'home' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => { router.push('/dashboard/patient'); setActiveTab('home') }}
                    className="flex-1 mx-1"
                >
                    <div className="flex flex-col items-center">
                        <Home className="w-6 h-6 mb-1" />
                    </div>
                </Button>


                <Button
                    variant={activeTab === 'upload' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={handleUploadDoc}
                    className="flex-1 mx-1"
                >
                    {/* <div className="flex flex-col items-center">
                        <Pill className="w-6 h-6 mb-1" />
                        </div> */}
                    <div className="flex flex-col items-center  p-2">
                        <Plus className="w-6 h-6" />
                    </div>
                </Button>

                <Button
                    variant={activeTab === 'account' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => { router.push('/dashboard/patient/account'); setActiveTab('account') }}
                    className="flex-1 mx-1"
                >
                    <div className="flex flex-col items-center">
                        <UserCircle className="w-6 h-6 mb-1" />
                    </div>
                </Button>
                <Button
                    variant={activeTab === 'records' ? 'default' : 'ghost'}
                    size="sm"
                    className="flex-1 mx-1"
                    onClick={() => { router.push('/dashboard/patient/records'); setActiveTab('records') }}
                >
                    <div className="flex flex-col items-center">
                        <FileText className="w-6 h-6 mb-1" />
                    </div>
                </Button>
            </div>
        </div>
    )
}
export default PatientFooter;