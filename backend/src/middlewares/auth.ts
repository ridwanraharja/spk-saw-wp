import { Request, Response, NextFunction } from "express";
import { JWTService } from "../config/jwt";
import prisma from "../config/database";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token required",
      });
      return;
    }

    const decoded = JWTService.verifyAccessToken(token);

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: { userId: true, email: true, name: true, role: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.user = {
      userId: user.userId,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      next();
      return;
    }

    const decoded = JWTService.verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      select: { userId: true, email: true, name: true, role: true },
    });

    if (user) {
      req.user = {
        userId: user.userId,
        email: user.email,
        role: user.role,
      };
    }

    next();
  } catch (error) {
    next();
  }
};

// Authorization middleware for admin-only routes
export const requireAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });
    return;
  }

  next();
};

// Authorization middleware for user access (user can access their own data, admin can access all)
export const requireUserAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return;
  }

  // Admin can access everything
  if (req.user.role === "admin") {
    next();
    return;
  }

  next();
};
