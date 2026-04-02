import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")

    let vehicles
    if (active === "true") {
      vehicles = await sql`SELECT * FROM vehicles WHERE is_active = true ORDER BY created_at DESC`
    } else if (active === "false") {
      vehicles = await sql`SELECT * FROM vehicles WHERE is_active = false ORDER BY created_at DESC`
    } else {
      vehicles = await sql`SELECT * FROM vehicles ORDER BY created_at DESC`
    }

    return NextResponse.json({ success: true, data: vehicles })
  } catch (error: any) {
    console.error("[API] Vehicles GET error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { plate, renavam, brand, model, year, color, transport_type, chassis_number, load_capacity, observations } =
      body

    if (!plate || !brand || !model) {
      return NextResponse.json({ success: false, error: "Placa, marca e modelo são obrigatórios" }, { status: 400 })
    }

    const vehicle = await sql`
      INSERT INTO vehicles (id, plate, renavam, brand, model, year, color, transport_type, chassis_number, load_capacity, observations, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${plate}, ${renavam || null}, ${brand}, ${model}, ${year || null}, ${color || null}, ${transport_type || "Rodoviário"}, ${chassis_number || null}, ${load_capacity || null}, ${observations || null}, true, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, data: vehicle[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[API] Vehicles POST error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
