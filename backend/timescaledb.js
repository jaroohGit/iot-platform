const { Pool } = require('pg');

// TimescaleDB connection configuration
const dbConfig = {
  user: 'iot_user',
  host: 'localhost',
  database: 'iot_sensors',
  password: 'iot_password123',
  port: 5432,
  ssl: false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to TimescaleDB');
});

pool.on('error', (err) => {
  console.error('❌ TimescaleDB connection error:', err);
});

// Database helper functions
class TimescaleDB {
  
  // Insert sensor reading
  static async insertSensorReading(deviceId, deviceType, location, data, metadata = null) {
    const query = `
      SELECT insert_sensor_reading($1, $2, $3, $4, $5)
    `;
    
    try {
      await pool.query(query, [deviceId, deviceType, location, JSON.stringify(data), metadata ? JSON.stringify(metadata) : null]);
      console.log(`📊 Inserted reading for ${deviceId}: ${JSON.stringify(data)}`);
      return true;
    } catch (error) {
      console.error('❌ Error inserting sensor reading:', error);
      return false;
    }
  }

  // Get latest readings by device type
  static async getLatestReadingsByType(deviceType) {
    const query = `
      SELECT * FROM get_latest_readings_by_type($1)
    `;
    
    try {
      const result = await pool.query(query, [deviceType]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting latest readings:', error);
      return [];
    }
  }

  // Get all latest readings
  static async getAllLatestReadings() {
    const query = `
      SELECT 
        device_id,
        device_type,
        time,
        data,
        location
      FROM latest_sensor_readings
      ORDER BY device_type, device_id
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting all latest readings:', error);
      return [];
    }
  }

  // Get device summary
  static async getDeviceSummary() {
    const query = `
      SELECT * FROM device_summary ORDER BY device_type
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting device summary:', error);
      return [];
    }
  }

  // Get sensor readings with time range
  static async getSensorReadings(deviceId = null, deviceType = null, startTime = null, endTime = null, limit = 100) {
    let query = `
      SELECT 
        device_id,
        device_type,
        time,
        data,
        location,
        metadata
      FROM sensor_readings
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 0;

    if (deviceId) {
      paramCount++;
      query += ` AND device_id = $${paramCount}`;
      params.push(deviceId);
    }

    if (deviceType) {
      paramCount++;
      query += ` AND device_type = $${paramCount}`;
      params.push(deviceType);
    }

    if (startTime) {
      paramCount++;
      query += ` AND time >= $${paramCount}`;
      params.push(startTime);
    }

    if (endTime) {
      paramCount++;
      query += ` AND time <= $${paramCount}`;
      params.push(endTime);
    }

    query += ` ORDER BY time DESC`;
    
    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
    }

    try {
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting sensor readings:', error);
      return [];
    }
  }

  // Update device status
  static async updateDeviceStatus(deviceId, status, errorMessage = null, metadata = null) {
    const query = `
      INSERT INTO device_status (device_id, device_type, status, error_message, metadata)
      SELECT $1, device_type, $2, $3, $4
      FROM device_status 
      WHERE device_id = $1 
      ORDER BY time DESC 
      LIMIT 1
    `;
    
    try {
      await pool.query(query, [
        deviceId, 
        status, 
        errorMessage, 
        metadata ? JSON.stringify(metadata) : null
      ]);
      console.log(`📱 Updated status for ${deviceId}: ${status}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating device status:', error);
      return false;
    }
  }

  // Get aggregated data (hourly averages)
  static async getHourlyAverages(deviceType, startTime, endTime) {
    const query = `
      SELECT 
        time_bucket('1 hour', time) AS hour,
        device_type,
        AVG((data->>'value')::numeric) as avg_value,
        MIN((data->>'value')::numeric) as min_value,
        MAX((data->>'value')::numeric) as max_value,
        COUNT(*) as reading_count
      FROM sensor_readings
      WHERE device_type = $1
        AND time >= $2
        AND time <= $3
        AND data->>'value' IS NOT NULL
      GROUP BY hour, device_type
      ORDER BY hour DESC
    `;

    try {
      const result = await pool.query(query, [deviceType, startTime, endTime]);
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting hourly averages:', error);
      return [];
    }
  }

  // Close connection pool
  static async close() {
    await pool.end();
    console.log('📊 TimescaleDB connection pool closed');
  }
}

module.exports = TimescaleDB;
