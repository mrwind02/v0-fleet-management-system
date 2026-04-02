import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    // Veículos ativos
    const vehiclesCount = await sql`SELECT COUNT(*) as count FROM vehicles WHERE is_active = true`

    // Motoristas ativos
    const driversCount = await sql`SELECT COUNT(*) as count FROM drivers WHERE is_active = true`

    // Total de manutenções
    const maintenanceCount = await sql`SELECT COUNT(*) as count FROM maintenance_records`

    // Custo total de manutenções
    const maintenanceCost = await sql`SELECT COALESCE(SUM(cost), 0) as total FROM maintenance_records`

    // Km total (soma de todos odometer readings)
    const totalKm = await sql`SELECT COALESCE(MAX(odometer_reading), 0) as total FROM maintenance_records`

    // Últimas manutenções
    const recentMaintenance = await sql`
      SELECT m.*, v.plate, v.brand, v.model
      FROM maintenance_records m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.maintenance_date DESC
      LIMIT 5
    `

    // Próximas manutenções (baseado em km ou data)
    const upcomingMaintenance = await sql`
      SELECT v.id, v.plate, v.brand, v.model, 
             (SELECT MAX(odometer_reading) FROM maintenance_records WHERE vehicle_id = v.id) as last_km,
             (SELECT MAX(maintenance_date) FROM maintenance_records WHERE vehicle_id = v.id) as last_maintenance
      FROM vehicles v
      WHERE v.is_active = true
      ORDER BY last_maintenance ASC NULLS FIRST
      LIMIT 5
    `

    return NextResponse.json({
      success: true,
      data: {
        activeVehicles: Number.parseInt(vehiclesCount[0].count),
        activeDrivers: Number.parseInt(driversCount[0].count),
        totalMaintenances: Number.parseInt(maintenanceCount[0].count),
        totalMaintenanceCost: Number.parseFloat(maintenanceCost[0].total),
        totalKm: Number.parseInt(totalKm[0].total),
        recentMaintenance,
        upcomingMaintenance,
      },
    })
  } catch (error: any) {
    console.error("[API] Reports metrics error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
