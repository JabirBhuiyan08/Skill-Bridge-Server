import { auth as betterAuth } from "../lib/auth";
import { NextFunction, Request, Response } from "express";

export enum UserRole {
    STUDENT = "STUDENT",
    ADMIN = "ADMIN",
    TUTOR = "TUTOR"
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                emailVerified: boolean;
            }
        }
    }
}

// Strict authentication middleware - REQUIRES valid session
const auth = (...roles: UserRole[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Get user session
            const session = await betterAuth.api.getSession({
                headers: req.headers as any
            });
            
            if (!session) {
                return res.status(401).json({
                    success: false,
                    message: "You are not authorized!"
                });
            }

            req.user = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                role: (session.user as any).role || "STUDENT",
                emailVerified: session.user.emailVerified
            };

            if (roles.length && !roles.includes(req.user.role as UserRole)) {
                return res.status(403).json({
                    success: false,
                    message: "Forbidden! You don't have permission to access this resource"
                });
            }
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "You are not authorized!"
            });
        }
    }
}

// Optional authentication middleware - auth is OPTIONAL
// Use this when you want to allow both authenticated and unauthenticated requests
export const optionalAuth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const session = await betterAuth.api.getSession({
                headers: req.headers as any
            });
            
            // If session exists, attach user to request
            if (session) {
                req.user = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.name,
                    role: (session.user as any).role || "STUDENT",
                    emailVerified: session.user.emailVerified
                };
            }
            // If no session, req.user remains undefined but we continue
            
            next();
        } catch (error) {
            // Silently continue - auth is optional
            next();
        }
    };
};

export default auth;