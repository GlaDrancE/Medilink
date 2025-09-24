import { Patient } from '@/types'
import { User } from 'lucide-react'
import React from 'react'


const PatientHeader = ({ patient }: { patient: Patient }) => {
    return (
        <>
            <div className="bg-white shadow-sm p-4 sticky top-0 z-10" >
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-lg font-semibold text-gray-800">Welcome, {patient.name}</h1>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-600">
                            <span>Age: {patient.age}</span>
                            <span>Weight: {patient.weight}kg</span>
                            <span>Phone: {patient.phone}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default PatientHeader;