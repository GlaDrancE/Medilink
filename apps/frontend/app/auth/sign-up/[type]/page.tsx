'use client'

import { useSignUp } from '@clerk/nextjs';
import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'
import { useState } from 'react';

export default function SignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    if (!isLoaded) {
        return <div>Loading...</div>
    }
    const [formData, setFormData] = useState({
        fullName: '',
        emailAddress: '',
        password: '',
        clinicName: '',
        clinicAddress: '',
        clinicPhoneNumber: '',
        medicalRegistrationNumber: '',
        yearsOfExperience: '',
        consultationType: '',
        specialization: '',
        qualifications: '',
        consultationFees: '',
        shortBio: '',
    });
    const handleSubmit = async () => {
        console.log(formData);
        await signUp?.create({
            unsafeMetadata: {
                fullName: formData.fullName,
                clinicName: formData.clinicName,
                clinicAddress: formData.clinicAddress,
                clinicPhoneNumber: formData.clinicPhoneNumber,
                medicalRegistrationNumber: formData.medicalRegistrationNumber,
                yearsOfExperience: formData.yearsOfExperience,
                consultationType: formData.consultationType,
                specialization: formData.specialization,
                qualifications: formData.qualifications,
                consultationFees: formData.consultationFees,
                shortBio: formData.shortBio,
            },
        });
        await setActive({ session: signUp?.createdSessionId });

    };
    return (
        <div className="grid w-full flex-grow items-center bg-zinc-100 px-4 sm:justify-center">
            <SignUp.Root >

                <SignUp.Step
                    name="start"
                    className="w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8"
                >
                    <header className="text-center">
                        <h1 className="mt-4 text-xl font-medium tracking-tight text-zinc-950">
                            Create an account
                        </h1>
                    </header>
                    <Clerk.GlobalError className="block text-sm text-red-400" />
                    <div className="space-y-4">
                        <Clerk.Field name="fullName" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Full Name</Clerk.Label>
                            <Clerk.Input
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                                placeholder="Enter your email"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>
                        <Clerk.Field name="emailAddress" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Email</Clerk.Label>
                            <Clerk.Input
                                type="email"
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>
                        <Clerk.Field name="password" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Password</Clerk.Label>
                            <Clerk.Input
                                type="password"
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>
                    </div>
                    <SignUp.Action
                        submit
                        className="w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70"
                    >
                        Sign Up
                    </SignUp.Action>

                    <p className="text-center text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Clerk.Link
                            navigate="sign-in"
                            className="font-medium text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline"
                        >
                            Sign in
                        </Clerk.Link>
                    </p>
                </SignUp.Step>
                <SignUp.Step
                    name="verifications"
                    className="w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:w-96 sm:px-8"
                >
                    <header className="text-center">
                        <h1 className="mt-4 text-xl font-medium tracking-tight text-zinc-950">
                            Verify email code
                        </h1>
                    </header>
                    <Clerk.GlobalError className="block text-sm text-red-400" />
                    <SignUp.Strategy name="email_code">
                        <Clerk.Field name="code" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Email code</Clerk.Label>
                            <Clerk.Input
                                type="otp"
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>
                        <SignUp.Action
                            submit
                            className="w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70"
                        >
                            Verify
                        </SignUp.Action>
                    </SignUp.Strategy>
                    <p className="text-center text-sm text-zinc-500">
                        Already have an account?{' '}
                        <Clerk.Link
                            navigate="sign-in"
                            className="font-medium text-zinc-950 decoration-zinc-950/20 underline-offset-4 outline-none hover:text-zinc-700 hover:underline focus-visible:underline"
                        >
                            Sign in
                        </Clerk.Link>
                    </p>
                </SignUp.Step>
                <SignUp.Step name="continue" className="w-full space-y-6 rounded-2xl bg-white px-4 py-10 shadow-md ring-1 ring-black/5 sm:px-8">
                    <header className="text-center">
                        <h1 className="mt-4 text-xl font-medium tracking-tight text-zinc-950">
                            Account created
                        </h1>
                    </header>
                    <p className="text-center text-sm text-zinc-500">
                        Before taking patients let's complete your profile.
                    </p>
                    <div className="space-y-4">

                        <Clerk.Field name="username" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Username</Clerk.Label>
                            <Clerk.Input
                                type="text"
                                placeholder="Enter your username"
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>
                        <Clerk.Field name="clinicName" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Clinic Name</Clerk.Label>
                            <Clerk.Input
                                type="text"
                                value={formData.clinicName}
                                onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                                placeholder="Enter your clinic name"
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>

                        <Clerk.Field name="clinicAddress" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Clinic Address</Clerk.Label>
                            <Clerk.Input
                                type="text"
                                value={formData.clinicAddress}
                                onChange={(e) => setFormData({ ...formData, clinicAddress: e.target.value })}
                                placeholder="Enter your clinic address"
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Clerk.Field name="clinicPhoneNumber" className="space-y-2">
                                <Clerk.Label className="text-sm font-medium text-zinc-950">Phone Number</Clerk.Label>
                                <Clerk.Input
                                    type="tel"
                                    placeholder="Enter your clinic phone number"
                                    value={formData.clinicPhoneNumber}
                                    onChange={(e) => setFormData({ ...formData, clinicPhoneNumber: e.target.value })}
                                    className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                                />
                                <Clerk.FieldError className="block text-sm text-red-400" />
                            </Clerk.Field>

                            <Clerk.Field name="medicalRegistrationNumber" className="space-y-2">
                                <Clerk.Label className="text-sm font-medium text-zinc-950">Medical Registration Number</Clerk.Label>
                                <Clerk.Input
                                    type="number"
                                    value={formData.medicalRegistrationNumber}
                                    onChange={(e) => setFormData({ ...formData, medicalRegistrationNumber: e.target.value })}
                                    placeholder="Enter your medical registration number"
                                    required
                                    className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                                />
                                <Clerk.FieldError className="block text-sm text-red-400" />
                            </Clerk.Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Clerk.Field name="yearsOfExperience" className="space-y-2">
                                <Clerk.Label className="text-sm font-medium text-zinc-950">Years of Experience</Clerk.Label>
                                <Clerk.Input
                                    type="number"
                                    value={formData.yearsOfExperience}
                                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                                    placeholder="Enter your total professional experience in years"
                                    required
                                    className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                                />
                                <Clerk.FieldError className="block text-sm text-red-400" />
                            </Clerk.Field>

                            <Clerk.Field name="consultationType" className="space-y-2">
                                <Clerk.Label className="text-sm font-medium text-zinc-950">Consultation Type</Clerk.Label>
                                <select
                                    required
                                    value={formData.consultationType}
                                    onChange={(e) => setFormData({ ...formData, consultationType: e.target.value })}
                                    className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                                >
                                    <option value="">Select consultation type</option>
                                    <option value="online">Online</option>
                                    <option value="in-person">In-person</option>
                                    <option value="both">Both</option>
                                </select>
                                <Clerk.FieldError className="block text-sm text-red-400" />
                            </Clerk.Field>
                        </div>

                        <Clerk.Field name="specialization" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Specialization(s)</Clerk.Label>
                            <Clerk.Input
                                type="text"
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                placeholder="e.g., Dermatologist, Cardiologist"
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>

                        <Clerk.Field name="qualifications" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Qualifications</Clerk.Label>
                            <Clerk.Input
                                type="text"
                                value={formData.qualifications}
                                onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                                placeholder="e.g., MBBS, MD, DNB, etc."
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>

                        <Clerk.Field name="consultationFees" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Consultation Fees (Optional)</Clerk.Label>
                            <Clerk.Input
                                type="text"
                                value={formData.consultationFees}
                                onChange={(e) => setFormData({ ...formData, consultationFees: e.target.value })}
                                placeholder="e.g., Online: $50, In-person: $75"
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>

                        <Clerk.Field name="shortBio" className="space-y-2">
                            <Clerk.Label className="text-sm font-medium text-zinc-950">Short Bio</Clerk.Label>
                            <textarea
                                value={formData.shortBio}
                                onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                                placeholder="Tell patients about yourself and your expertise"
                                required
                                className="w-full rounded-md bg-white px-3.5 py-2 text-sm outline-none ring-1 ring-inset ring-zinc-300 hover:ring-zinc-400 focus:ring-[1.5px] focus:ring-zinc-950 data-[invalid]:ring-red-400"
                                rows={4}
                            />
                            <Clerk.FieldError className="block text-sm text-red-400" />
                        </Clerk.Field>

                    </div>
                    <SignUp.Action
                        submit
                        onClick={handleSubmit}
                        className="w-full rounded-md bg-zinc-950 px-3.5 py-1.5 text-center text-sm font-medium text-white shadow outline-none ring-1 ring-inset ring-zinc-950 hover:bg-zinc-800 focus-visible:outline-[1.5px] focus-visible:outline-offset-2 focus-visible:outline-zinc-950 active:text-white/70"
                    >
                        Create Account
                    </SignUp.Action>
                </SignUp.Step>

            </SignUp.Root>
        </div >
    )
}