import dotenv from 'dotenv'
import jwt from "jsonwebtoken";
import path from 'path'

dotenv.config({ path: path.join(__dirname, "../../../../.env") });
console.log(path.join(__dirname, "../../../../.env"))
const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "your-secret-key"; // Use env in production
const PATIENT_JWT_SECRET: jwt.Secret = process.env.PATIENT_JWT || "random"; // Use env in production


export function generateToken(payload: Record<string, any>, type: "patient" | "doctor", expiresIn = "1d") {

    if (type === "doctor") {
        return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
    } else {

        return jwt.sign(payload, PATIENT_JWT_SECRET, { expiresIn } as jwt.SignOptions);

    }
}

export function verifyToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
}
