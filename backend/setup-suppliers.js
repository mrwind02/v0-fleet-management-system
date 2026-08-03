const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('Running migration 012_create_suppliers.sql...');
    const sqlPath = path.join(__dirname, 'migrations/012_create_suppliers.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Migration executed successfully.');

    // Seed sample suppliers
    console.log('Seeding sample suppliers...');

    const sampleSuppliers = [
      {
        code: 'FOR-001',
        trade_name: 'Oficina Mecânica Alfa',
        corporate_name: 'Mecânica Alfa Prestação de Serviços LTDA',
        cnpj: '12.345.678/0001-90',
        state_registration: '123.456.789.110',
        primary_category: 'Oficina Mecânica',
        specialty: 'Manutenção Pesada Diesel & Motores',
        categories: ['Oficina Mecânica', 'Auto Elétrica', 'Funilaria'],
        status: 'Ativo',
        is_homologated: true,
        rating: 4.8,
        contact_name: 'Ricardo Santos',
        phone: '(11) 3456-7890',
        whatsapp: '(11) 98765-4321',
        email: 'contato@mecanicaalfa.com.br',
        website: 'https://mecanicaalfa.com.br',
        zip_code: '01310-100',
        street: 'Avenida Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        units: ['Matriz São Paulo', 'Filial Rio de Janeiro'],
        preferred_payment_method: 'Faturamento',
        payment_terms_days: 30,
        bank_info: 'Banco Itaú (341) Ag 1234 CC 56789-0',
        pix_key: '12.345.678/0001-90',
        first_contract_date: '2024-01-15',
        last_service_date: '2026-07-25',
        total_spent: 184000.00,
        services_count: 42
      },
      {
        code: 'FOR-002',
        trade_name: 'Posto Shell Centro',
        corporate_name: 'Auto Posto Shell Central LTDA',
        cnpj: '98.765.432/0001-10',
        state_registration: '987.654.321.110',
        primary_category: 'Posto de Combustível',
        specialty: 'Abastecimento Frota Diesel S10',
        categories: ['Posto de Combustível', 'Lava Rápido'],
        status: 'Ativo',
        is_homologated: true,
        rating: 4.9,
        contact_name: 'Marcos Oliveira',
        phone: '(11) 2233-4455',
        whatsapp: '(11) 97766-5544',
        email: 'gerencia@shellcentro.com.br',
        website: 'https://shellcentro.com.br',
        zip_code: '01001-000',
        street: 'Praça da Sé',
        number: '200',
        neighborhood: 'Sé',
        city: 'São Paulo',
        state: 'SP',
        units: ['Matriz São Paulo'],
        preferred_payment_method: 'Sem Parar',
        payment_terms_days: 15,
        bank_info: 'Banco Bradesco (237) Ag 4321 CC 98765-4',
        pix_key: '98.765.432/0001-10',
        first_contract_date: '2023-06-01',
        last_service_date: '2026-07-28',
        total_spent: 142000.00,
        services_count: 112
      },
      {
        code: 'FOR-003',
        trade_name: 'Seguro Porto Frota',
        corporate_name: 'Porto Seguro Companhia de Seguros Gerais',
        cnpj: '61.198.164/0001-60',
        state_registration: '112.233.445.556',
        primary_category: 'Seguradora',
        specialty: 'Seguro de Cargas e Frotas Pesadas',
        categories: ['Seguradora', 'Guincho'],
        status: 'Ativo',
        is_homologated: true,
        rating: 4.7,
        contact_name: 'Luciana Ferreira',
        phone: '(11) 3366-3000',
        whatsapp: '(11) 99988-7766',
        email: 'frotas@portoseguro.com.br',
        website: 'https://portoseguro.com.br',
        zip_code: '01202-001',
        street: 'Alameda Barão de Piracicaba',
        number: '618',
        neighborhood: 'Campos Elíseos',
        city: 'São Paulo',
        state: 'SP',
        units: ['Matriz São Paulo', 'Filial Curitiba', 'Filial Rio de Janeiro', 'Filial Belo Horizonte'],
        preferred_payment_method: 'Debito em Conta',
        payment_terms_days: 30,
        bank_info: 'Banco do Brasil (001) Ag 0001 CC 11111-1',
        pix_key: 'frotas@portoseguro.com.br',
        first_contract_date: '2022-10-10',
        last_service_date: '2026-07-20',
        total_spent: 96000.00,
        services_count: 15
      },
      {
        code: 'FOR-004',
        trade_name: 'Borracharia & Pneus São José',
        corporate_name: 'São José Pneus e Recapagens EIRELI',
        cnpj: '33.444.555/0001-22',
        state_registration: '333.444.555.666',
        primary_category: 'Pneus',
        specialty: 'Recapagem, Alinhamento e Balanceamento 3D',
        categories: ['Pneus', 'Borracharia'],
        status: 'Ativo',
        is_homologated: true,
        rating: 4.5,
        contact_name: 'José Ribeiro',
        phone: '(41) 3232-1122',
        whatsapp: '(41) 98877-6655',
        email: 'vendas@pneussaojose.com.br',
        website: '',
        zip_code: '80010-000',
        street: 'Rua das Flores',
        number: '500',
        neighborhood: 'Centro',
        city: 'Curitiba',
        state: 'PR',
        units: ['Filial Curitiba'],
        preferred_payment_method: 'Pix',
        payment_terms_days: 28,
        bank_info: 'Banco Santander (033) Ag 3333 CC 44444-4',
        pix_key: '33.444.555/0001-22',
        first_contract_date: '2024-03-01',
        last_service_date: '2026-07-24',
        total_spent: 48500.00,
        services_count: 28
      },
      {
        code: 'FOR-005',
        trade_name: 'Guincho 24h Socorro Pesado',
        corporate_name: 'Socorro Pesado Remoções EIRELI',
        cnpj: '77.888.999/0001-33',
        state_registration: '777.888.999.000',
        primary_category: 'Guincho',
        specialty: 'Remoção de Caminhões e Carretas Lançantes',
        categories: ['Guincho'],
        status: 'Em Homologação',
        is_homologated: false,
        rating: 4.2,
        contact_name: 'Carlos resgate',
        phone: '(31) 3344-5566',
        whatsapp: '(31) 99887-1122',
        email: 'contato@socorropesado.com.br',
        website: '',
        zip_code: '30110-000',
        street: 'Avenida Afonso Pena',
        number: '1200',
        neighborhood: 'Centro',
        city: 'Belo Horizonte',
        state: 'MG',
        units: ['Filial Belo Horizonte'],
        preferred_payment_method: 'Pix',
        payment_terms_days: 15,
        bank_info: 'Banco Inter (077) Ag 0001 CC 88888-8',
        pix_key: 'contato@socorropesado.com.br',
        first_contract_date: '2025-05-10',
        last_service_date: '2026-07-18',
        total_spent: 12500.00,
        services_count: 8
      }
    ];

    for (const sup of sampleSuppliers) {
      const supRes = await pool.query(`
        INSERT INTO suppliers (
          code, trade_name, corporate_name, cnpj, state_registration, primary_category, specialty, categories,
          status, is_homologated, rating, contact_name, phone, whatsapp, email, website,
          zip_code, street, number, neighborhood, city, state, units,
          preferred_payment_method, payment_terms_days, bank_info, pix_key,
          first_contract_date, last_service_date, total_spent, services_count
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
        )
        ON CONFLICT (cnpj) DO UPDATE SET
          trade_name = EXCLUDED.trade_name,
          rating = EXCLUDED.rating,
          total_spent = EXCLUDED.total_spent
        RETURNING id
      `, [
        sup.code, sup.trade_name, sup.corporate_name, sup.cnpj, sup.state_registration,
        sup.primary_category, sup.specialty, sup.categories, sup.status, sup.is_homologated, sup.rating,
        sup.contact_name, sup.phone, sup.whatsapp, sup.email, sup.website,
        sup.zip_code, sup.street, sup.number, sup.neighborhood, sup.city, sup.state, sup.units,
        sup.preferred_payment_method, sup.payment_terms_days, sup.bank_info, sup.pix_key,
        sup.first_contract_date, sup.last_service_date, sup.total_spent, sup.services_count
      ]);

      const supplierId = supRes.rows[0].id;

      // Seed contract
      await pool.query(`
        INSERT INTO supplier_contracts (supplier_id, contract_number, description, start_date, end_date, amount, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [
        supplierId,
        `CTR-${sup.code}`,
        `Contrato de prestação de serviços de ${sup.primary_category}`,
        sup.first_contract_date,
        sup.code === 'FOR-003' ? '2026-08-05' : '2027-01-15', // FOR-003 is critical (vence em 8 dias)
        sup.total_spent,
        sup.code === 'FOR-003' ? 'Vencendo em breve' : 'Vigente'
      ]);

      // Seed contact
      await pool.query(`
        INSERT INTO supplier_contacts (supplier_id, name, role, phone, whatsapp, email, is_primary)
        VALUES ($1, $2, 'Gerente Comercial', $3, $4, $5, TRUE)
        ON CONFLICT DO NOTHING
      `, [supplierId, sup.contact_name, sup.phone, sup.whatsapp, sup.email]);

      // Seed document
      await pool.query(`
        INSERT INTO supplier_documents (supplier_id, doc_type, name, expiry_date)
        VALUES 
          ($1, 'Contrato Social', 'Contrato_Social_Consolidado.pdf', '2028-12-31'),
          ($1, 'Alvará', 'Alvara_Funcionamento_2026.pdf', '2026-12-31')
        ON CONFLICT DO NOTHING
      `, [supplierId]);

      // Seed history
      await pool.query(`
        INSERT INTO supplier_history (supplier_id, event_type, description, user_name)
        VALUES ($1, 'created', 'Fornecedor cadastrado no ERP FrotaOne', 'Sistema')
        ON CONFLICT DO NOTHING
      `, [supplierId]);
    }

    console.log('Sample suppliers seeded successfully!');
  } catch (err) {
    console.error('Error during setup-suppliers:', err);
  } finally {
    pool.end();
  }
})();
