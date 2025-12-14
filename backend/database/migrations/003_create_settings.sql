-- Tabela de Configurações do Sistema
CREATE TABLE system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial value for Admin Registration (allowed by default to prevent lockout, or false?)
-- User said: "Sugira solução para que possa ser desabilitada".
-- I will init as 'true' so it works as before, then admin disables it.
INSERT INTO system_settings (key, value, description) 
VALUES ('allow_admin_register', 'true', 'Permite o registro público de contas de administrador');
