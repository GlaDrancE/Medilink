const otpMap = new Map();
export const storeOTP = async (phone: string, otp: number) => {
    otpMap.set(phone, { otp: otp, expiresAt: Date.now() + 10 * 60 * 1000 });
}
export const getOTP = async (phone: string) => {
    const otp = otpMap.get(phone)?.otp
    if (!otp) {
        return null
    }
    if (otp.expiresAt < Date.now()) {
        otpMap.delete(phone)
        return null
    }
    return otp.otp
}