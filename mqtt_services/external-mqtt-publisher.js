const mqtt = require('mqtt')
const os = require('os')

// MQTT broker configuration
// Update BROKER_HOST with your server's actual IP address
const BROKER_HOST = process.env.MQTT_HOST || 'localhost' // Change to server IP
const BROKER_PORT = 1883
const BROKER_URL = `mqtt://${BROKER_HOST}:${BROKER_PORT}`

console.log('🚀 External MQTT Publisher for IoT Platform')
console.log('============================================')
console.log(`📡 Target Broker: ${BROKER_URL}`)
console.log(`💻 Publisher Host: ${os.hostname()} (${os.platform()})`)
console.log(`🆔 Publisher IP: ${getLocalIP()}`)
console.log('============================================\n')

// Get local IP address
function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }
  return 'localhost'
}

// Create MQTT client with detailed configuration
const client = mqtt.connect(BROKER_URL, {
  clientId: `external-publisher-${os.hostname()}-${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  keepalive: 60,
  username: '', // Add username if broker requires authentication
  password: '', // Add password if broker requires authentication
})

// Sample external device configurations
const devices = [
  {
    id: `ext_temp_${os.hostname()}`,
    type: 'temperature',
    location: `External - ${os.hostname()} Room`,
    topic: `iot/sensors/ext_temp_${os.hostname()}/data`,
    interval: 5000, // 5 seconds
    generateValue: () => (15 + Math.random() * 25).toFixed(2), // 15-40°C
    unit: '°C',
    description: 'External Temperature Sensor'
  },
  {
    id: `ext_humidity_${os.hostname()}`,
    type: 'humidity',
    location: `External - ${os.hostname()} Room`,
    topic: `iot/sensors/ext_humidity_${os.hostname()}/data`,
    interval: 7000, // 7 seconds
    generateValue: () => (40 + Math.random() * 50).toFixed(2), // 40-90%
    unit: '%',
    description: 'External Humidity Sensor'
  },
  {
    id: `ext_pressure_${os.hostname()}`,
    type: 'pressure',
    location: `External - ${os.hostname()} Lab`,
    topic: `iot/sensors/ext_pressure_${os.hostname()}/data`,
    interval: 8000, // 8 seconds
    generateValue: () => (990 + Math.random() * 30).toFixed(2), // 990-1020 hPa
    unit: 'hPa',
    description: 'External Pressure Sensor'
  },
  {
    id: `ext_light_${os.hostname()}`,
    type: 'light',
    location: `External - ${os.hostname()} Office`,
    topic: `iot/sensors/ext_light_${os.hostname()}/data`,
    interval: 6000, // 6 seconds
    generateValue: () => Math.floor(Math.random() * 1000), // 0-1000 lux
    unit: 'lux',
    description: 'External Light Sensor'
  },
  {
    id: `ext_device_${os.hostname()}`,
    type: 'actuator',
    location: `External - ${os.hostname()} Control Room`,
    topic: `iot/devices/ext_device_${os.hostname()}/status`,
    interval: 15000, // 15 seconds
    generateValue: () => Math.random() > 0.85 ? 'offline' : 'online', // 15% chance offline
    unit: 'status',
    description: 'External Control Device'
  }
]

const activeIntervals = []
let messageCount = 0
let startTime = new Date()

// Connection event
client.on('connect', function () {
  console.log(`✅ Connected to MQTT broker: ${BROKER_URL}`)
  console.log(`🆔 Client ID: ${client.options.clientId}`)
  console.log(`🔗 Connection established at: ${new Date().toISOString()}`)
  console.log(`📋 Publishing ${devices.length} device types:\n`)
  
  devices.forEach(device => {
    console.log(`   📡 ${device.id}`)
    console.log(`      Type: ${device.type}`)
    console.log(`      Topic: ${device.topic}`)
    console.log(`      Interval: ${device.interval}ms`)
    console.log(`      Description: ${device.description}\n`)
  })
  
  console.log('🎯 Starting data publishing...\n')
  
  // Start publishing data for each device
  devices.forEach(device => {
    const intervalId = setInterval(() => {
      publishDeviceData(device)
    }, device.interval)
    
    activeIntervals.push(intervalId)
  })
  
  // Publish initial connection message
  const connectionMessage = {
    publisherId: client.options.clientId,
    hostname: os.hostname(),
    platform: os.platform(),
    ip: getLocalIP(),
    deviceCount: devices.length,
    timestamp: new Date().toISOString(),
    status: 'connected'
  }
  
  client.publish('iot/system/publisher-status', JSON.stringify(connectionMessage), { qos: 1 })
})

// Function to publish device data
function publishDeviceData(device) {
  const value = device.generateValue()
  messageCount++
  
  let message = {}
  
  if (device.type === 'actuator') {
    message = {
      deviceId: device.id,
      deviceType: device.type,
      location: device.location,
      timestamp: new Date().toISOString(),
      status: value,
      uptime: Math.floor((new Date() - startTime) / 1000),
      lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: {
        firmware: '1.4.0',
        model: `EXT-${device.type.toUpperCase()}-2000`,
        serialNumber: `EXT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        externalClient: true,
        publisherHost: os.hostname(),
        publisherIP: getLocalIP(),
        messageNumber: messageCount
      }
    }
  } else {
    message = {
      deviceId: device.id,
      deviceType: device.type,
      location: device.location,
      timestamp: new Date().toISOString(),
      value: parseFloat(value),
      unit: device.unit,
      quality: Math.random() > 0.95 ? 'poor' : 'good', // 5% chance of poor quality
      batteryLevel: Math.max(20, Math.floor(Math.random() * 100)), // 20-100%
      signalStrength: Math.max(30, Math.floor(Math.random() * 100)), // 30-100%
      metadata: {
        firmware: '2.3.0',
        calibrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        serialNumber: `EXT${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        externalClient: true,
        publisherHost: os.hostname(),
        publisherIP: getLocalIP(),
        messageNumber: messageCount,
        sensorRange: device.type === 'temperature' ? '15-40°C' :
                     device.type === 'humidity' ? '40-90%' :
                     device.type === 'pressure' ? '990-1020hPa' :
                     device.type === 'light' ? '0-1000lux' : 'unknown'
      }
    }
  }
  
  client.publish(device.topic, JSON.stringify(message), { qos: 1, retain: false }, function (err) {
    if (!err) {
      const displayValue = device.type === 'actuator' ? value : value + device.unit
      const timestamp = new Date().toLocaleTimeString()
      console.log(`📤 [${timestamp}] ${device.id}: ${displayValue} → ${device.topic} (#${messageCount})`)
    } else {
      console.error(`❌ Failed to publish ${device.id}:`, err.message)
    }
  })
}

// Error event
client.on('error', function (err) {
  console.error('❌ MQTT Client Error:', err.message)
  if (err.code === 'ECONNREFUSED') {
    console.error('🔴 Connection refused. Please check:')
    console.error('   1. MQTT broker is running on the target server')
    console.error('   2. Firewall allows port 1883')
    console.error('   3. Server IP address is correct in BROKER_HOST')
    console.error('   4. Network connectivity between machines')
  }
  if (err.code === 'ENOTFOUND') {
    console.error('🔴 Host not found. Please verify:')
    console.error('   1. Server hostname/IP is correct')
    console.error('   2. DNS resolution is working')
    console.error('   3. Network connectivity exists')
  }
})

// Offline event
client.on('offline', function () {
  console.log('⚠️  Publisher offline - attempting to reconnect...')
})

// Reconnect event
client.on('reconnect', function () {
  console.log('🔄 Reconnecting to broker...')
})

// Close event
client.on('close', function () {
  console.log('🔌 Connection closed')
})

// Display publishing statistics every 30 seconds
setInterval(() => {
  if (client.connected) {
    const uptime = Math.floor((new Date() - startTime) / 1000)
    const rate = (messageCount / uptime).toFixed(2)
    console.log(`\n📊 Publisher Statistics:`)
    console.log(`   - Messages sent: ${messageCount}`)
    console.log(`   - Uptime: ${uptime} seconds`)
    console.log(`   - Message rate: ${rate} msg/sec`)
    console.log(`   - Active devices: ${devices.length}`)
  }
}, 30000)

// Graceful shutdown
process.on('SIGINT', function () {
  console.log('\n🛑 Shutting down external publisher...')
  
  // Send disconnection message
  if (client.connected) {
    const disconnectionMessage = {
      publisherId: client.options.clientId,
      hostname: os.hostname(),
      messagesSent: messageCount,
      uptime: Math.floor((new Date() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      status: 'disconnecting'
    }
    
    client.publish('iot/system/publisher-status', JSON.stringify(disconnectionMessage), { qos: 1 })
  }
  
  // Clear all intervals
  activeIntervals.forEach(intervalId => {
    clearInterval(intervalId)
  })
  
  console.log(`📊 Final Statistics:`)
  console.log(`   - Total messages sent: ${messageCount}`)
  console.log(`   - Session duration: ${Math.floor((new Date() - startTime) / 1000)} seconds`)
  
  client.end(true, function () {
    console.log('✅ External publisher disconnected')
    process.exit(0)
  })
})

// Usage instructions on startup
console.log('\n📝 Usage Instructions:')
console.log('1. Update BROKER_HOST environment variable or modify script')
console.log('   Example: MQTT_HOST=192.168.1.100 npm run external-publisher')
console.log('2. Ensure MQTT broker is running on target server')
console.log('3. Ensure firewall allows port 1883 on target server')
console.log('4. Press Ctrl+C to stop publishing')
console.log('5. Monitor broker logs to see incoming messages\n')
