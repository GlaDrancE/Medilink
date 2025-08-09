import { getDoctorById } from '@/services/api.routes';
import { Doctor } from '@/types';
import React, { useEffect, useState } from 'react'

export const useDoctor = () => {
    const [doctor, setDoctor] = useState<Doctor>();
    useEffect(() => {
        (async () => {
            try {
                console.log("calling use doctor")
                const response = await getDoctorById();
                setDoctor(response.data)
            } catch (error) {
                console.error(error)
            }
        })()
    }, [])
    return {
        doctor
    }
}