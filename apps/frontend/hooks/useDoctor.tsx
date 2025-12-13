import { getDoctorById } from '@/services/api.routes';
import { Doctor } from '@/types';
import React, { useEffect, useState } from 'react'

export const useDoctor = () => {
    const [doctor, setDoctor] = useState<Doctor>();
    useEffect(() => {
        (async () => {
            try {
                const response = await getDoctorById();
                console.log(response)
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