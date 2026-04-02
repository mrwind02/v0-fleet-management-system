import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

const JWT_SECRET = process.env.JWT_SECRET || "fleet-management-secret-key-2024"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fleet-management-refresh-secret-key-2024"

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json()

    if (!refreshToken) {
      return NextResponse.json({ success: false, error: "Refresh token é obrigatório" }, { status: 400 })
    }

    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string }

    // Buscar usuário
    const users = await sql`
      SELECT id, email, name, role, is_active
      FROM users
      WHERE id = ${decoded.userId}
    `

    if (users.length === 0 || !users[0].is_active) {
      return NextResponse.json({ success: false, error: "Token inválido" }, { status: 401 })
    }

    const user = users[0]

    // Gerar novo access token
    const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    })

    return NextResponse.json({
      success: true,
      data: { accessToken },
    })
  } catch (error: any) {
    console.error("[API] Refresh token error:", error)
    return NextResponse.json({ success: false, error: "Token inválido ou expirado" }, { status: 401 })
  }
}
