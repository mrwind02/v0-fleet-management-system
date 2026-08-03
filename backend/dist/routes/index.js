"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupRoutes = setupRoutes;
const auth_1 = __importDefault(require("./auth"));
const vehicles_1 = __importDefault(require("./vehicles"));
const drivers_1 = __importDefault(require("./drivers"));
const maintenance_1 = __importDefault(require("./maintenance"));
const questionnaire_1 = __importDefault(require("./questionnaire"));
const reports_1 = __importDefault(require("./reports"));
const fuel_1 = __importDefault(require("./fuel"));
const work_orders_1 = __importDefault(require("./work-orders"));
const settings_1 = __importDefault(require("./settings"));
const users_1 = __importDefault(require("./users"));
const fines_1 = __importDefault(require("./fines"));
const documents_1 = __importDefault(require("./documents"));
const dashboard_1 = __importDefault(require("./dashboard"));
const units_1 = __importDefault(require("./units"));
const expenses_1 = __importDefault(require("./expenses"));
const suppliers_1 = __importDefault(require("./suppliers"));
function setupRoutes(app) {
    // Health check for monitoring
    app.get("/api/health", (req, res) => {
        res.json({ status: "OK", timestamp: new Date().toISOString() });
    });
    app.use("/api/auth", auth_1.default);
    app.use("/api/vehicles", vehicles_1.default);
    app.use("/api/drivers", drivers_1.default);
    app.use("/api/maintenance", maintenance_1.default);
    app.use("/api/work-orders", work_orders_1.default);
    app.use("/api/questionnaire", questionnaire_1.default);
    app.use("/api/reports", reports_1.default);
    app.use("/api/fuel", fuel_1.default);
    app.use("/api/settings", settings_1.default);
    app.use("/api/users", users_1.default);
    app.use("/api/fines", fines_1.default);
    app.use("/api/documents", documents_1.default);
    app.use("/api/dashboard", dashboard_1.default);
    app.use("/api/units", units_1.default);
    app.use("/api/expenses", expenses_1.default);
    app.use("/api/suppliers", suppliers_1.default);
}
