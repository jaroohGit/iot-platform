// Simplified TimescaleDB placeholder - stores data in memory for now
class TimescaleDB {
  constructor() {
    this.sensorReadings = [];
    console.log('📊 Using in-memory data storage (TimescaleDB placeholder)');
  }
  
  static async insertSensorReading(deviceId, deviceType, location, data) {
    // Store reading in memory for now
    const reading = {
      device_id: deviceId,
      device_type: deviceType,
      location: location,
      ...data,
      timestamp: new Date().toISOString()
    };
    
    // Keep only last 1000 readings to prevent memory issues
    if (this.sensorReadings && this.sensorReadings.length > 1000) {
      this.sensorReadings = this.sensorReadings.slice(-500);
    }
    
    if (!this.sensorReadings) this.sensorReadings = [];
    this.sensorReadings.push(reading);
    
    return reading;
  }
  
  static async getDeviceSummary() {
    return { total_devices: 0, active_devices: 0 };
  }
  
  static async getAllLatestReadings() {
    return this.sensorReadings ? this.sensorReadings.slice(-10) : [];
  }
  
  static async getLatestReadingsByType(deviceType) {
    if (!this.sensorReadings) return [];
    return this.sensorReadings
      .filter(r => r.device_type === deviceType)
      .slice(-10);
  }
  
  static async getSensorReadings(deviceId, deviceType, startTime, endTime, limit = 100) {
    if (!this.sensorReadings) return [];
    return this.sensorReadings
      .filter(r => {
        if (deviceId && r.device_id !== deviceId) return false;
        if (deviceType && r.device_type !== deviceType) return false;
        return true;
      })
      .slice(-limit);
  }
  
  static async getHourlyAverages(deviceType, startTime, endTime) {
    return [];
  }
}

// Initialize static array
TimescaleDB.sensorReadings = [];

module.exports = TimescaleDB;
