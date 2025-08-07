const mqtt = require('mqtt')

// Configuration - Change this IP to your broker's IP address
const BROKER_HOST = process.env.BROKER_HOST || 'localhost' // Change to broker PC's IP
const BROKER_PORT = process.env.BROKER_PORT || 1883
const BROKER_URL = `mqtt://${BROKER_HOST}:${BROKER_PORT}`

console.log('🚀 MQTT Test Publisher')
console.log('=====================')
console.log(`📡 Broker: ${BROKER_URL}`)
console.log(`🆔 Client ID: mqtt-test-publisher-${Math.random().toString(16).slice(3)}`)
console.log('=====================\n')

// Create MQTT client
const client = mqtt.connect(BROKER_URL, {
  clientId: `mqtt-test-publisher-${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
})

// Connection events
client.on('connect', function () {
  console.log('✅ Connected to MQTT broker successfully!')
  console.log(`📡 Broker: ${BROKER_URL}`)
  console.log(`🆔 Client ID: ${client.options.clientId}`)
  console.log('🎯 Starting to publish test messages...\n')
  
  // Start publishing test data
  startPublishing()
})

client.on('error', function (err) {
  console.error('❌ Connection error:', err.message)
  console.error('💡 Make sure the MQTT broker is running and accessible')
  console.error(`💡 Check if ${BROKER_HOST}:${BROKER_PORT} is reachable from this machine`)
})

client.on('offline', function () {
  console.log('⚠️  Client offline')
})

client.on('reconnect', function () {
  console.log('🔄 Reconnecting to broker...')
})

client.on('close', function () {
  console.log('🔌 Connection closed')
})

// Test data generators
function generateSensorData() {
  const sensorTypes = [
    {
      deviceId: 'TEMP_001',
      deviceType: 'temperature',
      topic: 'iot/sensors/temp001/data',
      value: () => (20 + Math.random() * 15).toFixed(2),
      unit: '°C',
      location: 'Building A - Room 101'
    },
    {
      deviceId: 'HUM_001',
      deviceType: 'humidity',
      topic: 'iot/sensors/humidity001/data',
      value: () => (30 + Math.random() * 40).toFixed(2),
      unit: '%',
      location: 'Building A - Room 101'
    },
    {
      deviceId: 'PRESS_001',
      deviceType: 'pressure',
      topic: 'iot/sensors/pressure001/data',
      value: () => (980 + Math.random() * 40).toFixed(2),
      unit: 'hPa',
      location: 'Building A - HVAC System'
    },
    {
      deviceId: 'FLOW_001',
      deviceType: 'flow_rate',
      topic: 'iot/sensors/flow001/data',
      value: () => (120 + Math.random() * 15).toFixed(1),
      unit: 'L/h',
      location: 'Treatment Plant - Tank 1'
    },
    {
      deviceId: 'PH_001',
      deviceType: 'ph_level',
      topic: 'iot/sensors/ph001/data',
      value: () => (6.8 + Math.random() * 1.4).toFixed(1),
      unit: 'pH',
      location: 'Treatment Plant - Monitor 1'
    },
    {
      deviceId: 'ORP_001',
      deviceType: 'orp_level',
      topic: 'iot/sensors/orp001/data',
      value: () => Math.floor(400 + Math.random() * 100),
      unit: 'mV',
      location: 'Treatment Plant - Pool 1'
    }
  ]
  
  return sensorTypes[Math.floor(Math.random() * sensorTypes.length)]
}

function generateDeviceStatus() {
  const devices = [
    {
      deviceId: 'PUMP_001',
      deviceType: 'actuator',
      topic: 'iot/devices/pump001/status',
      status: Math.random() > 0.8 ? 'offline' : 'online',
      location: 'Treatment Plant - Pump Station'
    },
    {
      deviceId: 'VALVE_001',
      deviceType: 'actuator',
      topic: 'iot/devices/valve001/status',
      status: Math.random() > 0.9 ? 'maintenance' : 'online',
      location: 'Treatment Plant - Control Valve'
    }
  ]
  
  return devices[Math.floor(Math.random() * devices.length)]
}

function generateSystemAlert() {
  const alerts = [
    {
      level: 'info',
      message: 'System backup completed successfully',
      source: 'backup-system',
      topic: 'iot/system/alerts'
    },
    {
      level: 'warning',
      message: 'High temperature detected in sensor room',
      source: 'monitoring-system',
      topic: 'iot/system/alerts'
    },
    {
      level: 'error',
      message: 'Communication timeout with device PUMP_001',
      source: 'network-monitor',
      topic: 'iot/system/alerts'
    }
  ]
  
  return alerts[Math.floor(Math.random() * alerts.length)]
}

// Publishing functions
function publishSensorData() {
  const sensor = generateSensorData()
  
  const message = {
    deviceId: sensor.deviceId,
    deviceType: sensor.deviceType,
    location: sensor.location,
    timestamp: new Date().toISOString(),
    value: parseFloat(sensor.value()),
    unit: sensor.unit,
    quality: Math.random() > 0.95 ? 'poor' : 'good',
    batteryLevel: Math.floor(Math.random() * 100),
    signalStrength: Math.floor(Math.random() * 100),
    metadata: {
      firmware: '2.1.0',
      calibrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
  }
  
  client.publish(sensor.topic, JSON.stringify(message), { qos: 1 }, (err) => {
    if (!err) {
      console.log(`📤 Sensor: ${sensor.deviceId} → ${sensor.topic}`)
      console.log(`   Value: ${message.value}${message.unit} | Quality: ${message.quality}`)
    } else {
      console.error(`❌ Failed to publish sensor data:`, err.message)
    }
  })
}

function publishDeviceStatus() {
  const device = generateDeviceStatus()
  
  const message = {
    deviceId: device.deviceId,
    deviceType: device.deviceType,
    location: device.location,
    timestamp: new Date().toISOString(),
    status: device.status,
    uptime: Math.floor(Math.random() * 86400),
    lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      firmware: '1.5.2',
      model: device.deviceType === 'pump' ? 'P-2000' : 'V-500',
      serialNumber: `SN${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
  }
  
  client.publish(device.topic, JSON.stringify(message), { qos: 1 }, (err) => {
    if (!err) {
      console.log(`📤 Device: ${device.deviceId} → ${device.topic}`)
      console.log(`   Status: ${message.status} | Uptime: ${message.uptime}s`)
    } else {
      console.error(`❌ Failed to publish device status:`, err.message)
    }
  })
}

function publishSystemAlert() {
  const alert = generateSystemAlert()
  
  const message = {
    level: alert.level,
    message: alert.message,
    source: alert.source,
    timestamp: new Date().toISOString(),
    alertId: `ALT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    acknowledged: false
  }
  
  client.publish(alert.topic, JSON.stringify(message), { qos: 1 }, (err) => {
    if (!err) {
      console.log(`🚨 Alert: ${alert.level.toUpperCase()} → ${alert.topic}`)
      console.log(`   Message: ${message.message}`)
    } else {
      console.error(`❌ Failed to publish alert:`, err.message)
    }
  })
}

function publishCustomMessage() {
  const customTopics = [
    'custom/analytics/performance',
    'custom/maintenance/schedule',
    'custom/energy/consumption',
    'test/data/sample'
  ]
  
  const topic = customTopics[Math.floor(Math.random() * customTopics.length)]
  const message = {
    source: 'external-publisher',
    timestamp: new Date().toISOString(),
    data: {
      value: Math.random() * 100,
      status: 'active',
      info: 'Custom message from external publisher'
    }
  }
  
  client.publish(topic, JSON.stringify(message), { qos: 0 }, (err) => {
    if (!err) {
      console.log(`📤 Custom: ${topic}`)
      console.log(`   Data: ${JSON.stringify(message.data)}`)
    } else {
      console.error(`❌ Failed to publish custom message:`, err.message)
    }
  })
}

// Start publishing
function startPublishing() {
  // Publish sensor data every 3-8 seconds
  setInterval(() => {
    publishSensorData()
  }, 3000 + Math.random() * 5000)
  
  // Publish device status every 10-20 seconds
  setInterval(() => {
    publishDeviceStatus()
  }, 10000 + Math.random() * 10000)
  
  // Publish system alerts every 20-40 seconds
  setInterval(() => {
    if (Math.random() > 0.7) { // 30% chance
      publishSystemAlert()
    }
  }, 20000 + Math.random() * 20000)
  
  // Publish custom messages every 15-25 seconds
  setInterval(() => {
    publishCustomMessage()
  }, 15000 + Math.random() * 10000)
  
  // Immediate first publish
  setTimeout(publishSensorData, 1000)
  setTimeout(publishDeviceStatus, 2000)
  setTimeout(publishCustomMessage, 3000)
}

// Graceful shutdown
process.on('SIGINT', function () {
  console.log('\n🛑 Shutting down publisher...')
  client.end(true, function () {
    console.log('✅ Publisher disconnected')
    process.exit(0)
  })
})
