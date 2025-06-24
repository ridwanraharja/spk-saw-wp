import { Request, Response } from "express";
import { JWTService } from "../config/jwt";
import { PasswordUtils } from "../utils/passwordUtils";
import prisma from "../config/database";
import { AuthenticatedRequest } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";

export class AuthController {
  // Register new user
  static register = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { email, name, password } = req.body;

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

      // Hash password
      const hashedPassword = await PasswordUtils.hashPassword(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });

      // Generate tokens
      const tokens = JWTService.generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: JWTService.getRefreshTokenExpiry(),
        },
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          tokens,
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
        userId: user.id,
        email: user.email,
      });

      // Store refresh token
      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: JWTService.getRefreshTokenExpiry(),
        },
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
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
          userId: storedToken.user.id,
          email: storedToken.user.email,
        });

        // Update refresh token
        await prisma.refreshToken.update({
          where: { id: storedToken.id },
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
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
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
            NOT: { id: userId },
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
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(email && { email }),
        },
        select: {
          id: true,
          email: true,
          name: true,
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
}
