ALTER TABLE vehicles ADD COLUMN unit_id UUID REFERENCES units(id) ON DELETE SET NULL;
ALTER TABLE vehicles ADD COLUMN unit_name VARCHAR(255);
ALTER TABLE vehicles ADD COLUMN status VARCHAR(50) DEFAULT 'operando' CHECK (status IN ('operando', 'manutencao', 'oficina', 'inativo', 'vendido'));

-- Update existing vehicles with default values
UPDATE vehicles SET status = 'operando' WHERE status IS NULL;
