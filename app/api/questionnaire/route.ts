import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get("driverId")
    const limit = searchParams.get("limit")

    let questionnaires
    if (driverId) {
      questionnaires = await sql`
        SELECT q.*, d.name as driver_name, v.plate as vehicle_plate
        FROM driver_questionnaire q
        LEFT JOIN drivers d ON q.driver_id = d.id
        LEFT JOIN vehicles v ON q.vehicle_id = v.id
        WHERE q.driver_id = ${driverId}
        ORDER BY q.timestamp_response DESC
        LIMIT ${limit ? Number.parseInt(limit) : 50}
      `
    } else {
      questionnaires = await sql`
        SELECT q.*, d.name as driver_name, v.plate as vehicle_plate
        FROM driver_questionnaire q
        LEFT JOIN drivers d ON q.driver_id = d.id
        LEFT JOIN vehicles v ON q.vehicle_id = v.id
        ORDER BY q.timestamp_response DESC
        LIMIT ${limit ? Number.parseInt(limit) : 50}
      `
    }

    return NextResponse.json({ success: true, data: questionnaires })
  } catch (error: any) {
    console.error("[API] Questionnaire GET error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { driver_id, vehicle_id, status, gps_latitude, gps_longitude } = body

    if (!driver_id || !status) {
      return NextResponse.json({ success: false, error: "ID do motorista e status são obrigatórios" }, { status: 400 })
    }

    const questionnaire = await sql`
      INSERT INTO driver_questionnaire (id, driver_id, vehicle_id, status, gps_latitude, gps_longitude, timestamp_response, created_at)
      VALUES (gen_random_uuid(), ${driver_id}, ${vehicle_id || null}, ${status}, ${gps_latitude || null}, ${gps_longitude || null}, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, data: questionnaire[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[API] Questionnaire POST error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
