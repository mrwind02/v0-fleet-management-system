import { Pool } from "pg"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
    console.error("ERROR: DATABASE_URL environment variable is required")
    process.exit(1)
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function seed() {
    console.log("🌱 Starting PostgreSQL database seed...")

    try {
        // Criar usuários
        const hashedPassword = await bcrypt.hash("password123", 10)

        console.log("👥 Creating users...")
        const usersResult = await pool.query(
            `
            INSERT INTO users(email, password_hash, name, role, is_active) VALUES
            ('admin@fleet.com', $1, 'Admin User', 'admin', true),
            ('manager@fleet.com', $1, 'Manager User', 'manager', true),
            ('driver1@fleet.com', $1, 'João Silva', 'driver', true),
            ('driver2@fleet.com', $1, 'Maria Santos', 'driver', true)
            ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
            RETURNING id, email;
            `,
            [hashedPassword],
        )

        const userIds = usersResult.rows.map((row) => row.id)
        console.log(`✅ Created/Updated ${usersResult.rowCount} users`)

        // Criar veículos
        console.log("🚚 Creating vehicles...")
        const vehiclesResult = await pool.query(`
            INSERT INTO vehicles(plate, brand, model, year, color, chassis_number, load_capacity, observations) VALUES
            ('ABC1234', 'Volvo', 'FH16', 2020, 'Branco', 'ABC123456789', 25000, 'Caminhão de carga'),
            ('DEF5678', 'Scania', 'R440', 2019, 'Preto', 'DEF987654321', 20000, 'Caminhão bomba'),
            ('GHI9012', 'Mercedes', 'Actros', 2021, 'Cinza', 'GHI555666777', 22000, 'Caminhão frigorífico')
            ON CONFLICT (plate) DO NOTHING
            RETURNING id;
        `)

        let vehicleIds = vehiclesResult.rows.map((row) => row.id)
        if (vehicleIds.length === 0) {
            const existing = await pool.query("SELECT id FROM vehicles LIMIT 3")
            vehicleIds = existing.rows.map(row => row.id)
        }
        console.log(`✅ ${vehicleIds.length} vehicles ready`)

        // Criar motoristas
        console.log("👨‍✈️ Creating drivers...")
        const driversResult = await pool.query(
            `
            INSERT INTO drivers(user_id, name, cnh_number, cnh_category, cnh_expiry_date, phone, email, special_load_certified) VALUES
            ($1, 'João Silva', 'CNH001', 'D', '2026-12-31', '11999999999', 'joao@email.com', true),
            ($2, 'Maria Santos', 'CNH002', 'E', '2025-06-30', '11988888888', 'maria@email.com', false)
            ON CONFLICT (cnh_number) DO NOTHING
            RETURNING id;
            `,
            [userIds[2], userIds[3]],
        )

        let driverIds = driversResult.rows.map((row) => row.id)
        if (driverIds.length === 0) {
            const existing = await pool.query("SELECT id FROM drivers LIMIT 2")
            driverIds = existing.rows.map(row => row.id)
        }
        console.log(`✅ ${driverIds.length} drivers ready`)

        // Atribuir motoristas a veículos
        if (vehicleIds.length >= 2 && driverIds.length >= 2) {
            console.log("🔗 Assigning drivers to vehicles...")
            await pool.query(
                `
                INSERT INTO vehicle_driver_assignment(vehicle_id, driver_id, is_current, notes) VALUES
                ($1, $2, true, 'Motorista principal'),
                ($3, $4, true, 'Motorista principal')
                ON CONFLICT DO NOTHING
                `,
                [vehicleIds[0], driverIds[0], vehicleIds[1], driverIds[1]],
            )
            console.log("✅ Created vehicle-driver assignments")
        }

        // Criar manutenções
        console.log("🔧 Creating maintenance records...")
        await pool.query(
            `
            INSERT INTO maintenance_records(vehicle_id, maintenance_date, maintenance_type, mechanic_name, establishment_name, service_description, cost, odometer_reading) VALUES
            ($1, '2024-11-15', 'preventiva', 'Carlos Silva', 'Oficina ABC', 'Troca de óleo e filtro', 500.00, 150000),
            ($2, '2024-11-10', 'corretiva', 'João Manutenção', 'Mecânica X', 'Reparo de transmissão', 2500.00, 200000),
            ($3, '2024-10-20', 'preventiva', 'Carlos Silva', 'Oficina ABC', 'Revisão completa', 1200.00, 120000)
            ON CONFLICT DO NOTHING
            `,
            [vehicleIds[0], vehicleIds[1], vehicleIds[2]],
        )
        console.log("✅ Created maintenance records")

        // Criar multas
        console.log("📝 Creating fines...")
        await pool.query(
            `
            INSERT INTO fines(auto_number, infraction_date, organ, category, description, vehicle_id, driver_id, value, points, due_date, status) VALUES
            ('AIT-998877', '2024-05-10', 'DETRAN', 'Velocidade', 'Transitar em velocidade superior à máxima permitida em até 20%', $1, $2, 130.16, 4, '2024-07-10', 'aberto')
            ON CONFLICT DO NOTHING
            `,
            [vehicleIds[0], driverIds[0]]
        )
        console.log("✅ Created fines")

        // Criar documentos
        console.log("📄 Creating documents...")
        await pool.query(
            `
            INSERT INTO documents(name, category, related_to, number, issue_date, expiry_date, status, responsible, vehicle_id) VALUES
            ('CRLV 2024', 'Veículo', 'Volvo FH16 (ABC1234)', '1234567890', '2024-01-10', '2024-12-31', 'Válido', 'Despachante', $1)
            ON CONFLICT DO NOTHING
            `,
            [vehicleIds[0]]
        )
        console.log("✅ Created documents")

        console.log("\n✨ PostgreSQL Database seed completed successfully!")
        console.log("\nTest Credentials:")
        console.log("Admin: admin@fleet.com / password123")
        console.log("Manager: manager@fleet.com / password123")
        console.log("Driver 1: driver1@fleet.com / password123")
        console.log("Driver 2: driver2@fleet.com / password123")

    } catch (error) {
        console.error("❌ Error during PostgreSQL seed:", error)
        throw error
    } finally {
        await pool.end()
    }
}

seed().catch(console.error)
