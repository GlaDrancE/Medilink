import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

// Extend Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email?: string;
        role?: string;
      };
      userId?: string;
      role?: string;
    }
  }
}

export const clerkAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }

    // For development/testing, we'll decode the JWT without verification
    // In production, you would verify with Clerk's public key
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.sub) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }

    // Set user info on request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: 'DOCTOR' // Default role for now
    };
    
    req.userId = decoded.sub;
    req.role = 'DOCTOR';

    console.log('Authenticated user:', req.user.id);
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Authentication failed' 
    });
  }
};