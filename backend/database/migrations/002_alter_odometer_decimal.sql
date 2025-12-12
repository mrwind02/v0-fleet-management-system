-- Alterar coluna odometer_reading para DECIMAL
ALTER TABLE maintenance_records ALTER COLUMN odometer_reading TYPE DECIMAL(10, 2);
