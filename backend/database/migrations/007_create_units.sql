CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir as unidades padrão
INSERT INTO units (name) VALUES 
('Matriz'),
('Filial Norte'),
('Filial Sul'),
('Centro Logístico');
