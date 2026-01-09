import { NextFunction, Request as ExpressRequest, Response } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";

export const authenticateRequest = async (req: ExpressRequest, res: Response, next: NextFunction) => {
    try {
        const bearerToken = req.headers.authorization?.split(' ')[1];
        if (!bearerToken) {
            return res.status(401).json({ error: "Token not found. User must sign in." });
        }

        const verifiedToken = await verifyToken(bearerToken, {
            jwtKey: process.env.JWT_SECRET,
            authorizedParties: ["http://localhost:3001", "api.example.com"], // Replace with your authorized parties
        });
        console.log(verifiedToken)
        req.userId = verifiedToken.sub;
        next();
    } catch (error) {
        console.log('Clerk authentication error:', error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

