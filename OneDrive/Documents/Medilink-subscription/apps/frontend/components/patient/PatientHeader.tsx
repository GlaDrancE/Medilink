import { Patient } from '@/types'
import { User, LogOut } from 'lucide-react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth'
import { Button } from '@/components/ui/button'


const PatientHeader = ({ patient }: { patient: Patient }) => {
    const router = useRouter();
    const { logout } = useAuth();

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            logout();
            router.push('/auth/patient');
        }
    };

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
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </Button>
                </div>
            </div>
        </>
    )
}
export default PatientHeader;