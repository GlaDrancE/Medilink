import { NextFunction, Request, Response } from "express";
import jwt, { decode } from "jsonwebtoken";
import { config } from "@repo/common";
import { verifyToken } from "../utils/jwt";

const PATIENT_JWT_SECRET: jwt.Secret = process.env.PATIENT_JWT || "random";
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, PATIENT_JWT_SECRET) as { id: string };
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}