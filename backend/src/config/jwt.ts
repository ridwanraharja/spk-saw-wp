import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class JWTService {
  private static accessSecret = process.env.JWT_ACCESS_SECRET!;
  private static refreshSecret = process.env.JWT_REFRESH_SECRET!;
  private static accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
  private static refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

  static generateTokenPair(
    payload: Omit<JWTPayload, "iat" | "exp">
  ): TokenPair {
    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    });

    const refreshToken = jwt.sign(
      { ...payload, jti: uuidv4() },
      this.refreshSecret,
      {
        expiresIn: this.refreshExpiresIn,
      }
    );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.accessSecret) as JWTPayload;
    } catch (error) {
      throw new Error("Invalid access token");
    }
  }

  static verifyRefreshToken(token: string): JWTPayload & { jti: string } {
    try {
      return jwt.verify(token, this.refreshSecret) as JWTPayload & {
        jti: string;
      };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  static getRefreshTokenExpiry(): Date {
    const now = new Date();
    const expiryMs = this.parseExpiresIn(this.refreshExpiresIn);
    return new Date(now.getTime() + expiryMs);
  }

  private static parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) throw new Error("Invalid expires in format");

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      case "d":
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error("Invalid time unit");
    }
  }
}
