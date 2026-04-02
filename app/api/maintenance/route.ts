import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get("vehicleId")
    const type = searchParams.get("type")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let maintenance
    if (vehicleId) {
      maintenance = await sql`
        SELECT m.*, v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model
        FROM maintenance_records m
        LEFT JOIN vehicles v ON m.vehicle_id = v.id
        WHERE m.vehicle_id = ${vehicleId}
        ORDER BY m.maintenance_date DESC
      `
    } else {
      maintenance = await sql`
        SELECT m.*, v.plate as vehicle_plate, v.brand as vehicle_brand, v.model as vehicle_model
        FROM maintenance_records m
        LEFT JOIN vehicles v ON m.vehicle_id = v.id
        ORDER BY m.maintenance_date DESC
      `
    }

    return NextResponse.json({ success: true, data: maintenance })
  } catch (error: any) {
    console.error("[API] Maintenance GET error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      vehicle_id,
      establishment_name,
      maintenance_date,
      mechanic_name,
      maintenance_type,
      service_description,
      cost,
      odometer_reading,
      attachments,
    } = body

    if (!vehicle_id || !maintenance_type || !service_description) {
      return NextResponse.json(
        { success: false, error: "Veículo, tipo e descrição do serviço são obrigatórios" },
        { status: 400 },
      )
    }

    const record = await sql`
      INSERT INTO maintenance_records (id, vehicle_id, establishment_name, maintenance_date, mechanic_name, maintenance_type, service_description, cost, odometer_reading, attachments, created_at, updated_at)
      VALUES (gen_random_uuid(), ${vehicle_id}, ${establishment_name || null}, ${maintenance_date || new Date().toISOString().split("T")[0]}, ${mechanic_name || null}, ${maintenance_type}, ${service_description}, ${cost || 0}, ${odometer_reading || null}, ${attachments ? JSON.stringify(attachments) : null}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, data: record[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[API] Maintenance POST error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
