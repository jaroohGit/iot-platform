const mqtt = require('mqtt')
const os = require('os')

// MQTT broker configuration
const BROKER_HOST = process.env.MQTT_HOST || 'localhost'
const BROKER_PORT = 1883
const BROKER_URL = `mqtt://${BROKER_HOST}:${BROKER_PORT}`

console.log('📡 MQTT Universal Subscriber')
console.log('===========================')
console.log(`🔗 Broker: ${BROKER_URL}`)
console.log(`💻 Subscriber Host: ${os.hostname()} (${os.platform()})`)
console.log(`🆔 Subscriber IP: ${getLocalIP()}`)
console.log('===========================\n')

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
  clientId: `mqtt-subscriber-${os.hostname()}-${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
  keepalive: 60,
  username: '', // Add username if broker requires authentication
  password: '', // Add password if broker requires authentication
})

// Message statistics
let messageCount = 0
let topicStats = new Map()
let deviceStats = new Map()
let startTime = new Date()

// Topic patterns to subscribe to
const subscriptions = [
  'iot/+/+/+',           // iot/sensors/device/data, iot/devices/device/status
  'iot/system/+',        // system messages
  'iot/analytics/+',     // analytics data
  'custom/+/+',          // custom topics
  '+/+/+',               // catch-all for 3-level topics
  '#',                   // catch everything else (wildcard)
]

// Connection event
client.on('connect', function () {
  console.log(`✅ Connected to MQTT broker: ${BROKER_URL}`)
  console.log(`🆔 Client ID: ${client.options.clientId}`)
  console.log(`🔗 Connection established at: ${new Date().toISOString()}`)
  console.log(`📋 Subscribing to topic patterns:\n`)
  
  // Subscribe to all defined patterns
  subscriptions.forEach((pattern, index) => {
    client.subscribe(pattern, { qos: 1 }, function (err, granted) {
      if (!err) {
        console.log(`   ✅ [${index + 1}/${subscriptions.length}] Subscribed to: ${pattern}`)
        if (granted) {
          granted.forEach(sub => {
            console.log(`      └─ Topic: ${sub.topic}, QoS: ${sub.qos}`)
          })
        }
      } else {
        console.log(`   ❌ [${index + 1}/${subscriptions.length}] Failed to subscribe to: ${pattern}`)
        console.error(`      Error: ${err.message}`)
      }
    })
  })
  
  console.log(`\n🎯 Listening for messages on all topics...`)
  console.log(`📊 Statistics will be shown every 30 seconds`)
  console.log(`🔄 Press Ctrl+C to stop subscriber\n`)
})

// Message event - handle all incoming messages
client.on('message', function (topic, message, packet) {
  messageCount++
  const timestamp = new Date().toLocaleTimeString()
  
  // Update topic statistics
  if (!topicStats.has(topic)) {
    topicStats.set(topic, { count: 0, firstSeen: new Date(), lastSeen: new Date() })
  }
  const topicStat = topicStats.get(topic)
  topicStat.count++
  topicStat.lastSeen = new Date()
  
  console.log(`\n📨 [${timestamp}] Message #${messageCount}`)
  console.log(`📋 Topic: ${topic}`)
  console.log(`🔧 QoS: ${packet.qos} | Retain: ${packet.retain} | Dup: ${packet.dup}`)
  console.log(`📏 Payload Size: ${message.length} bytes`)
  
  // Try to parse JSON payload
  try {
    const data = JSON.parse(message.toString())
    
    console.log(`📦 Parsed Data:`)
    
    // Handle different message types
    if (data.deviceId && data.deviceType) {
      // Standard IoT device message
      console.log(`   🏷️  Device ID: ${data.deviceId}`)
      console.log(`   🔧 Device Type: ${data.deviceType}`)
      console.log(`   📍 Location: ${data.location || 'Unknown'}`)
      console.log(`   📅 Timestamp: ${data.timestamp}`)
      
      if (data.value !== undefined) {
        console.log(`   📊 Value: ${data.value}${data.unit || ''}`)
        console.log(`   ✨ Quality: ${data.quality || 'Unknown'}`)
      }
      
      if (data.status !== undefined) {
        console.log(`   🔋 Status: ${data.status}`)
      }
      
      if (data.batteryLevel !== undefined) {
        console.log(`   🔋 Battery: ${data.batteryLevel}%`)
      }
      
      if (data.signalStrength !== undefined) {
        console.log(`   📶 Signal: ${data.signalStrength}%`)
      }
      
      // Metadata information
      if (data.metadata) {
        console.log(`   🏷️  Metadata:`)
        if (data.metadata.publisherHost) {
          console.log(`      └─ Publisher Host: ${data.metadata.publisherHost}`)
        }
        if (data.metadata.publisherIP) {
          console.log(`      └─ Publisher IP: ${data.metadata.publisherIP}`)
        }
        if (data.metadata.messageNumber) {
          console.log(`      └─ Message #: ${data.metadata.messageNumber}`)
        }
        if (data.metadata.firmware) {
          console.log(`      └─ Firmware: ${data.metadata.firmware}`)
        }
        if (data.metadata.serialNumber) {
          console.log(`      └─ Serial: ${data.metadata.serialNumber}`)
        }
      }
      
      // Update device statistics
      const deviceKey = `${data.deviceType}:${data.deviceId}`
      if (!deviceStats.has(deviceKey)) {
        deviceStats.set(deviceKey, { 
          count: 0, 
          firstSeen: new Date(), 
          lastSeen: new Date(),
          deviceType: data.deviceType,
          deviceId: data.deviceId,
          location: data.location
        })
      }
      const deviceStat = deviceStats.get(deviceKey)
      deviceStat.count++
      deviceStat.lastSeen = new Date()
      
    } else if (data.publisherId && data.hostname) {
      // Publisher status message
      console.log(`   🖥️  Publisher Status:`)
      console.log(`      └─ Publisher ID: ${data.publisherId}`)
      console.log(`      └─ Hostname: ${data.hostname}`)
      console.log(`      └─ Platform: ${data.platform}`)
      console.log(`      └─ IP: ${data.ip}`)
      console.log(`      └─ Status: ${data.status}`)
      if (data.deviceCount) {
        console.log(`      └─ Device Count: ${data.deviceCount}`)
      }
      if (data.messagesSent) {
        console.log(`      └─ Messages Sent: ${data.messagesSent}`)
      }
      
    } else {
      // Generic JSON message
      console.log(`   📄 JSON Data:`)
      Object.keys(data).forEach(key => {
        const value = data[key]
        if (typeof value === 'object') {
          console.log(`      ${key}: ${JSON.stringify(value)}`)
        } else {
          console.log(`      ${key}: ${value}`)
        }
      })
    }
    
  } catch (e) {
    // Non-JSON payload
    const payloadStr = message.toString()
    console.log(`   📄 Raw Payload: ${payloadStr}`)
    
    // Try to detect payload type
    if (payloadStr.match(/^\d+\.?\d*$/)) {
      console.log(`   🔢 Detected: Numeric value`)
    } else if (payloadStr.match(/^(true|false)$/i)) {
      console.log(`   ☑️  Detected: Boolean value`)
    } else if (payloadStr.match(/^\d{4}-\d{2}-\d{2}/)) {
      console.log(`   📅 Detected: Date/timestamp`)
    } else {
      console.log(`   📝 Detected: Text message`)
    }
  }
  
  console.log(`${'─'.repeat(80)}`)
})

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
  console.log('⚠️  Subscriber offline - attempting to reconnect...')
})

// Reconnect event
client.on('reconnect', function () {
  console.log('🔄 Reconnecting to broker...')
})

// Close event
client.on('close', function () {
  console.log('🔌 Connection closed')
})

// Display comprehensive statistics every 30 seconds
setInterval(() => {
  if (client.connected && messageCount > 0) {
    const uptime = Math.floor((new Date() - startTime) / 1000)
    const rate = (messageCount / uptime).toFixed(2)
    
    console.log(`\n📊 Subscriber Statistics (${new Date().toISOString()}):`)
    console.log(`${'═'.repeat(60)}`)
    console.log(`📈 Messages: ${messageCount} total (${rate} msg/sec)`)
    console.log(`⏱️  Uptime: ${uptime} seconds`)
    console.log(`📡 Active Topics: ${topicStats.size}`)
    console.log(`🏷️  Active Devices: ${deviceStats.size}`)
    
    // Top 5 most active topics
    const sortedTopics = Array.from(topicStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
    
    if (sortedTopics.length > 0) {
      console.log(`\n🔥 Top Active Topics:`)
      sortedTopics.forEach(([topic, stats], index) => {
        const rate = (stats.count / uptime).toFixed(2)
        console.log(`   ${index + 1}. ${topic} (${stats.count} msgs, ${rate}/sec)`)
      })
    }
    
    // Device type summary
    const deviceTypes = new Map()
    deviceStats.forEach((stats, deviceKey) => {
      const type = stats.deviceType
      if (!deviceTypes.has(type)) {
        deviceTypes.set(type, { count: 0, devices: 0 })
      }
      const typeStats = deviceTypes.get(type)
      typeStats.count += stats.count
      typeStats.devices++
    })
    
    if (deviceTypes.size > 0) {
      console.log(`\n🏷️  Device Types Summary:`)
      Array.from(deviceTypes.entries()).forEach(([type, stats]) => {
        console.log(`   📊 ${type}: ${stats.devices} devices, ${stats.count} messages`)
      })
    }
    
    console.log(`${'═'.repeat(60)}\n`)
  }
}, 30000)

// Show active devices every 60 seconds
setInterval(() => {
  if (client.connected && deviceStats.size > 0) {
    console.log(`\n🏷️  Active Devices Report (${new Date().toISOString()}):`)
    console.log(`${'═'.repeat(80)}`)
    
    const sortedDevices = Array.from(deviceStats.entries())
      .sort((a, b) => b[1].lastSeen - a[1].lastSeen)
    
    sortedDevices.forEach(([deviceKey, stats]) => {
      const timeSinceLastMsg = Math.floor((new Date() - stats.lastSeen) / 1000)
      const uptime = Math.floor((stats.lastSeen - stats.firstSeen) / 1000)
      const status = timeSinceLastMsg < 60 ? '🟢 Active' : 
                    timeSinceLastMsg < 300 ? '🟡 Quiet' : '🔴 Inactive'
      
      console.log(`${status} ${stats.deviceId} (${stats.deviceType})`)
      console.log(`   📍 Location: ${stats.location || 'Unknown'}`)
      console.log(`   📊 Messages: ${stats.count} (${uptime}s active)`)
      console.log(`   🕐 Last seen: ${timeSinceLastMsg}s ago`)
      console.log(`   ─────────────────────────────────────────`)
    })
    
    console.log(`${'═'.repeat(80)}\n`)
  }
}, 60000)

// Graceful shutdown
process.on('SIGINT', function () {
  console.log('\n🛑 Shutting down MQTT subscriber...')
  
  const uptime = Math.floor((new Date() - startTime) / 1000)
  const rate = uptime > 0 ? (messageCount / uptime).toFixed(2) : '0.00'
  
  console.log(`📊 Final Statistics:`)
  console.log(`   - Total messages received: ${messageCount}`)
  console.log(`   - Session duration: ${uptime} seconds`)
  console.log(`   - Average rate: ${rate} messages/second`)
  console.log(`   - Unique topics: ${topicStats.size}`)
  console.log(`   - Unique devices: ${deviceStats.size}`)
  
  if (topicStats.size > 0) {
    console.log(`\n📋 Topic Summary:`)
    const sortedTopics = Array.from(topicStats.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
    
    sortedTopics.forEach(([topic, stats], index) => {
      console.log(`   ${index + 1}. ${topic}: ${stats.count} messages`)
    })
  }
  
  client.end(true, function () {
    console.log('✅ MQTT subscriber disconnected')
    process.exit(0)
  })
})

// Handle process termination
process.on('SIGTERM', function () {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
  process.emit('SIGINT')
})

// Usage instructions on startup
console.log('📝 Usage Instructions:')
console.log('1. Ensure MQTT broker is running')
console.log('2. Set BROKER_HOST environment variable if needed')
console.log('   Example: MQTT_HOST=192.168.1.100 node mqtt_subscriber.js')
console.log('3. Start publishers to see messages')
console.log('4. Press Ctrl+C to stop subscriber')
console.log('5. View real-time statistics every 30 seconds\n')
console.log('🔍 Monitoring all MQTT topics and providing detailed analytics...\n')
