const aedes = require('aedes')()
const net = require('net')
const ws = require('ws')
const http = require('http')
const os = require('os')

// Configuration - Listen on all network interfaces for external connections
const MQTT_PORT = 1883
const WS_PORT = 8083
const HOST = '0.0.0.0' // Accept connections from any IP address

// MQTT Server (TCP) - for external MQTT clients
const server = net.createServer(aedes.handle)

// WebSocket Server for web clients
const httpServer = http.createServer()
const wsServer = new ws.Server({ server: httpServer })

// Store connected clients info and topic tracking
let connectedClients = new Map()
let topicStats = new Map() // Track unique topics and their message counts

// WebSocket handler for MQTT over WebSocket
wsServer.on('connection', function (socket) {
  const stream = ws.createWebSocketStream(socket)
  aedes.handle(stream)
})

// Get server IP addresses for display
function getServerIPs() {
  const interfaces = os.networkInterfaces()
  const ips = []
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push({ interface: name, ip: iface.address })
      }
    })
  })
  
  return ips
}

// Broker event handlers
aedes.on('client', function (client) {
  const clientIP = client.conn?.remoteAddress || 'unknown'
  const connectionType = client.req ? 'WebSocket' : 'TCP'
  
  connectedClients.set(client.id, {
    id: client.id,
    ip: clientIP,
    type: connectionType,
    connectedAt: new Date(),
    messageCount: 0
  })
  
  console.log(`✅ Client connected: ${client.id} (${connectionType} from ${clientIP})`)
})

aedes.on('clientDisconnect', function (client) {
  const clientInfo = connectedClients.get(client.id)
  const clientIP = clientInfo?.ip || 'unknown'
  
  console.log(`❌ Client disconnected: ${client.id} (${clientInfo?.messageCount || 0} messages)`)
  connectedClients.delete(client.id)
})

aedes.on('subscribe', function (subscriptions, client) {
  console.log(`📥 ${client.id} subscribed to ${subscriptions.length} topic(s)`)
})

aedes.on('unsubscribe', function (subscriptions, client) {
  console.log(`📤 ${client.id} unsubscribed from ${subscriptions.length} topic(s)`)
})

aedes.on('publish', function (packet, client) {
  // Skip system messages
  if (packet.topic.startsWith('$SYS/')) return
  
  if (client) {
    const clientInfo = connectedClients.get(client.id)
    
    // Update message count
    if (clientInfo) {
      clientInfo.messageCount++
    }
    
    // Track topic statistics
    if (topicStats.has(packet.topic)) {
      topicStats.set(packet.topic, topicStats.get(packet.topic) + 1)
    } else {
      topicStats.set(packet.topic, 1)
      console.log(`🆕 NEW TOPIC discovered: ${packet.topic}`)
    }
    
    // Log ALL topics that clients send to
    console.log(`📨 Message #${clientInfo?.messageCount || '?'} from ${client.id}: ${packet.topic}`)
    
    // Show payload summary for sensor data
    if (packet.topic.includes('sensors/combined')) {
      try {
        const data = JSON.parse(packet.payload.toString())
        if (data.devices) {
          console.log(`   📊 Sensor batch: ${data.batch || '?'} with ${Object.keys(data.devices).length} devices`)
        }
      } catch (e) {
        console.log(`   📊 Sensor payload: ${packet.payload.toString().substring(0, 100)}...`)
      }
    } else if (packet.topic.includes('alert') || packet.topic.includes('error') || packet.topic.includes('warning')) {
      console.log(`   ⚠️  Alert payload: ${packet.payload.toString().substring(0, 200)}`)
    } else {
      // Show first part of payload for other topics
      const payload = packet.payload.toString()
      if (payload.length > 50) {
        console.log(`   📄 Payload: ${payload.substring(0, 50)}...`)
      } else {
        console.log(`   📄 Payload: ${payload}`)
      }
    }
  }
})

aedes.on('clientError', function (client, err) {
  const clientInfo = connectedClients.get(client?.id)
  console.error(`❌ Client ${client?.id || 'unknown'} (${clientInfo?.ip || 'unknown'}) error:`, err.message)
})

aedes.on('connectionError', function (client, err) {
  console.error(`❌ Connection error:`, err.message)
})

// Add basic authentication (optional - currently allows all)
aedes.authenticate = function (client, username, password, callback) {
  // For now, allow all connections silently
  // You can add authentication logic here if needed
  callback(null, true)
}

// Add authorization for publish/subscribe (optional - currently allows all)
aedes.authorizePublish = function (client, packet, callback) {
  // Allow all publications for now
  // You can add authorization logic here if needed
  callback(null)
}

aedes.authorizeSubscribe = function (client, sub, callback) {
  // Allow all subscriptions for now
  // You can add authorization logic here if needed
  callback(null, sub)
}

// Start TCP server on all interfaces
server.listen(MQTT_PORT, HOST, function () {
  const serverIPs = getServerIPs()
  
  console.log('🚀 MQTT Broker for External Publishers')
  console.log('======================================')
  console.log(`📡 TCP Server: ${HOST}:${MQTT_PORT}`)
  console.log(`🌐 WebSocket Server: ${HOST}:${WS_PORT}`)
  console.log('======================================')
  console.log('🌍 Server Network Interfaces:')
  
  if (serverIPs.length > 0) {
    serverIPs.forEach(({ interface: name, ip }) => {
      console.log(`   ${name}: ${ip}`)
    })
  } else {
    console.log('   No external interfaces found')
  }
  
  console.log('======================================')
  console.log('📋 External Connection Examples:')
  
  if (serverIPs.length > 0) {
    const primaryIP = serverIPs[0].ip
    console.log(`   - MQTT TCP: mqtt://${primaryIP}:${MQTT_PORT}`)
    console.log(`   - MQTT WebSocket: ws://${primaryIP}:${WS_PORT}`)
  } else {
    console.log(`   - MQTT TCP: mqtt://YOUR_SERVER_IP:${MQTT_PORT}`)
    console.log(`   - MQTT WebSocket: ws://YOUR_SERVER_IP:${WS_PORT}`)
  }
  
  console.log('======================================')
  console.log('📊 Supported Topic Patterns:')
  console.log('   - iot/sensors/+/data')
  console.log('   - iot/devices/+/status')
  console.log('   - iot/system/alerts')
  console.log('   - iot/analytics/+')
  console.log('   - custom/+/+')
  console.log('======================================')
  console.log('🔓 Security: Open access (no authentication)')
  console.log('🌍 Network: Accepting external connections')
  console.log('⚡ Ready to accept publishers from other PCs!')
  console.log('======================================\n')
})

// Start WebSocket server on all interfaces
httpServer.listen(WS_PORT, HOST, function () {
  console.log(`🌐 WebSocket MQTT server ready on ${HOST}:${WS_PORT}`)
})

// Display statistics every 5 minutes instead of 30 seconds
setInterval(() => {
  const clientCount = Object.keys(aedes.clients).length
  if (clientCount > 0) {
    const totalMessages = Array.from(connectedClients.values())
      .reduce((sum, client) => sum + client.messageCount, 0)
    
    console.log(`\n📊 Broker Stats: ${clientCount} clients, ${totalMessages} total messages`)
    
    if (topicStats.size > 0) {
      console.log(`📋 Topics discovered (${topicStats.size} unique):`)
      for (const [topic, count] of topicStats.entries()) {
        console.log(`   • ${topic}: ${count} messages`)
      }
    }
    console.log('') // Empty line for readability
  }
}, 300000) // 5 minutes

// Error handling
server.on('error', function (err) {
  console.error('❌ TCP Server error:', err.message)
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${MQTT_PORT} is already in use. Please:`)
    console.error('1. Stop other MQTT brokers running on this port')
    console.error('2. Or change the MQTT_PORT in this script')
    console.error('3. Use: sudo netstat -tlnp | grep 1883 to find what\'s using the port')
  }
  if (err.code === 'EACCES') {
    console.error('Permission denied. You may need to run with sudo for ports < 1024')
  }
  process.exit(1)
})

httpServer.on('error', function (err) {
  console.error('❌ WebSocket Server error:', err.message)
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${WS_PORT} is already in use. Please:`)
    console.error('1. Stop other services running on this port')
    console.error('2. Or change the WS_PORT in this script')
  }
  process.exit(1)
})

// Graceful shutdown
process.on('SIGINT', function () {
  console.log('\n🛑 Shutting down MQTT broker...')
  console.log(`📊 Final statistics:`)
  console.log(`   - Total clients served: ${connectedClients.size}`)
  
  const totalMessages = Array.from(connectedClients.values())
    .reduce((sum, client) => sum + client.messageCount, 0)
  console.log(`   - Total messages processed: ${totalMessages}`)
  
  if (topicStats.size > 0) {
    console.log(`   - Unique topics discovered: ${topicStats.size}`)
    console.log(`📋 All topics used:`)
    for (const [topic, count] of topicStats.entries()) {
      console.log(`     • ${topic}: ${count} messages`)
    }
  }
  
  aedes.close(function () {
    console.log('✅ Aedes broker closed')
    
    server.close(function () {
      console.log('✅ TCP server closed')
      
      httpServer.close(function () {
        console.log('✅ WebSocket server closed')
        console.log('✅ MQTT broker shutdown complete')
        process.exit(0)
      })
    })
  })
})

// Handle process termination
process.on('SIGTERM', function () {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...')
  process.emit('SIGINT')
})
