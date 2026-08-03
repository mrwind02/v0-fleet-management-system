-- Migration 011: Create Expenses module tables

CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO expense_categories (name, icon, color) VALUES
  ('Pedágio', 'Ticket', 'blue'),
  ('Estacionamento', 'Car', 'purple'),
  ('Lavagem', 'Sparkles', 'cyan'),
  ('Alimentação', 'Utensils', 'emerald'),
  ('Hospedagem', 'Hotel', 'indigo'),
  ('Balsa', 'Ship', 'sky'),
  ('Guincho', 'Truck', 'orange'),
  ('Ferry Boat', 'Ship', 'blue'),
  ('Ferry', 'Ship', 'blue'),
  ('Táxi', 'CarTaxiFront', 'yellow'),
  ('Aplicativo de Transporte', 'Smartphone', 'amber'),
  ('Frete Terceirizado', 'PackageCheck', 'violet'),
  ('Material Operacional', 'Wrench', 'slate'),
  ('Material Administrativo', 'FileText', 'gray'),
  ('EPI', 'Shield', 'rose'),
  ('Ferramentas', 'Hammer', 'stone'),
  ('Outros', 'MoreHorizontal', 'slate')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number SERIAL UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time VARCHAR(10),
  amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'Cartão Corporativo',
  unit_name VARCHAR(100) NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_info VARCHAR(150),
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  driver_name VARCHAR(150),
  cost_center VARCHAR(100) NOT NULL DEFAULT 'Operacional',
  supplier VARCHAR(150),
  city VARCHAR(100),
  responsible VARCHAR(150),
  is_reimbursable BOOLEAN DEFAULT FALSE,
  reimbursement_amount DECIMAL(12, 2) DEFAULT 0,
  reimbursement_payee VARCHAR(150),
  reimbursement_due_date DATE,
  reimbursement_status VARCHAR(50) DEFAULT 'Pendente',
  status VARCHAR(50) NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aguardando Aprovação', 'Aprovada', 'Reembolsada', 'Cancelada')),
  has_attachment BOOLEAN DEFAULT FALSE,
  notes TEXT,
  project VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  user_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_name);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_vehicle ON expenses(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_expenses_driver ON expenses(driver_id);
CREATE INDEX IF NOT EXISTS idx_expenses_unit ON expenses(unit_name);
