import { NextFunction, Request, Response } from "express";
import jwt, { decode } from "jsonwebtoken";
import { config } from "@repo/common";
import { verifyToken } from "../utils/jwt";

const PATIENT_JWT_SECRET: jwt.Secret = process.env.PATIENT_JWT || "random";
console.log(PATIENT_JWT_SECRET)
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        console.log(token)
        const decoded = jwt.verify(token, PATIENT_JWT_SECRET) as { id: string };
        console.log(decoded)
        req.userId = decoded.id;
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: 'Unauthorized' });
    }
}