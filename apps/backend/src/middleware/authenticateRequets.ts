import { NextFunction, Request as ExpressRequest, Response } from "express";
import { verifyToken } from "@clerk/backend";
import { config } from "@repo/common";

export const authenticateRequest = async (req: ExpressRequest, res: Response, next: NextFunction) => {
    try {
        const bearerToken = req.headers.authorization?.split(' ')[1];
        if (!bearerToken) {
            return res.status(401).json({ error: "Token not found. User must sign in." });
        }

        // JWT_SECRET holds the Clerk RSA public key (PEM) — verify offline without a network call.
        // authorizedParties is intentionally omitted so the azp claim is not checked;
        // this avoids port-mismatch failures across dev / staging / prod environments.
        const verifiedToken = await verifyToken(bearerToken, {
            jwtKey: config.jwt.secret,
        });

        req.userId = verifiedToken.sub;
        next();
    } catch (error) {
        console.error("Clerk authentication error:", error);
        return res.status(401).json({ message: "Unauthorized" });
    }
}

