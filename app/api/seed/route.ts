import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Hash da senha padrão
    const passwordHash = await bcrypt.hash("password123", 10)

    // Verificar se já existem usuários
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`

    if (existingUsers[0].count > 0) {
      return NextResponse.json({
        success: true,
        message: "Banco de dados já possui dados. Seed não executado.",
        existingUsers: existingUsers[0].count,
      })
    }

    // Criar usuários de teste
    const users = await sql`
      INSERT INTO users (id, email, password_hash, name, role, phone, is_active, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'admin@fleet.com', ${passwordHash}, 'Administrador', 'admin', '(11) 99999-0001', true, NOW(), NOW()),
        (gen_random_uuid(), 'manager@fleet.com', ${passwordHash}, 'Gerente de Frota', 'manager', '(11) 99999-0002', true, NOW(), NOW()),
        (gen_random_uuid(), 'driver1@fleet.com', ${passwordHash}, 'João Silva', 'driver', '(11) 99999-0003', true, NOW(), NOW()),
        (gen_random_uuid(), 'driver2@fleet.com', ${passwordHash}, 'Maria Santos', 'driver', '(11) 99999-0004', true, NOW(), NOW())
      RETURNING id, email, name, role
    `

    // Criar alguns veículos de teste
    const vehicles = await sql`
      INSERT INTO vehicles (id, plate, brand, model, year, color, transport_type, chassis_number, load_capacity, is_active, created_at, updated_at)
      VALUES 
        (gen_random_uuid(), 'ABC-1234', 'Volvo', 'FH 540', 2023, 'Branco', 'Rodoviário', '9BW12345678901234', 40000, true, NOW(), NOW()),
        (gen_random_uuid(), 'DEF-5678', 'Scania', 'R450', 2022, 'Prata', 'Rodoviário', '9BW22345678901234', 35000, true, NOW(), NOW()),
        (gen_random_uuid(), 'GHI-9012', 'Mercedes-Benz', 'Actros', 2024, 'Azul', 'Rodoviário', '9BW32345678901234', 45000, true, NOW(), NOW())
      RETURNING id, plate, brand, model
    `

    // Buscar o primeiro motorista criado para associar
    const driver = await sql`SELECT id FROM users WHERE role = 'driver' LIMIT 1`

    // Criar motoristas associados aos usuários
    if (driver.length > 0) {
      await sql`
        INSERT INTO drivers (id, user_id, name, cnh_number, cnh_category, cnh_expiry_date, phone, email, special_load_certified, is_active, created_at, updated_at)
        VALUES 
          (gen_random_uuid(), ${driver[0].id}, 'João Silva', '12345678901', 'E', '2026-12-31', '(11) 99999-0003', 'driver1@fleet.com', true, true, NOW(), NOW())
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
  } catch (error: any) {
    console.error("[API] Seed error:", error)
    return NextResponse.json({ success: false, error: error.message || "Erro ao criar dados de teste" }, { status: 500 })
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
