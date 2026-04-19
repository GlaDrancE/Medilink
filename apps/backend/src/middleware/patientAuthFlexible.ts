import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { verifyToken } from "@clerk/backend";
import { config } from "@repo/common";

const PATIENT_JWT_SECRET: jwt.Secret = process.env.PATIENT_JWT || "random";

export type AuthKind = "clerk" | "patient_jwt";

export type PatientAuthRequest = Request & { authKind?: AuthKind };

/**
 * Accepts either a Clerk session JWT (Authorization: Bearer) or a legacy
 * patient app JWT from /auth/patient/login. Sets req.userId and req.authKind.
 */
export const authenticatePatientFlexible = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization?.split(" ")[1];
  if (!bearer) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const verified = await verifyToken(bearer, {
      jwtKey: config.jwt.secret,
    });
    (req as PatientAuthRequest).userId = verified.sub;
    (req as PatientAuthRequest).authKind = "clerk";
    return next();
  } catch {
    /* try legacy patient token */
  }

  try {
    const decoded = jwt.verify(bearer, PATIENT_JWT_SECRET) as { id: string };
    (req as PatientAuthRequest).userId = decoded.id;
    (req as PatientAuthRequest).authKind = "patient_jwt";
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
