-- Migration 010: Create Work Orders module tables
-- Work Orders (OS) is the central entity for all maintenance operations

CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identification
  number SERIAL UNIQUE NOT NULL,
  
  -- Classification
  type VARCHAR(50) NOT NULL CHECK (type IN ('Preventiva', 'Corretiva', 'Emergencial', 'Revisão', 'Garantia')),
  status VARCHAR(50) NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Aguardando Aprovação', 'Aguardando Peças', 'Em Execução', 'Pausada', 'Concluída', 'Cancelada')),
  priority VARCHAR(20) NOT NULL DEFAULT 'Média' CHECK (priority IN ('Baixa', 'Média', 'Alta', 'Crítica')),
  
  -- Relationships
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  unit VARCHAR(100),
  
  -- Workshop
  workshop_name VARCHAR(150),
  workshop_type VARCHAR(20) DEFAULT 'Externa' CHECK (workshop_type IN ('Interna', 'Externa')),
  responsible VARCHAR(150),
  
  -- Origin
  origin VARCHAR(50) DEFAULT 'Manual' CHECK (origin IN ('Manual', 'Checklist', 'Preventiva', 'Telemetria', 'Multa', 'Inspeção')),
  origin_ref_id UUID, -- reference to checklist/preventive record if applicable
  
  -- Description
  description TEXT,
  diagnosis TEXT,
  notes TEXT,
  
  -- Dates
  opened_at TIMESTAMP NOT NULL DEFAULT NOW(),
  estimated_at TIMESTAMP,
  closed_at TIMESTAMP,
  
  -- Odometer
  km_opening DECIMAL(12, 2),
  km_closing DECIMAL(12, 2),
  
  -- Costs (auto-calculated from parts + services)
  cost_parts DECIMAL(12, 2) DEFAULT 0,
  cost_labor DECIMAL(12, 2) DEFAULT 0,
  cost_towing DECIMAL(12, 2) DEFAULT 0,
  cost_others DECIMAL(12, 2) DEFAULT 0,
  cost_total DECIMAL(12, 2) GENERATED ALWAYS AS (
    COALESCE(cost_parts, 0) + COALESCE(cost_labor, 0) + COALESCE(cost_towing, 0) + COALESCE(cost_others, 0)
  ) STORED,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Services performed in the work order
CREATE TABLE IF NOT EXISTS work_order_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_time_hours DECIMAL(8, 2),
  unit_price DECIMAL(12, 2) DEFAULT 0,
  total_price DECIMAL(12, 2) GENERATED ALWAYS AS (
    COALESCE(quantity, 1) * COALESCE(unit_price, 0)
  ) STORED,
  responsible VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parts used in the work order
CREATE TABLE IF NOT EXISTS work_order_parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  part_code VARCHAR(100),
  supplier VARCHAR(150),
  quantity DECIMAL(10, 3) DEFAULT 1,
  unit_price DECIMAL(12, 2) DEFAULT 0,
  total_price DECIMAL(12, 2) GENERATED ALWAYS AS (
    COALESCE(quantity, 1) * COALESCE(unit_price, 0)
  ) STORED,
  situation VARCHAR(50) DEFAULT 'Disponível' CHECK (situation IN ('Disponível', 'Aguardando', 'Pedido', 'Chegou', 'Instalado')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- History / audit timeline
CREATE TABLE IF NOT EXISTS work_order_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'status_change', 'created', 'part_added', 'service_added', 'cost_updated', 'file_uploaded', 'note_added'
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  user_name VARCHAR(150),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_opened_at ON work_orders(opened_at);
CREATE INDEX IF NOT EXISTS idx_work_orders_type ON work_orders(type);
CREATE INDEX IF NOT EXISTS idx_work_order_services_wo ON work_order_services(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_parts_wo ON work_order_parts(work_order_id);
CREATE INDEX IF NOT EXISTS idx_work_order_history_wo ON work_order_history(work_order_id);
