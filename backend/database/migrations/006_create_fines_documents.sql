-- Criação da tabela de Documentos
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  related_to VARCHAR(255),
  number VARCHAR(100),
  issue_date DATE,
  expiry_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  responsible VARCHAR(255),
  file_url TEXT,
  notes TEXT,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação da tabela de Multas
CREATE TABLE fines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_number VARCHAR(100) NOT NULL,
  infraction_date DATE NOT NULL,
  organ VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  value DECIMAL(10, 2) NOT NULL,
  points INTEGER DEFAULT 0,
  due_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL,
  file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para buscas rápidas
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_fines_status ON fines(status);
CREATE INDEX idx_fines_vehicle_id ON fines(vehicle_id);
CREATE INDEX idx_fines_driver_id ON fines(driver_id);
