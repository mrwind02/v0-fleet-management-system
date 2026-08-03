-- Migration: 013_expand_units_table.sql
-- Adiciona colunas de endereço, contato e CNPJ à tabela units (filiais)
-- Gerado em: 2026-07-30

ALTER TABLE units
  ADD COLUMN IF NOT EXISTS code VARCHAR(20),
  ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20),
  ADD COLUMN IF NOT EXISTS cnpj_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS state VARCHAR(10),
  ADD COLUMN IF NOT EXISTS address VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS complement VARCHAR(100),
  ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100),
  ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30),
  ADD COLUMN IF NOT EXISTS email VARCHAR(150),
  ADD COLUMN IF NOT EXISTS manager VARCHAR(150),
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Ativa';

-- Atualiza os registros existentes com dados padrão
UPDATE units SET
  status = 'Ativa',
  code = CONCAT('FIL-', UPPER(SUBSTRING(id::text, 1, 4)))
WHERE status IS NULL;

COMMENT ON COLUMN units.cnpj IS 'CNPJ da filial (com máscara XX.XXX.XXX/XXXX-XX)';
COMMENT ON COLUMN units.cnpj_status IS 'Situação cadastral na Receita Federal (ATIVA, BAIXADA, etc.)';
COMMENT ON COLUMN units.code IS 'Código interno da filial (ex: SP-01, RJ-02)';
COMMENT ON COLUMN units.address IS 'Logradouro do endereço da filial';
COMMENT ON COLUMN units.address_number IS 'Número do endereço da filial';
COMMENT ON COLUMN units.complement IS 'Complemento do endereço';
COMMENT ON COLUMN units.neighborhood IS 'Bairro';
COMMENT ON COLUMN units.zip_code IS 'CEP (com máscara XXXXX-XXX)';
COMMENT ON COLUMN units.manager IS 'Nome do gestor responsável pela filial';
COMMENT ON COLUMN units.status IS 'Status operacional: Ativa ou Inativa';
