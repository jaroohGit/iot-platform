const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mqtt = require('mqtt');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: false
  },
  allowEIO3: true
});

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["*"],
  credentials: false
}));
app.use(express.json());
app.use(express.static('public'));

// Device data - will be updated ONLY from MQTT sensors/combined topic
let deviceData = {
  flowRate: '--',
  orpLevel: '--',
  pHLevel: '--',
  powerConsumption: '--',
  lastUpdate: null
};

// MQTT Configuration - Connect to local broker
const MQTT_BROKER_URL = 'mqtt://localhost:1883';
const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: `backend-server-${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

// MQTT Topic - ONLY sensors/combined
const MQTT_TOPIC = 'sensors/combined';

// Device status tracking
let deviceStatus = {
  flowRateDevices: {
    total: 3,
    active: 0,
    devices: [
      { id: 'FR001', status: 'offline', lastReading: 0 },
      { id: 'FR002', status: 'offline', lastReading: 0 },
      { id: 'FR003', status: 'offline', lastReading: 0 }
    ]
  },
  orpDevices: {
    total: 6,
    active: 0,
    devices: [
      { id: 'ORP001', status: 'offline', lastReading: 0 },
      { id: 'ORP002', status: 'offline', lastReading: 0 },
      { id: 'ORP003', status: 'offline', lastReading: 0 },
      { id: 'ORP004', status: 'offline', lastReading: 0 },
      { id: 'ORP005', status: 'offline', lastReading: 0 },
      { id: 'ORP006', status: 'offline', lastReading: 0 }
    ]
  },
  pHDevices: {
    total: 6,
    active: 0,
    devices: [
      { id: 'PH001', status: 'offline', lastReading: 0 },
      { id: 'PH002', status: 'offline', lastReading: 0 },
      { id: 'PH003', status: 'offline', lastReading: 0 },
      { id: 'PH004', status: 'offline', lastReading: 0 },
      { id: 'PH005', status: 'offline', lastReading: 0 },
      { id: 'PH006', status: 'offline', lastReading: 0 }
    ]
  },
  powerMeters: {
    total: 1,
    active: 0,
    devices: [
      { id: 'PM001', status: 'offline', lastReading: 0 }
    ]
  }
};

// MQTT Connection handling
mqttClient.on('connect', function () {
  console.log('✅ Backend connected to MQTT broker');
  
  // Subscribe to sensors/combined topic ONLY
  mqttClient.subscribe(MQTT_TOPIC, { qos: 1 }, function (err) {
    if (!err) {
      console.log(`📥 Subscribed to: ${MQTT_TOPIC}`);
    } else {
      console.error(`❌ Failed to subscribe to ${MQTT_TOPIC}:`, err.message);
    }
  });
});

// Update device status based on MQTT data
function updateDeviceStatusFromMQTT(devices, orpValues, pHValues) {
  // Update power meters
  if (devices.power_meter_01) {
    deviceStatus.powerMeters.devices.forEach(device => {
      device.lastReading = parseFloat(deviceData.powerConsumption);
      device.status = 'operational';
    });
    deviceStatus.powerMeters.active = 1;
  }
  
  // Update flow rate devices
  if (devices.flow_rate_01) {
    deviceStatus.flowRateDevices.devices.forEach((device, index) => {
      device.lastReading = parseFloat(deviceData.flowRate) + (index * 2);
      device.status = 'operational';
    });
    deviceStatus.flowRateDevices.active = 3;
  }
  
  // Update ORP devices
  if (orpValues.length > 0) {
    deviceStatus.orpDevices.devices.forEach((device, index) => {
      device.lastReading = parseFloat(deviceData.orpLevel) + (index * 5);
      device.status = 'operational';
    });
    deviceStatus.orpDevices.active = 6;
  }
  
  // Update pH devices
  if (pHValues.length > 0) {
    deviceStatus.pHDevices.devices.forEach((device, index) => {
      device.lastReading = parseFloat(deviceData.pHLevel) + (index * 0.1);
      device.status = 'operational';
    });
    deviceStatus.pHDevices.active = 6;
  }
}

// Generate activity log when MQTT data is received
function emitActivityLog() {
  // Only generate if we have real data
  if (deviceData.flowRate === '--') return;
  
  const logEntry = {
    type: 'system',
    device: 'MQTT001',
    message: `Sensor data updated - Flow: ${deviceData.flowRate}L/h, ORP: ${deviceData.orpLevel}mV, pH: ${deviceData.pHLevel}, Power: ${deviceData.powerConsumption}kW`,
    level: 'info',
    timestamp: new Date().toISOString(),
    id: Date.now()
  };
  
  io.emit('activityLog', logEntry);
  console.log(`📝 Activity: ${logEntry.message}`);
}

// MQTT Message handling - ONLY sensors/combined topic
mqttClient.on('message', function (topic, message) {
  try {
    const data = JSON.parse(message.toString());
    console.log(`📨 MQTT Message received: ${topic}`);
    
    // Process only sensors/combined topic
    if (topic === 'sensors/combined' && data.devices) {
      console.log(`📊 Combined sensor data - Batch: ${data.batch}`);
      
      const devices = data.devices;
      
      // Update power consumption
      if (devices.power_meter_01) {
        deviceData.powerConsumption = (parseFloat(devices.power_meter_01.power) / 1000).toFixed(2);
        console.log(`⚡ Power: ${deviceData.powerConsumption} kW`);
      }
      
      // Update flow rate
      if (devices.flow_rate_01) {
        deviceData.flowRate = (parseFloat(devices.flow_rate_01.value) * 60).toFixed(1);
        console.log(`💧 Flow Rate: ${deviceData.flowRate} L/h`);
      }
      
      // Update ORP level (average of sensors)
      const orpValues = [];
      if (devices.ORP_01) orpValues.push(parseFloat(devices.ORP_01.value));
      if (devices.ORP_02) orpValues.push(parseFloat(devices.ORP_02.value));
      
      if (orpValues.length > 0) {
        deviceData.orpLevel = (orpValues.reduce((a, b) => a + b, 0) / orpValues.length).toFixed(1);
        console.log(`🧪 ORP: ${deviceData.orpLevel} mV`);
      }
      
      // Update pH level (average of sensors)
      const pHValues = [];
      if (devices.pH_01) pHValues.push(parseFloat(devices.pH_01.value));
      if (devices.pH_02) pHValues.push(parseFloat(devices.pH_02.value));
      
      if (pHValues.length > 0) {
        deviceData.pHLevel = (pHValues.reduce((a, b) => a + b, 0) / pHValues.length).toFixed(2);
        console.log(`⚗️  pH: ${deviceData.pHLevel}`);
      }
      
      // Update timestamp
      deviceData.lastUpdate = data.timestamp || new Date().toISOString();
      
      // Update device status
      updateDeviceStatusFromMQTT(devices, orpValues, pHValues);
      
      // Emit to all connected clients
      io.emit('deviceData', deviceData);
      io.emit('deviceStatus', deviceStatus);
      io.emit('mqttSensorData', {
        topic: topic,
        payload: data,
        timestamp: new Date().toISOString()
      });
      
      // Generate activity log
      emitActivityLog();
      
      console.log(`📊 Dashboard Updated: Flow=${deviceData.flowRate}L/h, ORP=${deviceData.orpLevel}mV, pH=${deviceData.pHLevel}, Power=${deviceData.powerConsumption}kW`);
    } else {
      console.log(`⚠️  Ignoring topic: ${topic} (only processing sensors/combined)`);
    }
    
  } catch (error) {
    console.error('❌ Error parsing MQTT message:', error.message);
  }
});

// MQTT error handling
mqttClient.on('error', function (err) {
  console.error('❌ MQTT Client Error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('🔴 Cannot connect to MQTT broker. Make sure the broker is running.');
  }
});

mqttClient.on('offline', function () {
  console.log('⚠️  MQTT Client offline - will attempt to reconnect');
});

mqttClient.on('reconnect', function () {
  console.log('🔄 MQTT Client reconnecting...');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  console.log(`📊 Total connected clients: ${io.engine.clientsCount}`);
  
  // Send current data to new client
  socket.emit('deviceData', deviceData);
  socket.emit('deviceStatus', deviceStatus);
  
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
  });
  
  socket.on('requestDeviceStatus', () => {
    socket.emit('deviceStatus', deviceStatus);
  });
});

// REST API endpoints
app.get('/api/devices', (req, res) => {
  res.json({
    data: deviceData,
    status: deviceStatus,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/devices/flow-rate', (req, res) => {
  res.json({
    value: deviceData.flowRate,
    unit: 'L/h',
    devices: deviceStatus.flowRateDevices,
    timestamp: deviceData.lastUpdate
  });
});

app.get('/api/devices/orp', (req, res) => {
  res.json({
    value: deviceData.orpLevel,
    unit: 'mV',
    devices: deviceStatus.orpDevices,
    timestamp: deviceData.lastUpdate
  });
});

app.get('/api/devices/ph', (req, res) => {
  res.json({
    value: deviceData.pHLevel,
    unit: 'pH',
    devices: deviceStatus.pHDevices,
    timestamp: deviceData.lastUpdate
  });
});

app.get('/api/devices/power', (req, res) => {
  res.json({
    value: deviceData.powerConsumption,
    unit: 'kW',
    devices: deviceStatus.powerMeters,
    timestamp: deviceData.lastUpdate
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount,
    mqttConnected: mqttClient.connected
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'IoT Backend Server - MQTT sensors/combined only',
    endpoints: {
      health: '/api/health',
      devices: '/api/devices',
      websocket: '/socket.io/'
    },
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 IoT Backend Server Started');
  console.log(`📡 Port: ${PORT}`);
  console.log(`📊 WebSocket: ws://localhost:${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`📥 MQTT Topic: ${MQTT_TOPIC} ONLY`);
  console.log('🔄 No simulation - waiting for real MQTT data');
});
