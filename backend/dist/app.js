"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = require("./routes");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: ["http://localhost:3000", "http://localhost:3001", process.env.CORS_ORIGIN || "*"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json({ limit: "50mb" }));
app.use(express_1.default.urlencoded({ limit: "50mb", extended: true }));
(0, routes_1.setupRoutes)(app);
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
    };
    res.json(swaggerSpec);
});
// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Endpoint not found" });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
