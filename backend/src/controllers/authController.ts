import { Request, Response } from "express";
import { JWTService } from "../config/jwt";
import { PasswordUtils } from "../utils/passwordUtils";
import prisma from "../config/database";
import { AuthenticatedRequest } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";

export class AuthController {
  // Register new user (admin only)
  static register = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { email, name, password, role = "user" } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      // Validate password strength
      const passwordValidation =
        PasswordUtils.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: "Password does not meet requirements",
          errors: passwordValidation.errors,
        });
        return;
      }

      // Validate role
      if (!["admin", "user"].includes(role)) {
        res.status(400).json({
          success: false,
          message: "Role must be either 'admin' or 'user'",
        });
        return;
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
        },
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          user,
        },
      });
    }
  );

  // Login user
  static login = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Verify password
      const isValidPassword = await PasswordUtils.comparePassword(
        password,
        user.password
      );
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user.userId,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.userId,
          expiresAt: JWTService.getRefreshTokenExpiry(),
        },
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            userId: user.userId,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          },
          tokens,
        },
      });
    }
  );

  // Refresh access token
  static refresh = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
        return;
      }

      // Verify refresh token
      try {
        const decoded = JWTService.verifyRefreshToken(refreshToken);

        // Check if refresh token exists in database
        const storedToken = await prisma.refreshToken.findUnique({
          where: { token: refreshToken },
          include: { user: true },
        });

        if (!storedToken || storedToken.expiresAt < new Date()) {
          res.status(401).json({
            success: false,
            message: "Invalid or expired refresh token",
          });
          return;
        }

        // Generate new tokens
        const tokens = JWTService.generateTokenPair({
          userId: storedToken.user.userId,
          email: storedToken.user.email,
          role: storedToken.user.role,
        });

        // Update refresh token
        await prisma.refreshToken.update({
          where: { refreshTokenId: storedToken.refreshTokenId },
          data: {
            token: tokens.refreshToken,
            expiresAt: JWTService.getRefreshTokenExpiry(),
          },
        });

        res.status(200).json({
          success: true,
          message: "Tokens refreshed successfully",
          data: { tokens },
        });
      } catch (error) {
        res.status(401).json({
          success: false,
          message: "Invalid refresh token",
        });
      }
    }
  );

  // Logout user
  static logout = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { refreshToken } = req.body;

      if (refreshToken) {
        // Remove refresh token from database
        await prisma.refreshToken.deleteMany({
          where: { token: refreshToken },
        });
      }

      res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    }
  );

  // Get user profile
  static getProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;

      const user = await prisma.user.findUnique({
        where: { userId: userId },
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    }
  );

  // Update user profile
  static updateProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const userId = req.user?.userId;
      const { name, email } = req.body;

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            NOT: { userId: userId },
          },
        });

        if (existingUser) {
          res.status(409).json({
            success: false,
            message: "Email is already taken by another user",
          });
          return;
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { userId: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: { user: updatedUser },
      });
    }
  );

  // Admin: Get all users (admin only)
  static getAllUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const users = await prisma.user.findMany({
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      res.status(200).json({
        success: true,
        data: { users },
      });
    }
  );

  // Admin: Update user role (admin only)
  static updateUserRole = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { userId } = req.params;
      const { role } = req.body;

      if (!["admin", "user"].includes(role)) {
        res.status(400).json({
          success: false,
          message: "Role must be either 'admin' or 'user'",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { userId: userId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { userId: userId },
        data: { role },
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: { user: updatedUser },
      });
    }
  );

  // Admin: Delete user (admin only)
  static deleteUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { userId } = req.params;

      const user = await prisma.user.findUnique({
        where: { userId: userId },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      // Prevent admin from deleting themselves
      if (req.user?.userId === userId) {
        res.status(400).json({
          success: false,
          message: "Cannot delete your own account",
        });
        return;
      }

      await prisma.user.delete({
        where: { userId: userId },
      });

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    }
  );

  // Get available roles (for dropdown)
  static getAvailableRoles = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const roles = [
        {
          value: "user",
          label: "User",
          description: "Regular user with limited access",
        },
        {
          value: "admin",
          label: "Administrator",
          description: "Full access to all features",
        },
      ];

      res.status(200).json({
        success: true,
        data: { roles },
      });
    }
  );

  // Get available roles (public - no authentication required)
  static getPublicRoles = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const roles = [
        {
          value: "user",
          label: "User",
          description: "Regular user with limited access",
        },
        {
          value: "admin",
          label: "Administrator",
          description: "Full access to all features",
        },
      ];

      res.status(200).json({
        success: true,
        data: { roles },
      });
    }
  );

  // Admin: Create new user (admin only)
  static createUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { email, name, password, role = "user" } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      // Validate password strength
      const passwordValidation =
        PasswordUtils.validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: "Password does not meet requirements",
          errors: passwordValidation.errors,
        });
        return;
      }

      // Validate role
      if (!["admin", "user"].includes(role)) {
        res.status(400).json({
          success: false,
          message: "Role must be either 'admin' or 'user'",
        });
        return;
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role,
        },
        select: {
          userId: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: {
          user,
        },
      });
    }
  );
}
