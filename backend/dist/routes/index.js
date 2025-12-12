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
function setupRoutes(app) {
    app.use("/api/auth", auth_1.default);
    app.use("/api/vehicles", vehicles_1.default);
    app.use("/api/drivers", drivers_1.default);
    app.use("/api/maintenance", maintenance_1.default);
    app.use("/api/questionnaire", questionnaire_1.default);
    app.use("/api/reports", reports_1.default);
}
