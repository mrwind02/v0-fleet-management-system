-- Make driver_id nullable in fuel_records
ALTER TABLE fuel_records ALTER COLUMN driver_id DROP NOT NULL;
