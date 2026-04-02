import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get("active")

    let drivers
    if (active === "true") {
      drivers = await sql`SELECT * FROM drivers WHERE is_active = true ORDER BY created_at DESC`
    } else if (active === "false") {
      drivers = await sql`SELECT * FROM drivers WHERE is_active = false ORDER BY created_at DESC`
    } else {
      drivers = await sql`SELECT * FROM drivers ORDER BY created_at DESC`
    }

    return NextResponse.json({ success: true, data: drivers })
  } catch (error: any) {
    console.error("[API] Drivers GET error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, cnh_number, cnh_category, cnh_expiry_date, phone, email, special_load_certified, photo_url } = body

    if (!name || !cnh_number || !cnh_category) {
      return NextResponse.json(
        { success: false, error: "Nome, número da CNH e categoria são obrigatórios" },
        { status: 400 },
      )
    }

    const driver = await sql`
      INSERT INTO drivers (id, name, cnh_number, cnh_category, cnh_expiry_date, phone, email, special_load_certified, photo_url, is_active, created_at, updated_at)
      VALUES (gen_random_uuid(), ${name}, ${cnh_number}, ${cnh_category}, ${cnh_expiry_date || null}, ${phone || null}, ${email || null}, ${special_load_certified || false}, ${photo_url || null}, true, NOW(), NOW())
      RETURNING *
    `

    return NextResponse.json({ success: true, data: driver[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[API] Drivers POST error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
