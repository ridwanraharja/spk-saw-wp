import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import prisma from "./config/database";
import { setupSwagger } from "./config/swagger";

import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";

import authRoutes from "./routes/authRoutes";
import spkRoutes from "./routes/spkRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import subCriteriaRoutes from "./routes/subCriteriaRoutes";
import templateRoutes from "./routes/templateRoutes";
import { createFirstAdmin } from "./utils/createAdmin";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const apiPrefix = process.env.API_PREFIX || "/api";

const corsOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://your-frontend-domain.com"]
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:3001",
        "http://localhost:8080",
      ];

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to SPK SAW WP API",
    version: "1.0.0",
    documentation: `${req.protocol}://${req.get("host")}/api-docs`,
    endpoints: {
      auth: `${req.protocol}://${req.get("host")}${apiPrefix}/auth`,
      spk: `${req.protocol}://${req.get("host")}${apiPrefix}/spk`,
      dashboard: `${req.protocol}://${req.get("host")}${apiPrefix}/dashboard`,
      subCriteria: `${req.protocol}://${req.get(
        "host"
      )}${apiPrefix}/sub-criteria`,
      templates: `${req.protocol}://${req.get("host")}${apiPrefix}/templates`,
    },
  });
});

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/spk`, spkRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/sub-criteria`, subCriteriaRoutes);
app.use(`${apiPrefix}/templates`, templateRoutes);

setupSwagger(app);

app.use(notFoundHandler);

app.use(errorHandler);

const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");

    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database query test successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

const gracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

const startServer = async () => {
  try {
    await connectDatabase();

    // Create first admin user if not exists
    await createFirstAdmin();

    const server = app.listen(port, () => {
      console.log("\n🚀 Server is running!");
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📍 Port: ${port}`);
      console.log(`📍 API Base URL: http://localhost:${port}${apiPrefix}`);
      console.log(`📍 API Documentation: http://localhost:${port}/api-docs`);
      console.log(`📍 Health Check: http://localhost:${port}/health`);
      console.log("\n📋 Available Endpoints:");
      console.log(`   • POST ${apiPrefix}/auth/login - Login user`);
      console.log(`   • POST ${apiPrefix}/auth/refresh - Refresh token`);
      console.log(`   • POST ${apiPrefix}/auth/logout - Logout user`);
      console.log(`   • GET  ${apiPrefix}/auth/profile - Get user profile`);
      console.log(`   • PUT  ${apiPrefix}/auth/profile - Update user profile`);
      console.log(`   • GET  ${apiPrefix}/auth/roles - Get available roles`);
      console.log(
        `   • GET  ${apiPrefix}/auth/roles/public - Get available roles (public)`
      );
      console.log(
        `   • POST ${apiPrefix}/auth/admin/users - Create new user (admin)`
      );
      console.log(
        `   • GET  ${apiPrefix}/auth/admin/users - Get all users (admin)`
      );
      console.log(
        `   • PUT  ${apiPrefix}/auth/admin/users/:id/role - Update user role (admin)`
      );
      console.log(
        `   • DELETE ${apiPrefix}/auth/admin/users/:id - Delete user (admin)`
      );
      console.log(`   • POST ${apiPrefix}/spk - Create SPK record`);
      console.log(`   • GET  ${apiPrefix}/spk - Get all SPK records`);
      console.log(`   • GET  ${apiPrefix}/spk/:id - Get SPK record by ID`);
      console.log(
        `   • GET  ${apiPrefix}/spk/admin/all - Get all SPK records (admin)`
      );
      console.log(`   • PUT  ${apiPrefix}/spk/:id - Update SPK record`);
      console.log(`   • DELETE ${apiPrefix}/spk/:id - Delete SPK record`);
      console.log(
        `   • GET  ${apiPrefix}/dashboard/stats - Get dashboard stats`
      );
      console.log("\n🔐 Authentication: Bearer <JWT_TOKEN>");
      console.log("📖 Full API documentation available at /api-docs\n");
    });

    server.on("error", (error) => {
      if ((error as any).code === "EADDRINUSE") {
        console.error(`❌ Port ${port} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
