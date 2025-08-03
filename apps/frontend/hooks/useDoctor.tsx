import { getDoctorById } from '@/services/api.routes';
import React, { useEffect, useState } from 'react'

export const useDoctor = () => {
    const [doctor, setDoctor] = useState<any>();
    useEffect(() => {
        (async () => {
            try {
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