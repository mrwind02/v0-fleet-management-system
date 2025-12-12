const { PGlite } = require("@electric-sql/pglite")
const bcrypt = require("bcryptjs")
const path = require("path")
require("dotenv").config()

const dataDir = path.join(__dirname, "../data/pg_data")

async function seed() {
  console.log(`Connecting to PGlite at ${dataDir}...`)
  const db = new PGlite(dataDir);

  try {
    console.log("🌱 Starting database seed...")

    // Criar usuários
    const hashedPassword = await bcrypt.hash("password123", 10)

    const usersResult = await db.query(
      `
      INSERT INTO users(email, password_hash, name, role, is_active) VALUES
  ('admin@fleet.com', $1, 'Admin User', 'admin', true),
  ('manager@fleet.com', $1, 'Manager User', 'manager', true),
  ('driver1@fleet.com', $1, 'João Silva', 'driver', true),
  ('driver2@fleet.com', $1, 'Maria Santos', 'driver', true)
      RETURNING id, email;
`,
      [hashedPassword],
    )

    const userIds = usersResult.rows.map((row) => row.id)
    console.log("✅ Created 4 users")

    // Criar veículos
    const vehiclesResult = await db.query(`
      INSERT INTO vehicles(plate, brand, model, year, color, chassis_number, load_capacity, observations) VALUES
  ('ABC1234', 'Volvo', 'FH16', 2020, 'Branco', 'ABC123456789', 25000, 'Caminhão de carga'),
  ('DEF5678', 'Scania', 'R440', 2019, 'Preto', 'DEF987654321', 20000, 'Caminhão bomba'),
  ('GHI9012', 'Mercedes', 'Actros', 2021, 'Cinza', 'GHI555666777', 22000, 'Caminhão frigorífico')
      RETURNING id;
`)

    const vehicleIds = vehiclesResult.rows.map((row) => row.id)
    console.log("✅ Created 3 vehicles")

    // Criar motoristas
    const driversResult = await db.query(
      `
      INSERT INTO drivers(user_id, name, cnh_number, cnh_category, cnh_expiry_date, phone, email, special_load_certified) VALUES
  ($1, 'João Silva', 'CNH001', 'D', '2026-12-31', '11999999999', 'joao@email.com', true),
  ($2, 'Maria Santos', 'CNH002', 'E', '2025-06-30', '11988888888', 'maria@email.com', false),
  (NULL, 'Pedro Costa', 'CNH003', 'D', '2027-03-15', '11977777777', 'pedro@email.com', true)
      RETURNING id;
`,
      [userIds[2], userIds[3]],
    )

    const driverIds = driversResult.rows.map((row) => row.id)
    console.log("✅ Created 3 drivers")

    // Atribuir motoristas a veículos
    await db.query(
      `
      INSERT INTO vehicle_driver_assignment(vehicle_id, driver_id, is_current, notes) VALUES
  ($1, $2, true, 'Motorista principal'),
  ($3, $4, true, 'Motorista principal')
    `,
      [vehicleIds[0], driverIds[0], vehicleIds[1], driverIds[1]],
    )

    console.log("✅ Created vehicle-driver assignments")

    // Criar manutenções
    // Note: PGlite date parsing is good but safe to pass standard ISO strings
    await db.query(
      `
      INSERT INTO maintenance_records(vehicle_id, maintenance_date, maintenance_type, mechanic_name, establishment_name, service_description, cost, odometer_reading) VALUES
  ($1, '2024-11-15', 'preventiva', 'Carlos Silva', 'Oficina ABC', 'Troca de óleo e filtro', 500.00, 150000),
  ($2, '2024-11-10', 'corretiva', 'João Manutenção', 'Mecânica X', 'Reparo de transmissão', 2500.00, 200000),
  ($3, '2024-10-20', 'preventiva', 'Carlos Silva', 'Oficina ABC', 'Revisão completa', 1200.00, 120000)
    `,
      [vehicleIds[0], vehicleIds[1], vehicleIds[2]],
    )

    console.log("✅ Created 3 maintenance records")

    // Criar respostas do questionário
    await db.query(
      `
      INSERT INTO driver_questionnaire(driver_id, vehicle_id, status, gps_latitude, gps_longitude) VALUES
  ($1, $2, 'driving', -23.550520, -46.633309),
  ($3, $4, 'stopped', -23.550520, -46.633309),
  ($1, $2, 'driving', -23.550520, -46.633309)
    `,
      [driverIds[0], vehicleIds[0], driverIds[1], vehicleIds[1]],
    )

    console.log("✅ Created questionnaire responses")

    console.log("\n✨ Database seed completed successfully!")
    console.log("\nTest Credentials:")
    console.log("Admin: admin@fleet.com / password123")
    console.log("Manager: manager@fleet.com / password123")
    console.log("Driver 1: driver1@fleet.com / password123")
    console.log("Driver 2: driver2@fleet.com / password123")
  } catch (error) {
    console.error("❌ Error during seed:", error)
    throw error
  } finally {
    await db.close()
  }
}

seed().catch(console.error)
