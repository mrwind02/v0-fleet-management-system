-- Create fuel_records table
CREATE TABLE IF NOT EXISTS fuel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  fuel_date DATE NOT NULL,
  gas_station_name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  odometer_reading DECIMAL(10, 3) NOT NULL,
  liters DECIMAL(10, 2) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX idx_fuel_records_vehicle ON fuel_records(vehicle_id);
CREATE INDEX idx_fuel_records_driver ON fuel_records(driver_id);
CREATE INDEX idx_fuel_records_date ON fuel_records(fuel_date);
