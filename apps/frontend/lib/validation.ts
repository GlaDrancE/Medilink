export interface ValidationResult {
    isValid: boolean;
    message: string;
}

export const validatePhoneNumber = (phone: string): ValidationResult => {
    console.log(" validate", phone)
    if (!phone) return { isValid: false, message: 'Phone number is required' };
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');

    // Check if it's empty
    if (!cleanPhone) {
        return {
            isValid: false,
            message: 'Phone number is required'
        };
    }

    // Check length (10 digits for US numbers, allowing international)
    if (cleanPhone.length < 10) {
        return {
            isValid: false,
            message: 'Phone number must be at least 10 digits'
        };
    }

    if (cleanPhone.length > 15) {
        return {
            isValid: false,
            message: 'Phone number must be no more than 15 digits'
        };
    }

    return {
        isValid: true,
        message: 'Valid phone number'
    };
};

export const validateName = (name: string): ValidationResult => {
    if (!name.trim()) {
        return {
            isValid: false,
            message: 'Name is required'
        };
    }

    if (name.trim().length < 2) {
        return {
            isValid: false,
            message: 'Name must be at least 2 characters'
        };
    }

    if (name.trim().length > 50) {
        return {
            isValid: false,
            message: 'Name must be no more than 50 characters'
        };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(name.trim())) {
        return {
            isValid: false,
            message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
        };
    }

    return {
        isValid: true,
        message: 'Valid name'
    };
};

export const validateOTP = (otp: string): ValidationResult => {
    if (!otp) {
        return {
            isValid: false,
            message: 'OTP is required'
        };
    }

    // Remove all non-digit characters
    const cleanOTP = otp.replace(/\D/g, '');

    if (cleanOTP.length !== 6) {
        return {
            isValid: false,
            message: 'OTP must be 6 digits'
        };
    }

    return {
        isValid: true,
        message: 'Valid OTP'
    };
};

export const validateSpecialization = (specialization: string): ValidationResult => {
    if (!specialization.trim()) {
        return {
            isValid: false,
            message: 'Specialization is required for doctors'
        };
    }

    if (specialization.trim().length < 3) {
        return {
            isValid: false,
            message: 'Specialization must be at least 3 characters'
        };
    }

    if (specialization.trim().length > 50) {
        return {
            isValid: false,
            message: 'Specialization must be no more than 50 characters'
        };
    }

    return {
        isValid: true,
        message: 'Valid specialization'
    };
};

export const validateLicenseNumber = (licenseNumber: string): ValidationResult => {
    if (!licenseNumber.trim()) {
        return {
            isValid: false,
            message: 'License number is required for doctors'
        };
    }

    if (licenseNumber.trim().length < 5) {
        return {
            isValid: false,
            message: 'License number must be at least 5 characters'
        };
    }

    if (licenseNumber.trim().length > 20) {
        return {
            isValid: false,
            message: 'License number must be no more than 20 characters'
        };
    }

    // Allow alphanumeric characters
    const licenseRegex = /^[a-zA-Z0-9]+$/;
    if (!licenseRegex.test(licenseNumber.trim())) {
        return {
            isValid: false,
            message: 'License number can only contain letters and numbers'
        };
    }

    return {
        isValid: true,
        message: 'Valid license number'
    };
};

export const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleanPhone = phone;

    // Format US phone numbers as (XXX) XXX-XXXX
    if (cleanPhone.length === 10) {
        return `(${cleanPhone.slice(0, 3)}) ${cleanPhone.slice(3, 6)}-${cleanPhone.slice(6)}`;
    }

    // For international numbers, just add + prefix if not present
    if (cleanPhone.length > 10 && !phone.startsWith('+')) {
        return `+${cleanPhone}`;
    }

    return phone;
};

export const normalizePhoneNumber = (phone: string): string => {
    // Remove all non-digit characters and ensure + prefix for international
    const cleanPhone = phone.replace(/\D/g, '');

    if (cleanPhone.length === 10) {
        // Assume US number, add +1 prefix
        return `+1${cleanPhone}`;
    }

    return `+${cleanPhone}`;
}; 