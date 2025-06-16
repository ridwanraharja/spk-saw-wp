import express, { Express, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import sequelize from "./config/database";

dotenv.config();

const app: Express = express();
const port: number = parseInt(process.env.PORT || "3000", 10);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test database connection
async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

testConnection();

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to SPK SAW WP API" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
