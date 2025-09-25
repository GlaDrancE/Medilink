import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { User, LogOut, AlertTriangle } from "lucide-react";
import { Label } from "../ui/label";
import Input from "../ui/input";
import { Save, Edit3 } from "lucide-react";
import { useState } from "react";
import { Patient } from "@/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";

const PatientAccount = ({ patient }: { patient: Patient }) => {
    const router = useRouter();
    const { logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState({
        name: patient.name || '-',
        age: patient.age || '-',
        weight: patient.weight.toString() || '-',
        height: patient.height?.toString() || '-',
        phone: patient.phone || '-',
        email: patient.email || '-',
    });

    const handleLogout = () => {
        const confirmed = window.confirm('Are you sure you want to logout from your patient account?');
        if (confirmed) {
            logout();
            router.push('/auth/patient');
        }
    };


    const handleSaveProfile = () => {
        console.log('Saving profile...');
    };

    const calculateBMI = (weight: number, height: number) => {
        if (!weight || !height) return 0;
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        return bmi.toFixed(1) || '-';
    };
    return (
        <div className="space-y-4" >
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Account Details</h2>
                <Button
                    size="sm"
                    variant={isEditing ? "default" : "outline"}
                    onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                >
                    {isEditing ? (
                        <>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                        </>
                    ) : (
                        <>
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                        </>
                    )}
                </Button>
            </div>

            <Card>
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-10 h-10 text-blue-600" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={userDetails.name}
                                onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="age">Age</Label>
                            <Input
                                id="age"
                                value={userDetails.age}
                                onChange={(e) => setUserDetails({ ...userDetails, age: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input
                                id="weight"
                                value={userDetails.weight}
                                onChange={(e) => setUserDetails({ ...userDetails, weight: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input
                                id="height"
                                value={userDetails.height}
                                onChange={(e) => setUserDetails({ ...userDetails, height: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="bmi">BMI</Label>
                            <Input
                                id="bmi"
                                value={calculateBMI(Number(userDetails.weight), Number(userDetails.height))}
                                disabled={true}
                                className="mt-1 bg-gray-100"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={userDetails.phone}
                                onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={userDetails.email}
                                onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                                disabled={!isEditing}
                                className="mt-1"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Security Section */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Security</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                            <div className="flex items-center space-x-3">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <div>
                                    <p className="font-medium text-red-800">Logout from Account</p>
                                    <p className="text-sm text-red-600">Sign out of your patient account</p>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div >
    );
};

export default PatientAccount;