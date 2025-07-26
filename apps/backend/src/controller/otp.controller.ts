import { Request, Response } from "express";
import { getOTP, storeOTP } from "../utils/storeOtp";
import twilio from 'twilio'

export const sendOTP = async (req: Request, res: Response) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    storeOTP(phone, otp)


    const accountSid = process.env.SID;
    const authToken = process.env.AUTH_TOKEN;
    const client = twilio(accountSid, authToken);

    client.verify.v2.services(process.env.twillio_key)
        .verifications
        .create({ to: '+919049606217', channel: 'sms' })
        .then((verification: any) => console.log(verification.sid));

    res.status(200).json({ message: "OTP sent successfully" });
}
export const verifyOTP = async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    const storedOTP = getOTP(phone)
    if (!storedOTP) {
        res.status(400).json({ message: "Invalid OTP" })
    }
    if (storedOTP !== otp) {
        res.status(400).json({ message: "Invalid OTP" })
    }
    res.status(200).json({ message: "OTP verified successfully" })
}
