const mqtt = require('mqtt')

// Configuration
const BROKER_HOST = process.env.BROKER_HOST || 'localhost'
const BROKER_PORT = process.env.BROKER_PORT || 1883
const BROKER_URL = `mqtt://${BROKER_HOST}:${BROKER_PORT}`

console.log('🔍 MQTT Test Client (Subscriber)')
console.log('================================')
console.log(`📡 Broker: ${BROKER_URL}`)
console.log(`🆔 Client ID: mqtt-test-client-${Math.random().toString(16).slice(3)}`)
console.log('================================\n')

// Create MQTT client
const client = mqtt.connect(BROKER_URL, {
  clientId: `mqtt-test-client-${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
})

// Topics to subscribe to
const topics = [
  'iot/sensors/+/data',
  'iot/devices/+/status',
  'iot/system/alerts',
  'iot/analytics/+',
  'custom/+/+',
  'test/+/+'
]

// Connection events
client.on('connect', function () {
  console.log('✅ Connected to MQTT broker!')
  console.log(`🆔 Client ID: ${client.options.clientId}`)
  console.log('📥 Subscribing to topics...\n')
  
  // Subscribe to all topics
  topics.forEach(topic => {
    client.subscribe(topic, { qos: 1 }, function (err) {
      if (!err) {
        console.log(`✅ Subscribed to: ${topic}`)
      } else {
        console.error(`❌ Failed to subscribe to ${topic}:`, err.message)
      }
    })
  })
  
  console.log('\n🎧 Listening for messages...\n')
})

client.on('error', function (err) {
  console.error('❌ Connection error:', err.message)
})

client.on('offline', function () {
  console.log('⚠️  Client offline')
})

client.on('reconnect', function () {
  console.log('🔄 Reconnecting...')
})

client.on('close', function () {
  console.log('🔌 Connection closed')
})

// Message counter
let messageCount = 0

// Message received event
client.on('message', function (topic, message, packet) {
  messageCount++
  
  console.log(`📨 Message #${messageCount} received:`)
  console.log(`   📍 Topic: ${topic}`)
  console.log(`   ⏰ Time: ${new Date().toISOString()}`)
  console.log(`   📊 QoS: ${packet.qos} | Retain: ${packet.retain}`)
  
  try {
    const data = JSON.parse(message.toString())
    console.log(`   📝 Data:`)
    
    // Pretty print based on message type
    if (data.deviceId && data.deviceType) {
      console.log(`      Device: ${data.deviceId} (${data.deviceType})`)
      if (data.value !== undefined) {
        console.log(`      Value: ${data.value}${data.unit || ''}`)
      }
      if (data.status) {
        console.log(`      Status: ${data.status}`)
      }
      if (data.location) {
        console.log(`      Location: ${data.location}`)
      }
      if (data.quality) {
        console.log(`      Quality: ${data.quality}`)
      }
      if (data.batteryLevel !== undefined) {
        console.log(`      Battery: ${data.batteryLevel}%`)
      }
    } else if (data.level && data.message) {
      // Alert message
      console.log(`      Alert Level: ${data.level.toUpperCase()}`)
      console.log(`      Message: ${data.message}`)
      console.log(`      Source: ${data.source || 'Unknown'}`)
      if (data.alertId) {
        console.log(`      Alert ID: ${data.alertId}`)
      }
    } else {
      // Generic message
      console.log(`      ${JSON.stringify(data, null, 6)}`)
    }
  } catch (e) {
    // Not JSON, show raw message
    console.log(`   📄 Raw: ${message.toString()}`)
  }
  
  console.log('   ' + '─'.repeat(60))
  console.log('')
})

// Statistics
setInterval(() => {
  if (messageCount > 0) {
    console.log(`📊 Statistics: ${messageCount} messages received`)
  }
}, 30000) // Every 30 seconds

// Graceful shutdown
process.on('SIGINT', function () {
  console.log('\n🛑 Shutting down client...')
  console.log(`📊 Final count: ${messageCount} messages received`)
  
  client.end(true, function () {
    console.log('✅ Client disconnected')
    process.exit(0)
  })
})
