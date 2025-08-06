-- Setup TimescaleDB for IoT Sensor Data Collection
-- Connect to iot_sensors database

\c iot_sensors;

-- Create TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS sensor_readings CASCADE;
DROP TABLE IF EXISTS device_status CASCADE;

-- Create sensor_readings table with JSON data
CREATE TABLE sensor_readings (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_type VARCHAR(50) NOT NULL,
    device_id VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    data JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert to hypertable (TimescaleDB)
SELECT create_hypertable('sensor_readings', 'time');

-- Create device_status table
CREATE TABLE device_status (
    time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_id VARCHAR(50) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'operational',
    last_reading TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Convert to hypertable
SELECT create_hypertable('device_status', 'time');

-- Create indexes for better performance
CREATE INDEX idx_sensor_readings_device_type_time ON sensor_readings (device_type, time DESC);
CREATE INDEX idx_sensor_readings_device_id_time ON sensor_readings (device_id, time DESC);
CREATE INDEX idx_sensor_readings_data_gin ON sensor_readings USING GIN (data);

CREATE INDEX idx_device_status_device_id_time ON device_status (device_id, time DESC);
CREATE INDEX idx_device_status_type_time ON device_status (device_type, time DESC);

-- Insert sample device configurations
INSERT INTO device_status (device_id, device_type, status, metadata) VALUES
-- Flow Rate Devices (3 devices)
('FR001', 'flow_rate', 'operational', '{"location": "Tank A", "range": "120-135 L/h", "calibration_date": "2025-01-01"}'),
('FR002', 'flow_rate', 'operational', '{"location": "Tank B", "range": "120-135 L/h", "calibration_date": "2025-01-01"}'),
('FR003', 'flow_rate', 'operational', '{"location": "Tank C", "range": "120-135 L/h", "calibration_date": "2025-01-01"}'),

-- ORP Devices (6 devices)
('ORP001', 'orp_level', 'operational', '{"location": "Treatment Pool 1", "range": "400-500 mV", "calibration_date": "2025-01-01"}'),
('ORP002', 'orp_level', 'operational', '{"location": "Treatment Pool 2", "range": "400-500 mV", "calibration_date": "2025-01-01"}'),
('ORP003', 'orp_level', 'operational', '{"location": "Treatment Pool 3", "range": "400-500 mV", "calibration_date": "2025-01-01"}'),
('ORP004', 'orp_level', 'operational', '{"location": "Treatment Pool 4", "range": "400-500 mV", "calibration_date": "2025-01-01"}'),
('ORP005', 'orp_level', 'operational', '{"location": "Treatment Pool 5", "range": "400-500 mV", "calibration_date": "2025-01-01"}'),
('ORP006', 'orp_level', 'operational', '{"location": "Treatment Pool 6", "range": "400-500 mV", "calibration_date": "2025-01-01"}'),

-- pH Devices (6 devices)
('PH001', 'ph_level', 'operational', '{"location": "pH Monitor 1", "range": "6.8-7.8 pH", "calibration_date": "2025-01-01"}'),
('PH002', 'ph_level', 'operational', '{"location": "pH Monitor 2", "range": "6.8-7.8 pH", "calibration_date": "2025-01-01"}'),
('PH003', 'ph_level', 'operational', '{"location": "pH Monitor 3", "range": "6.8-7.8 pH", "calibration_date": "2025-01-01"}'),
('PH004', 'ph_level', 'operational', '{"location": "pH Monitor 4", "range": "6.8-7.8 pH", "calibration_date": "2025-01-01"}'),
('PH005', 'ph_level', 'operational', '{"location": "pH Monitor 5", "range": "6.8-7.8 pH", "calibration_date": "2025-01-01"}'),
('PH006', 'ph_level', 'operational', '{"location": "pH Monitor 6", "range": "6.8-7.8 pH", "calibration_date": "2025-01-01"}'),

-- Power Meter (1 device)
('PM001', 'power_meter', 'operational', '{"location": "Main Panel", "range": "2.0-3.5 kW", "calibration_date": "2025-01-01"}');

-- Create views for easy data access
CREATE VIEW latest_sensor_readings AS
SELECT DISTINCT ON (device_id) 
    device_id,
    device_type,
    time,
    data,
    location
FROM sensor_readings
ORDER BY device_id, time DESC;

-- Create view for device summary
CREATE VIEW device_summary AS
SELECT 
    device_type,
    COUNT(*) as total_devices,
    COUNT(CASE WHEN status = 'operational' THEN 1 END) as operational_devices,
    COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_devices,
    COUNT(CASE WHEN status = 'error' THEN 1 END) as error_devices
FROM device_status
WHERE time = (SELECT MAX(time) FROM device_status ds2 WHERE ds2.device_id = device_status.device_id)
GROUP BY device_type;

-- Insert sample sensor readings
INSERT INTO sensor_readings (device_id, device_type, location, data) VALUES
-- Flow Rate sample data
('FR001', 'flow_rate', 'Tank A', '{"value": 127.5, "unit": "L/h", "quality": "good", "temperature": 25.2}'),
('FR002', 'flow_rate', 'Tank B', '{"value": 132.1, "unit": "L/h", "quality": "good", "temperature": 24.8}'),
('FR003', 'flow_rate', 'Tank C', '{"value": 125.7, "unit": "L/h", "quality": "good", "temperature": 25.5}'),

-- ORP sample data
('ORP001', 'orp_level', 'Treatment Pool 1', '{"value": 450, "unit": "mV", "quality": "good", "temperature": 22.1}'),
('ORP002', 'orp_level', 'Treatment Pool 2', '{"value": 465, "unit": "mV", "quality": "good", "temperature": 22.3}'),
('ORP003', 'orp_level', 'Treatment Pool 3', '{"value": 442, "unit": "mV", "quality": "good", "temperature": 21.9}'),
('ORP004', 'orp_level', 'Treatment Pool 4', '{"value": 478, "unit": "mV", "quality": "good", "temperature": 22.5}'),
('ORP005', 'orp_level', 'Treatment Pool 5', '{"value": 456, "unit": "mV", "quality": "good", "temperature": 22.2}'),
('ORP006', 'orp_level', 'Treatment Pool 6', '{"value": 461, "unit": "mV", "quality": "good", "temperature": 22.0}'),

-- pH sample data
('PH001', 'ph_level', 'pH Monitor 1', '{"value": 7.2, "unit": "pH", "quality": "good", "temperature": 23.1}'),
('PH002', 'ph_level', 'pH Monitor 2', '{"value": 7.1, "unit": "pH", "quality": "good", "temperature": 23.2}'),
('PH003', 'ph_level', 'pH Monitor 3', '{"value": 7.3, "unit": "pH", "quality": "good", "temperature": 23.0}'),
('PH004', 'ph_level', 'pH Monitor 4', '{"value": 7.0, "unit": "pH", "quality": "good", "temperature": 23.3}'),
('PH005', 'ph_level', 'pH Monitor 5', '{"value": 7.4, "unit": "pH", "quality": "good", "temperature": 22.9}'),
('PH006', 'ph_level', 'pH Monitor 6', '{"value": 7.2, "unit": "pH", "quality": "good", "temperature": 23.1}'),

-- Power Meter sample data
('PM001', 'power_meter', 'Main Panel', '{"value": 2.75, "unit": "kW", "quality": "good", "power_factor": 0.95, "voltage": 230.5, "current": 12.3}');

-- Create function to insert sensor reading
CREATE OR REPLACE FUNCTION insert_sensor_reading(
    p_device_id VARCHAR(50),
    p_device_type VARCHAR(50),
    p_location VARCHAR(100),
    p_data JSONB,
    p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO sensor_readings (device_id, device_type, location, data, metadata)
    VALUES (p_device_id, p_device_type, p_location, p_data, p_metadata);
    
    -- Update device status last_reading time
    UPDATE device_status 
    SET last_reading = NOW()
    WHERE device_id = p_device_id 
    AND time = (SELECT MAX(time) FROM device_status WHERE device_id = p_device_id);
END;
$$ LANGUAGE plpgsql;

-- Create function to get latest readings by device type
CREATE OR REPLACE FUNCTION get_latest_readings_by_type(p_device_type VARCHAR(50))
RETURNS TABLE (
    device_id VARCHAR(50),
    time TIMESTAMPTZ,
    location VARCHAR(100),
    data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (sr.device_id) 
        sr.device_id,
        sr.time,
        sr.location,
        sr.data
    FROM sensor_readings sr
    WHERE sr.device_type = p_device_type
    ORDER BY sr.device_id, sr.time DESC;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions to iot_user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iot_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iot_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO iot_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO iot_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO iot_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO iot_user;

-- Display setup summary
SELECT 'TimescaleDB setup completed successfully!' as status;
SELECT 'Database: iot_sensors' as database_name;
SELECT 'User: iot_user' as database_user;
SELECT 'Tables created: sensor_readings, device_status' as tables;
SELECT 'Hypertables: sensor_readings, device_status' as hypertables;

-- Show device summary
SELECT * FROM device_summary ORDER BY device_type;
