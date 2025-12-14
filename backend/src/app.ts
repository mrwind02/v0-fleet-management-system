import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import { setupRoutes } from "./routes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(helmet())
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://frotaone.vercel.app",
    process.env.CORS_ORIGIN || "*"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}))
app.use(morgan("combined"))
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

setupRoutes(app)

// Swagger/OpenAPI
app.get("/api-docs", (req, res) => {
  const swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "Fleet Management API",
      version: "1.0.0",
      description: "API completa para gerenciamento de frota",
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: "Development server",
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
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/auth/login": {
        post: {
          tags: ["Auth"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
            },
          },
        },
      },
      "/vehicles": {
        get: {
          tags: ["Vehicles"],
          responses: {
            200: {
              description: "List of vehicles",
            },
          },
        },
        post: {
          tags: ["Vehicles"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    plate: { type: "string" },
                    brand: { type: "string" },
                    model: { type: "string" },
                    year: { type: "number" },
                    chassisNumber: { type: "string" },
                  },
                  required: ["plate", "brand", "model", "year", "chassisNumber"],
                },
              },
            },
          },
          responses: {
            201: {
              description: "Vehicle created",
            },
          },
        },
      },
    },
  }

  res.json(swaggerSpec)
})

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
