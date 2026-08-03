-- 012_create_suppliers.sql

CREATE TABLE IF NOT EXISTS supplier_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Seed default categories
INSERT INTO supplier_categories (name) VALUES
  ('Oficina Mecânica'),
  ('Posto de Combustível'),
  ('Borracharia'),
  ('Pneus'),
  ('Guincho'),
  ('Auto Elétrica'),
  ('Funilaria'),
  ('Pintura'),
  ('Lava Rápido'),
  ('Seguradora'),
  ('Despachante'),
  ('Autopeças'),
  ('Locadora'),
  ('Serviço Administrativo'),
  ('Outros')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE,
  trade_name VARCHAR(200) NOT NULL, -- Nome Fantasia
  corporate_name VARCHAR(200) NOT NULL, -- Razão Social
  cnpj VARCHAR(20) NOT NULL UNIQUE,
  state_registration VARCHAR(50),
  municipal_registration VARCHAR(50),
  
  primary_category VARCHAR(100) NOT NULL DEFAULT 'Outros',
  specialty VARCHAR(150),
  categories TEXT[], -- Array of categories
  
  status VARCHAR(30) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo', 'Suspenso', 'Em Homologação')),
  is_homologated BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3, 1) DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
  
  -- Contact
  contact_name VARCHAR(150),
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  email VARCHAR(150),
  website VARCHAR(200),
  
  -- Address
  zip_code VARCHAR(20),
  street VARCHAR(200),
  number VARCHAR(20),
  complement VARCHAR(100),
  neighborhood VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(10) NOT NULL, -- UF
  country VARCHAR(50) DEFAULT 'Brasil',
  
  units TEXT[], -- Units served
  
  -- Financial info
  preferred_payment_method VARCHAR(50) DEFAULT 'Transferência Bancária',
  payment_terms_days INT DEFAULT 30,
  bank_info TEXT,
  pix_key VARCHAR(100),
  financial_notes TEXT,
  
  notes TEXT,
  
  -- Indicators
  first_contract_date DATE,
  last_service_date DATE,
  total_spent NUMERIC(12, 2) DEFAULT 0.00,
  services_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  contract_number VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'Vigente' CHECK (status IN ('Vigente', 'Vencendo em breve', 'Vencido', 'Encerrado')),
  file_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(100),
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  email VARCHAR(150),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  doc_type VARCHAR(50) NOT NULL, -- Contrato Social, Alvará, Seguro, Certificado, Licença, Outros
  name VARCHAR(200) NOT NULL,
  file_url TEXT,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplier_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  user_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_category ON suppliers(primary_category);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_city ON suppliers(city);
CREATE INDEX IF NOT EXISTS idx_supplier_contracts_dates ON supplier_contracts(end_date);
