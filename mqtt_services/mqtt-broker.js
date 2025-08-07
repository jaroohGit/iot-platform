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

// Store connected clients info
let connectedClients = new Map()

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
  
  console.log(`✅ Client connected: ${client.id}`)
  console.log(`   - Protocol: ${connectionType}`)
  console.log(`   - IP Address: ${clientIP}`)
  console.log(`   - Total clients: ${Object.keys(aedes.clients).length}`)
  console.log(`   - Connection time: ${new Date().toISOString()}`)
})

aedes.on('clientDisconnect', function (client) {
  const clientInfo = connectedClients.get(client.id)
  const clientIP = clientInfo?.ip || client.conn?.remoteAddress || 'unknown'
  
  console.log(`❌ Client disconnected: ${client.id}`)
  console.log(`   - IP Address: ${clientIP}`)
  console.log(`   - Messages sent: ${clientInfo?.messageCount || 0}`)
  console.log(`   - Remaining clients: ${Object.keys(aedes.clients).length}`)
  
  connectedClients.delete(client.id)
})

aedes.on('subscribe', function (subscriptions, client) {
  const clientInfo = connectedClients.get(client.id)
  console.log(`📥 Client ${client.id} (${clientInfo?.ip || 'unknown'}) subscribed to:`)
  subscriptions.forEach(sub => {
    console.log(`   - ${sub.topic} (QoS: ${sub.qos})`)
  })
})

aedes.on('unsubscribe', function (subscriptions, client) {
  const clientInfo = connectedClients.get(client.id)
  console.log(`📤 Client ${client.id} (${clientInfo?.ip || 'unknown'}) unsubscribed from:`)
  subscriptions.forEach(topic => {
    console.log(`   - ${topic}`)
  })
})

aedes.on('publish', function (packet, client) {
  // Skip system messages
  if (packet.topic.startsWith('$SYS/')) return
  
  if (client) {
    const clientInfo = connectedClients.get(client.id)
    const clientIP = clientInfo?.ip || 'unknown'
    
    // Update message count
    if (clientInfo) {
      clientInfo.messageCount++
    }
    
    console.log(`📨 Message from ${client.id} (${clientIP}):`)
    console.log(`   - Topic: ${packet.topic}`)
    
    // Parse and display payload in a readable format
    try {
      const data = JSON.parse(packet.payload.toString())
      console.log(`   - Device: ${data.deviceId || 'unknown'} (${data.deviceType || 'unknown'})`)
      console.log(`   - Value: ${data.value}${data.unit || ''}`)
      console.log(`   - Location: ${data.location || 'unknown'}`)
      console.log(`   - Quality: ${data.quality || 'unknown'}`)
      if (data.metadata?.hostname) {
        console.log(`   - Source Host: ${data.metadata.hostname}`)
      }
    } catch (e) {
      const payload = packet.payload.toString()
      console.log(`   - Payload: ${payload.length > 100 ? payload.substring(0, 100) + '...' : payload}`)
    }
    
    console.log(`   - QoS: ${packet.qos} | Retain: ${packet.retain}`)
    console.log(`   - Message #${clientInfo?.messageCount || '?'} from this client`)
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
  const clientIP = client.conn?.remoteAddress || 'unknown'
  console.log(`🔐 Authentication request from ${clientIP}: ${username || 'anonymous'}`)
  
  // For now, allow all connections
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

// Display statistics every 30 seconds
setInterval(() => {
  const clientCount = Object.keys(aedes.clients).length
  if (clientCount > 0) {
    console.log(`\n📊 Broker Statistics (${new Date().toISOString()}):`)
    console.log(`   - Connected clients: ${clientCount}`)
    
    const totalMessages = Array.from(connectedClients.values())
      .reduce((sum, client) => sum + client.messageCount, 0)
    console.log(`   - Total messages processed: ${totalMessages}`)
    
    console.log(`   - Active clients:`)
    connectedClients.forEach((clientInfo, clientId) => {
      const duration = Math.floor((new Date() - clientInfo.connectedAt) / 1000)
      console.log(`     • ${clientId} (${clientInfo.ip}) - ${clientInfo.messageCount} msgs, ${duration}s online`)
    })
  }
}, 30000)

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
