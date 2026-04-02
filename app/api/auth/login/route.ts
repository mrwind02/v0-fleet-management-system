import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

const JWT_SECRET = process.env.JWT_SECRET || "fleet-management-secret-key-2024"
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "fleet-management-refresh-secret-key-2024"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    // Buscar usuário no banco
    const users = await sql`
      SELECT id, email, password_hash, name, role, is_active
      FROM users
      WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    const user = users[0]

    if (!user.is_active) {
      return NextResponse.json({ success: false, error: "Usuário desativado" }, { status: 401 })
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Credenciais inválidas" }, { status: 401 })
    }

    // Atualizar último login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`

    // Gerar tokens
    const accessToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    })

    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: "7d" })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    })
  } catch (error: any) {
    console.error("[API] Login error:", error)
    return NextResponse.json({ success: false, error: "Erro interno do servidor" }, { status: 500 })
  }
}
