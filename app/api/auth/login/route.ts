import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import { SignJWT } from "jose"

const sql = neon(process.env.DATABASE_URL!)

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fleet-management-secret-key-2024")

// Simple password verification (matches the hash from seed)
function verifyPassword(password: string, hash: string): boolean {
  const salt = "fleet2024salt"
  const expectedHash = Buffer.from(salt + password).toString("base64")
  return hash === expectedHash
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email e senha sao obrigatorios" }, { status: 400 })
    }

    // Buscar usuario no banco
    const users = await sql`
      SELECT id, email, password_hash, name, role, is_active
      FROM users
      WHERE email = ${email.toLowerCase()}
    `

    if (users.length === 0) {
      return NextResponse.json({ success: false, error: "Credenciais invalidas" }, { status: 401 })
    }

    const user = users[0]

    if (!user.is_active) {
      return NextResponse.json({ success: false, error: "Usuario desativado" }, { status: 401 })
    }

    // Verificar senha
    const isPasswordValid = verifyPassword(password, user.password_hash)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Credenciais invalidas" }, { status: 401 })
    }

    // Atualizar ultimo login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`

    // Gerar tokens usando jose (Edge compatible)
    const accessToken = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(JWT_SECRET)

    const refreshToken = await new SignJWT({ userId: user.id })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET)

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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[API] Login error:", errorMessage)
    return NextResponse.json({ success: false, error: "Erro interno do servidor: " + errorMessage }, { status: 500 })
  }
}
