import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { User, Scale, Ruler, Phone, Mail, Calendar, Activity, TrendingUp } from "lucide-react";
import { Label } from "../ui/label";
import Input from "../ui/input";
import { Save, Edit3, X } from "lucide-react";
import { useState } from "react";
import { Patient } from "@/types";

const PatientAccount = ({ patient }: { patient: Patient }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [userDetails, setUserDetails] = useState({
        name: patient.name || '-',
        age: patient.age || '-',
        weight: patient.weight.toString() || '-',
        height: patient.height?.toString() || '-',
        phone: patient.phone || '-',
        email: patient.email || '-',
    });


    const handleSaveProfile = () => {
        console.log('Saving profile...');
        setIsEditing(false);
    };

    const handleCancel = () => {
        setUserDetails({
            name: patient.name || '-',
            age: patient.age || '-',
            weight: patient.weight.toString() || '-',
            height: patient.height?.toString() || '-',
            phone: patient.phone || '-',
            email: patient.email || '-',
        });
        setIsEditing(false);
    };

    const calculateBMI = (weight: number, height: number) => {
        if (!weight || !height) return { value: 0, status: 'Unknown', color: 'gray' };
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        const bmiValue = parseFloat(bmi.toFixed(1));

        let status = 'Normal';
        let color = 'emerald';

        if (bmiValue < 18.5) {
            status = 'Underweight';
            color = 'blue';
        } else if (bmiValue >= 18.5 && bmiValue < 25) {
            status = 'Normal';
            color = 'emerald';
        } else if (bmiValue >= 25 && bmiValue < 30) {
            status = 'Overweight';
            color = 'amber';
        } else {
            status = 'Obese';
            color = 'red';
        }

        return { value: bmiValue, status, color };
    };

    const bmi = calculateBMI(Number(userDetails.weight), Number(userDetails.height));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 pb-20"  >
            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
                    </div>
                    {!isEditing ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                className="border-gray-300"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSaveProfile}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    )}
                </div>

                {/* Profile Card */}
                <Card className="mb-4 shadow-lg border-0">
                    <CardContent className="p-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                            <div className="relative">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                                    <User className="w-12 h-12 text-white" strokeWidth={2} />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                                    <span className="text-xs font-bold text-white">✓</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">{userDetails.name}</h3>
                                <p className="text-sm text-gray-500 mt-1">Patient ID: {patient.id?.slice(0, 8)}...</p>
                                <div className="flex gap-2 mt-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        <Activity className="w-3 h-3 mr-1" />
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    value={userDetails.name}
                                    onChange={(e) => setUserDetails({ ...userDetails, name: e.target.value })}
                                    disabled={!isEditing}
                                    className={`${!isEditing ? 'bg-gray-50 border-gray-200' : 'border-blue-300 focus:border-blue-500'}`}
                                />
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <Label htmlFor="age" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    Age
                                </Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={userDetails.age}
                                    onChange={(e) => setUserDetails({ ...userDetails, age: e.target.value })}
                                    disabled={!isEditing}
                                    className={`${!isEditing ? 'bg-gray-50 border-gray-200' : 'border-blue-300 focus:border-blue-500'}`}
                                />
                            </div>

                            {/* Weight */}
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Scale className="w-4 h-4 text-gray-500" />
                                    Weight (kg)
                                </Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={userDetails.weight}
                                    onChange={(e) => setUserDetails({ ...userDetails, weight: e.target.value })}
                                    disabled={!isEditing}
                                    className={`${!isEditing ? 'bg-gray-50 border-gray-200' : 'border-blue-300 focus:border-blue-500'}`}
                                />
                            </div>

                            {/* Height */}
                            <div className="space-y-2">
                                <Label htmlFor="height" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Ruler className="w-4 h-4 text-gray-500" />
                                    Height (cm)
                                </Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={userDetails.height}
                                    onChange={(e) => setUserDetails({ ...userDetails, height: e.target.value })}
                                    disabled={!isEditing}
                                    className={`${!isEditing ? 'bg-gray-50 border-gray-200' : 'border-blue-300 focus:border-blue-500'}`}
                                />
                            </div>

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    Phone Number
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={userDetails.phone}
                                    onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
                                    disabled={!isEditing}
                                    className={`${!isEditing ? 'bg-gray-50 border-gray-200' : 'border-blue-300 focus:border-blue-500'}`}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userDetails.email}
                                    onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
                                    disabled={!isEditing}
                                    className={`${!isEditing ? 'bg-gray-50 border-gray-200' : 'border-blue-300 focus:border-blue-500'}`}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* BMI Card */}
                <Card className={`shadow-lg border-l-4 ${bmi.color === 'emerald' ? 'border-l-emerald-500' :
                        bmi.color === 'blue' ? 'border-l-blue-500' :
                            bmi.color === 'amber' ? 'border-l-amber-500' :
                                'border-l-red-500'
                    }`}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className={`w-5 h-5 text-${bmi.color}-600`} />
                                    <h3 className="text-lg font-bold text-gray-900">Body Mass Index (BMI)</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">Your BMI indicates you are in the <span className={`font-semibold text-${bmi.color}-600`}>{bmi.status}</span> range</p>

                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-gray-900">{bmi.value}</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-${bmi.color}-100 text-${bmi.color}-700`}>
                                        {bmi.status}
                                    </span>
                                </div>
                            </div>

                            {/* BMI Scale */}
                            <div className="hidden md:block">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-2 bg-blue-500 rounded"></div>
                                        <span className="text-xs text-gray-600">&lt; 18.5 Underweight</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-2 bg-emerald-500 rounded"></div>
                                        <span className="text-xs text-gray-600">18.5-25 Normal</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-2 bg-amber-500 rounded"></div>
                                        <span className="text-xs text-gray-600">25-30 Overweight</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-12 h-2 bg-red-500 rounded"></div>
                                        <span className="text-xs text-gray-600">&gt; 30 Obese</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PatientAccount;