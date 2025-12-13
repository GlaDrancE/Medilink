'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  MapPin, 
  Phone, 
  FileText, 
  Calendar, 
  Stethoscope, 
  GraduationCap, 
  DollarSign,
  Edit,
  Save,
  X,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/context/auth';

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  hospital: string; // Clinic Name
  address: string; // Clinic Address
  license_number: string; // Medical Registration Number
  experience: number; // Years of Experience
  consultation_type: string; // Consultation Type
  specialization: string; // Specialization(s)
  qualifications: string; // Qualifications
  consultation_fees: number; // Consultation Fees
  bio: string; // Short Bio
}

export default function DoctorSettings() {
  const { doctor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<DoctorProfile>({
    id: '',
    name: '',
    email: '',
    phone: '',
    hospital: '',
    address: '',
    license_number: '',
    experience: 0,
    consultation_type: '',
    specialization: '',
    qualifications: '',
    consultation_fees: 0,
    bio: ''
  });

  // Load doctor profile on component mount
  useEffect(() => {
    loadDoctorProfile();
  }, []);

  const loadDoctorProfile = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3002/api/v1/doctor', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        console.error('Failed to load doctor profile');
      }
    } catch (error) {
      console.error('Error loading doctor profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3002/api/v1/doctor/${profile.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clinic_name: profile.hospital,
          clinic_address: profile.address,
          clinic_phone_number: profile.phone,
          license_number: profile.license_number,
          years_of_experience: profile.experience,
          consultation_type: profile.consultation_type,
          specialization: profile.specialization,
          qualifications: profile.qualifications,
          consultation_fees: profile.consultation_fees,
          bio: profile.bio
        })
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile(updatedData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadDoctorProfile(); // Reload original data
  };

  const handleInputChange = (field: keyof DoctorProfile, value: string | number) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your profile and clinic information</p>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </Button>
            <Button 
              onClick={handleCancel} 
              variant="outline"
              className="flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
          </div>
        )}
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription>
            Your basic profile information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={!isEditing}
                placeholder="Dr. John Doe"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled={true} // Email should not be editable
                placeholder="doctor@example.com"
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditing}
                placeholder="+91 9876543210"
              />
            </div>

            {/* Medical Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="license_number">Medical Registration Number</Label>
              <Input
                id="license_number"
                value={profile.license_number}
                onChange={(e) => handleInputChange('license_number', e.target.value)}
                disabled={!isEditing}
                placeholder="MED123456"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Clinic Information</span>
          </CardTitle>
          <CardDescription>
            Details about your clinic and practice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clinic Name */}
            <div className="space-y-2">
              <Label htmlFor="hospital">Clinic Name</Label>
              <Input
                id="hospital"
                value={profile.hospital}
                onChange={(e) => handleInputChange('hospital', e.target.value)}
                disabled={!isEditing}
                placeholder="City Medical Center"
              />
            </div>

            {/* Years of Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                value={profile.experience}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                placeholder="10"
                min="0"
                max="50"
              />
            </div>
          </div>

          {/* Clinic Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Clinic Address</Label>
            <Textarea
              id="address"
              value={profile.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              disabled={!isEditing}
              placeholder="123 Medical Street, City, State, PIN"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Professional Information</span>
          </CardTitle>
          <CardDescription>
            Your medical qualifications and specializations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consultation Type */}
            <div className="space-y-2">
              <Label htmlFor="consultation_type">Consultation Type</Label>
              {isEditing ? (
                <Select
                  value={profile.consultation_type}
                  onValueChange={(value) => handleInputChange('consultation_type', value)}
                >
                  <SelectValue placeholder="Select consultation type" />
                  <SelectItem value="Online">Online</SelectItem>
                  <SelectItem value="In-person">In-person</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </Select>
              ) : (
                <div className="p-3 border rounded-md bg-gray-50">
                  <Badge variant="secondary">{profile.consultation_type || 'Not specified'}</Badge>
                </div>
              )}
            </div>

            {/* Consultation Fees */}
            <div className="space-y-2">
              <Label htmlFor="consultation_fees">Consultation Fees (Optional)</Label>
              <Input
                id="consultation_fees"
                type="number"
                value={profile.consultation_fees}
                onChange={(e) => handleInputChange('consultation_fees', parseInt(e.target.value) || 0)}
                disabled={!isEditing}
                placeholder="500"
                min="0"
              />
              <p className="text-xs text-gray-500">Amount in ₹ (Indian Rupees)</p>
            </div>
          </div>

          {/* Specialization */}
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization(s)</Label>
            <Input
              id="specialization"
              value={profile.specialization}
              onChange={(e) => handleInputChange('specialization', e.target.value)}
              disabled={!isEditing}
              placeholder="General Medicine, Cardiology"
            />
            <p className="text-xs text-gray-500">Separate multiple specializations with commas</p>
          </div>

          {/* Qualifications */}
          <div className="space-y-2">
            <Label htmlFor="qualifications">Qualifications</Label>
            <Input
              id="qualifications"
              value={profile.qualifications}
              onChange={(e) => handleInputChange('qualifications', e.target.value)}
              disabled={!isEditing}
              placeholder="MBBS, MD, FRCS"
            />
            <p className="text-xs text-gray-500">Separate multiple qualifications with commas</p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Brief description about yourself and your practice..."
              rows={4}
            />
            <p className="text-xs text-gray-500">This will be visible to patients</p>
          </div>
        </CardContent>
      </Card>

      {/* Success Message */}
      {!isEditing && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Profile is up to date</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Your profile information is saved and will be visible to patients when they book appointments.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}