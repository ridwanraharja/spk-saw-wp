import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SPK SAW WP API",
      version: "1.0.0",
      description:
        "API for Decision Support System (SPK) using SAW and WP methods with JWT authentication",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://your-domain.com/api"
            : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            email: {
              type: "string",
              format: "email",
            },
            name: {
              type: "string",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        SPKRecord: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            title: {
              type: "string",
            },
            userId: {
              type: "string",
              format: "uuid",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
            criteria: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Criterion",
              },
            },
            alternatives: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Alternative",
              },
            },
          },
        },
        Criterion: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
            weight: {
              type: "number",
              minimum: 0,
              maximum: 1,
            },
            type: {
              type: "string",
              enum: ["benefit", "cost"],
            },
          },
        },
        Alternative: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
            values: {
              type: "object",
              additionalProperties: {
                type: "number",
              },
            },
          },
        },
        TokenPair: {
          type: "object",
          properties: {
            accessToken: {
              type: "string",
            },
            refreshToken: {
              type: "string",
            },
          },
        },
        ApiResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
            },
            message: {
              type: "string",
            },
            data: {
              type: "object",
            },
            errors: {
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/routes/*.ts", // Path to the API routes
    "./src/controllers/*.ts", // Path to the controllers
  ],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "SPK SAW WP API Documentation",
    })
  );

  // Serve the swagger.json file
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};

export default specs;
