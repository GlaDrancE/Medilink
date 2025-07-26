import { NextFunction, Request, Response } from "express";
import jwt, { decode } from "jsonwebtoken";
import { config } from "@repo/common";
import { verifyToken } from "../utils/jwt";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {

        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = verifyToken(token) as { id: string, role: string, sub: string }
        console.log(decoded)
        if (decoded.sub) {
            req.userId = decoded.sub
        }
        else {
            req.userId = decoded.id;
            req.role = decoded.role;
        }
        next();
    } catch (error) {
        console.log(error)
        return res.status(401).json({ message: 'Unauthorized' });
    }
}