import jwt from "jsonwebtoken";
import { config } from "@repo/common";
const JWT_SECRET = config.jwt.secret;
const PATIENT_JWT_SECRET = "random";


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
