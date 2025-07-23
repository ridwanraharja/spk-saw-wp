import prisma from "../config/database";
import { PasswordUtils } from "./passwordUtils";

export const createFirstAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "admin" },
    });

    if (existingAdmin) {
      console.log("✅ Admin user already exists");
      return;
    }

    // Create admin user
    const adminPassword = process.env.ADMIN_PASSWORD || "test";
    const hashedPassword = await PasswordUtils.hashPassword(adminPassword);

    const admin = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || "test@gmail.com",
        name: "System Administrator",
        password: hashedPassword,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("❌ Failed to create admin user:", error);
  }
};
