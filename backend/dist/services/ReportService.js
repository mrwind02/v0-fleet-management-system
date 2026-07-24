"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const database_1 = require("../config/database");
class ReportService {
    // Helper to draw tables in PDF
    async drawTable(doc, table) {
        const startX = 50;
        const startY = 150;
        const rowHeight = 25;
        const pageWidth = 500; // A4 width approx 595 - margins
        const colWidth = pageWidth / table.headers.length;
        const widths = table.widths || table.headers.map(() => colWidth);
        let currentY = startY;
        // Draw Title
        if (table.title) {
            doc.fontSize(20).font("Helvetica-Bold").text(table.title, startX, 50, { align: "center" });
        }
        if (table.subtitle) {
            doc.fontSize(10).font("Helvetica").text(table.subtitle, startX, 80, { align: "center", color: "gray" });
        }
        // Draw Headers
        doc.fontSize(10).font("Helvetica-Bold");
        doc.fillColor("#F3F4F6").rect(startX, currentY, pageWidth, rowHeight).fill();
        doc.fillColor("#111827"); // Text color
        let currentX = startX;
        table.headers.forEach((header, i) => {
            doc.text(header, currentX + 5, currentY + 8, { width: widths[i] - 10, align: "left" });
            currentX += widths[i];
        });
        currentY += rowHeight;
        // Draw Rows
        doc.font("Helvetica").fontSize(9);
        table.rows.forEach((row, rowIndex) => {
            // Zebra striping
            if (rowIndex % 2 === 1) {
                doc.fillColor("#F9FAFB").rect(startX, currentY, pageWidth, rowHeight).fill();
            }
            doc.fillColor("#374151"); // Text color
            currentX = startX;
            row.forEach((cell, i) => {
                // Handle text wrap or truncate if needed, for now simple text
                doc.text(cell, currentX + 5, currentY + 8, { width: widths[i] - 10, align: "left", lineBreak: false, ellipsis: true });
                currentX += widths[i];
            });
            // Border bottom
            doc.moveTo(startX, currentY + rowHeight).lineTo(startX + pageWidth, currentY + rowHeight).strokeColor("#E5E7EB").stroke();
            currentY += rowHeight;
            // Page break check (simple)
            if (currentY > 750) {
                doc.addPage();
                currentY = 50;
                // Draw header again on new page? Optional. For compactness skipping.
            }
        });
    }
    async getMaintenanceHistory(vehicleId, startDate, endDate) {
        let sql = `SELECT m.*, v.plate, v.brand, v.model 
               FROM maintenance_records m
               JOIN vehicles v ON m.vehicle_id = v.id
               WHERE 1=1`;
        const params = [];
        let paramCount = 1;
        if (vehicleId) {
            sql += ` AND m.vehicle_id = $${paramCount}`;
            params.push(vehicleId);
            paramCount++;
        }
        // Use DATE() casting for robust daily comparison ignoring time
        if (startDate) {
            sql += ` AND DATE(m.maintenance_date) >= DATE($${paramCount})`;
            params.push(startDate);
            paramCount++;
        }
        if (endDate) {
            sql += ` AND DATE(m.maintenance_date) <= DATE($${paramCount})`;
            params.push(endDate);
            paramCount++;
        }
        sql += " ORDER BY m.maintenance_date DESC";
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    async getQuestionnaireReport(startDate, endDate, driverId) {
        // Use DATE() casting for robust comparison
        let sql = `SELECT dq.*, d.name as driver_name, v.plate as vehicle_plate 
       FROM driver_questionnaire dq
       LEFT JOIN drivers d ON dq.driver_id = d.id
       LEFT JOIN vehicles v ON dq.vehicle_id = v.id
       WHERE DATE(dq.timestamp_response) >= DATE($1) AND DATE(dq.timestamp_response) <= DATE($2)`;
        const params = [startDate, endDate];
        if (driverId) {
            sql += ` AND dq.driver_id = $3`;
            params.push(driverId);
        }
        sql += ` ORDER BY dq.timestamp_response DESC`;
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    async getDashboardMetrics() {
        const activeVehicles = await (0, database_1.query)("SELECT COUNT(*) FROM vehicles WHERE is_active = true");
        const activeDrivers = await (0, database_1.query)("SELECT COUNT(*) FROM drivers WHERE is_active = true");
        const maintenancesToday = await (0, database_1.query)("SELECT COUNT(*) FROM maintenance_records WHERE maintenance_date = CURRENT_DATE");
        const totalCosts = await (0, database_1.query)("SELECT SUM(cost) FROM maintenance_records");
        return {
            activeVehicles: Number.parseInt(activeVehicles.rows[0].count),
            activeDrivers: Number.parseInt(activeDrivers.rows[0].count),
            maintenancesToday: Number.parseInt(maintenancesToday.rows[0].count),
            totalCosts: Number.parseFloat(totalCosts.rows[0].sum) || 0,
        };
    }
    async getRecentActivities(limit = 10, vehicleId) {
        let whereClause = vehicleId ? `WHERE v.id = $2` : ``;
        const params = vehicleId ? [limit, vehicleId] : [limit];
        const sql = `
      SELECT * FROM (
        SELECT 
          m.id,
          m.maintenance_date as date,
          m.establishment_name as location,
          m.maintenance_type as type,
          m.cost,
          v.plate,
          'maintenance' as category
        FROM maintenance_records m
        LEFT JOIN vehicles v ON m.vehicle_id = v.id
        ${whereClause}
        
        UNION ALL
        
        SELECT 
          f.id,
          f.fuel_date as date,
          f.gas_station_name as location,
          'abastecimento' as type,
          f.cost,
          v.plate,
          'fuel' as category
        FROM fuel_records f
        LEFT JOIN vehicles v ON f.vehicle_id = v.id
        ${whereClause}
      ) combined
      ORDER BY date DESC
      LIMIT $1
    `;
        const result = await (0, database_1.query)(sql, params);
        return result.rows;
    }
    // Keep for backward compatibility
    async getRecentMaintenance(limit = 5) {
        const result = await (0, database_1.query)(`SELECT m.id, m.maintenance_date, m.establishment_name, m.maintenance_type, m.cost, v.plate
       FROM maintenance_records m
       LEFT JOIN vehicles v ON m.vehicle_id = v.id
       ORDER BY m.maintenance_date DESC 
       LIMIT $1`, [limit]);
        return result.rows;
    }
    generateCSV(data, headers) {
        let csv = headers.join(",") + "\n";
        data.forEach((row) => {
            const values = headers.map((header) => {
                const value = row[header] || "";
                const escaped = String(value).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csv += values.join(",") + "\n";
        });
        return csv;
    }
    async exportMaintenanceCSV(vehicleId, startDate, endDate) {
        const data = await this.getMaintenanceHistory(vehicleId, startDate, endDate);
        const headers = ["id", "plate", "model", "maintenance_date", "maintenance_type", "mechanic_name", "establishment_name", "cost", "service_description"];
        return this.generateCSV(data, headers);
    }
    async exportMaintenancePDF(vehicleId, startDate, endDate, timezone = "America/Sao_Paulo") {
        const data = await this.getMaintenanceHistory(vehicleId, startDate, endDate);
        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
        const chunks = [];
        return new Promise(async (resolve, reject) => {
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);
            const formattedRows = data.map(item => [
                new Date(item.maintenance_date).toLocaleDateString("pt-BR", { timeZone: timezone }),
                `${item.plate} - ${item.model}`,
                item.maintenance_type,
                item.establishment_name,
                `R$ ${Number(item.cost).toFixed(2)}`,
                item.service_description || '-'
            ]);
            await this.drawTable(doc, {
                title: "Relatório de Manutenção",
                subtitle: `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
                headers: ["Data", "Veículo", "Tipo", "Estabelecimento", "Custo", "Observações"],
                rows: formattedRows,
                widths: [70, 120, 80, 120, 70, 240]
            });
            doc.end();
        });
    }
    async exportQuestionnaireCSV(startDate, endDate, driverId) {
        const data = await this.getQuestionnaireReport(startDate, endDate, driverId);
        const headers = ["driver_name", "vehicle_plate", "status", "gps_latitude", "gps_longitude", "timestamp_response"];
        return this.generateCSV(data, headers);
    }
    async exportQuestionnairePDF(startDate, endDate, driverId, timezone = "America/Sao_Paulo") {
        const data = await this.getQuestionnaireReport(startDate, endDate, driverId);
        const PDFDocument = require("pdfkit");
        const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
        const chunks = [];
        return new Promise(async (resolve, reject) => {
            doc.on("data", (chunk) => chunks.push(chunk));
            doc.on("end", () => resolve(Buffer.concat(chunks)));
            doc.on("error", reject);
            const formattedRows = data.map(item => {
                const date = new Date(item.timestamp_response);
                const formattedDateTime = date.toLocaleString("pt-BR", { timeZone: timezone });
                return [
                    formattedDateTime,
                    item.driver_name,
                    item.vehicle_plate || "-",
                    item.status === 'driving' ? 'Rodando' : 'Parado',
                    item.gps_latitude ? `${Number(item.gps_latitude).toFixed(4)}, ${Number(item.gps_longitude).toFixed(4)}` : '-'
                ];
            });
            await this.drawTable(doc, {
                title: "Relatório de Status",
                subtitle: `Período: ${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}`,
                headers: ["Data/Hora", "Motorista", "Veículo", "Status", "GPS"],
                rows: formattedRows,
                widths: [140, 140, 100, 80, 240]
            });
            doc.end();
        });
    }
}
exports.ReportService = ReportService;
