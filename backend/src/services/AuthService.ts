import { query } from "../config/database"
import { hashPassword, comparePassword } from "../utils/password"
import { generateToken, generateRefreshToken } from "../utils/jwt"
import type { User } from "../types"

export class AuthService {
  async register(email: string, password: string, name: string, role = "driver"): Promise<User> {
    // Verificar se usuário já existe
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0) {
      throw new Error("Email already registered")
    }

    const hashedPassword = await hashPassword(password)

    const result = await query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, is_active, created_at, updated_at`,
      [email, hashedPassword, name, role],
    )

    return result.rows[0]
  }

  async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const result = await query("SELECT * FROM users WHERE email = $1 AND is_active = true", [email])

    if (result.rows.length === 0) {
      throw new Error("Invalid credentials")
    }

    const user = result.rows[0]
    const passwordMatch = await comparePassword(password, user.password_hash)

    if (!passwordMatch) {
      throw new Error("Invalid credentials")
    }

    // Atualizar último login
    await query("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1", [user.id])

    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, role: user.role })

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      accessToken,
      refreshToken,
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const result = await query(
      "SELECT id, email, name, phone, role, is_active, last_login, created_at, updated_at FROM users WHERE id = $1",
      [id],
    )
    return result.rows.length > 0 ? result.rows[0] : null
  }
}
