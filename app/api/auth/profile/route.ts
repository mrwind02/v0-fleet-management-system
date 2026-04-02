import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)
const JWT_SECRET = process.env.JWT_SECRET || "fleet-management-secret-key-2024"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Token não fornecido" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    const users = await sql`
      SELECT id, email, name, role, phone, created_at, last_login
      FROM users
      WHERE id = ${decoded.userId}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: { user: users[0] },
    })
  } catch (error: any) {
    console.error("[API] Profile error:", error)
    return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
  }
}
