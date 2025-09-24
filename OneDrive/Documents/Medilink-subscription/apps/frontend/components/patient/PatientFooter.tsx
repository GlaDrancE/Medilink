import { Camera, Home, Pill, Plus, Upload, UserCircle, X } from 'lucide-react'
import React from 'react'
import { Button } from '../ui/button'
import gsap from 'gsap'

const PatientFooter = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
    const handleSelectDocument = () => {
    };
    const handleUploadPhoto = () => {
        setActiveTab('upload')
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
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
            <div className=''>
                <div className='fixed w-full top-0 left-0 h-screen bg-gray-400 -z-50 opacity-0 hidden' id='upload-background' onClick={handleCloseUpload} onFocus={handleCloseUpload} onKeyDown={handleCloseUpload} onMouseDown={handleCloseUpload}>
                </div>
                <div className='fixed w-full -bottom-full left-0 h-1/4 bg-white z-10' id='upload-modal'>
                    <header className='flex items-center justify-end p-4 border-b border-gray-200 absolute top-0 right-0'>
                        <X className="w-6 h-6 mb-1" onClick={handleCloseUpload} />
                    </header>
                    <div className='flex flex-col items-center justify-center h-full gap-2 p-4'>
                        <Button variant="default" className='w-full' onClick={handleSelectDocument}>
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
                    onClick={() => setActiveTab('home')}
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
                    <div className="flex flex-col items-center rounded-full bg-blue-600 text-white p-2">
                        <Plus className="w-6 h-6" />
                    </div>
                </Button>

                <Button
                    variant={activeTab === 'account' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('account')}
                    className="flex-1 mx-1"
                >
                    <div className="flex flex-col items-center">
                        <UserCircle className="w-6 h-6 mb-1" />
                    </div>
                </Button>
            </div>
        </div>
    )
}
export default PatientFooter;