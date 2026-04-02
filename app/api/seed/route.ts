import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

const sql = neon(process.env.DATABASE_URL!)

// Simple password hash for testing (in production, use bcrypt properly)
// This creates a hash that can be verified with the comparePassword function below
function simpleHash(password: string): string {
  // Using a simple base64 encoding with salt for demo purposes
  // In real production, ALWAYS use bcrypt.hash()
  const salt = "fleet2024salt"
  return Buffer.from(salt + password).toString("base64")
}

export async function POST() {
  try {
    // Hash da senha padrao
    const passwordHash = simpleHash("password123")

    // Verificar se ja existem usuarios
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`
    const count = Number(existingUsers[0].count)

    if (count > 0) {
      return NextResponse.json({
        success: true,
        message: "Banco de dados ja possui dados. Seed nao executado.",
        existingUsers: count,
      })
    }

    // Criar usuarios de teste
    const users = await sql`
      INSERT INTO users (id, email, password_hash, name, role, phone, is_active, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'admin@fleet.com', ${passwordHash}, 'Administrador', 'admin', '(11) 99999-0001', true, NOW(), NOW()),
        (gen_random_uuid(), 'manager@fleet.com', ${passwordHash}, 'Gerente de Frota', 'manager', '(11) 99999-0002', true, NOW(), NOW()),
        (gen_random_uuid(), 'driver1@fleet.com', ${passwordHash}, 'Joao Silva', 'driver', '(11) 99999-0003', true, NOW(), NOW()),
        (gen_random_uuid(), 'driver2@fleet.com', ${passwordHash}, 'Maria Santos', 'driver', '(11) 99999-0004', true, NOW(), NOW())
      RETURNING id, email, name, role
    `

    // Criar alguns veiculos de teste
    const vehicles = await sql`
      INSERT INTO vehicles (id, plate, brand, model, year, color, transport_type, chassis_number, load_capacity, is_active, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'ABC-1234', 'Volvo', 'FH 540', 2023, 'Branco', 'Rodoviario', '9BW12345678901234', 40000, true, NOW(), NOW()),
        (gen_random_uuid(), 'DEF-5678', 'Scania', 'R450', 2022, 'Prata', 'Rodoviario', '9BW22345678901234', 35000, true, NOW(), NOW()),
        (gen_random_uuid(), 'GHI-9012', 'Mercedes-Benz', 'Actros', 2024, 'Azul', 'Rodoviario', '9BW32345678901234', 45000, true, NOW(), NOW())
      RETURNING id, plate, brand, model
    `

    // Buscar o primeiro motorista criado para associar
    const driver = await sql`SELECT id FROM users WHERE role = 'driver' LIMIT 1`

    // Criar motoristas associados aos usuarios
    if (driver.length > 0) {
      await sql`
        INSERT INTO drivers (id, user_id, name, cnh_number, cnh_category, cnh_expiry_date, phone, email, special_load_certified, is_active, created_at, updated_at)
        VALUES 
          (gen_random_uuid(), ${driver[0].id}, 'Joao Silva', '12345678901', 'E', '2026-12-31', '(11) 99999-0003', 'driver1@fleet.com', true, true, NOW(), NOW())
      `
    }

    return NextResponse.json({
      success: true,
      message: "Dados de teste criados com sucesso!",
      data: {
        users: users.map((u) => ({ email: u.email, name: u.name, role: u.role })),
        vehicles: vehicles.map((v) => ({ plate: v.plate, brand: v.brand, model: v.model })),
      },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[API] Seed error:", errorMessage)
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Use POST para executar o seed do banco de dados",
    info: {
      usuarios: ["admin@fleet.com", "manager@fleet.com", "driver1@fleet.com", "driver2@fleet.com"],
      senha: "password123",
    },
  })
}
