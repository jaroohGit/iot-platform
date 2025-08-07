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

// Device simulation data - will be updated from MQTT
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

// MQTT Topics to subscribe to
const MQTT_TOPICS = [
  'sensors/combined'
];

// MQTT Connection handling
mqttClient.on('connect', function () {
  console.log('✅ Backend connected to MQTT broker');
  
  // Subscribe to all sensor topics
  MQTT_TOPICS.forEach(topic => {
    mqttClient.subscribe(topic, { qos: 1 }, function (err) {
      if (!err) {
        console.log(`📥 Subscribed to: ${topic}`);
      } else {
        console.error(`❌ Failed to subscribe to ${topic}:`, err.message);
      }
    });
  });
});

// MQTT Message handling - parse sensor data and forward to frontend
mqttClient.on('message', function (topic, message) {
  try {
    const data = JSON.parse(message.toString());
    console.log(`📨 MQTT Message received: ${topic}`);
    
    // Handle sensors/combined topic format (only data source)
    if (topic === 'sensors/combined' && data.devices) {
      console.log(`📊 Combined sensor data received - Batch: ${data.batch}`);
      
      // Extract device data
      const devices = data.devices;
      
      // Update device data from combined sensors
      if (devices.power_meter_01) {
        const powerData = devices.power_meter_01;
        deviceData.powerConsumption = (parseFloat(powerData.power) / 1000).toFixed(2); // Convert W to kW
        console.log(`⚡ Power: ${deviceData.powerConsumption} kW`);
      }
      
      if (devices.flow_rate_01) {
        const flowData = devices.flow_rate_01;
        // Convert L/min to L/h
        deviceData.flowRate = (parseFloat(flowData.value) * 60).toFixed(1);
        console.log(`💧 Flow Rate: ${deviceData.flowRate} L/h`);
      }
      
      // Average ORP from both sensors
      const orpValues = [];
      if (devices.ORP_01) orpValues.push(parseFloat(devices.ORP_01.value));
      if (devices.ORP_02) orpValues.push(parseFloat(devices.ORP_02.value));
      
      if (orpValues.length > 0) {
        deviceData.orpLevel = (orpValues.reduce((a, b) => a + b, 0) / orpValues.length).toFixed(1);
        console.log(`🧪 ORP: ${deviceData.orpLevel} mV`);
      }
      
      // Average pH from both sensors
      const pHValues = [];
      if (devices.pH_01) pHValues.push(parseFloat(devices.pH_01.value));
      if (devices.pH_02) pHValues.push(parseFloat(devices.pH_02.value));
      
      if (pHValues.length > 0) {
        deviceData.pHLevel = (pHValues.reduce((a, b) => a + b, 0) / pHValues.length).toFixed(2);
        console.log(`⚗️  pH: ${deviceData.pHLevel}`);
      }
      
      // Update timestamp
      deviceData.lastUpdate = data.timestamp || new Date().toISOString();
      
      // Update device status with real data
      if (devices.power_meter_01) {
        deviceStatus.powerMeters.devices.forEach(device => {
          device.lastReading = deviceData.powerConsumption;
          device.status = 'operational';
        });
      }
      
      if (devices.flow_rate_01) {
        deviceStatus.flowRateDevices.devices.forEach((device, index) => {
          device.lastReading = parseFloat(deviceData.flowRate) + (index * 2); // Slight variation per device
          device.status = 'operational';
        });
      }
      
      if (orpValues.length > 0) {
        deviceStatus.orpDevices.devices.forEach((device, index) => {
          device.lastReading = parseFloat(deviceData.orpLevel) + (index * 5); // Slight variation per device
          device.status = 'operational';
        });
      }
      
      if (pHValues.length > 0) {
        deviceStatus.pHDevices.devices.forEach((device, index) => {
          device.lastReading = parseFloat(deviceData.pHLevel) + (index * 0.1); // Slight variation per device
          device.status = 'operational';
        });
      }
      
      // Emit real-time data to connected frontend clients
      io.emit('deviceData', deviceData);
      io.emit('deviceStatus', deviceStatus);
      io.emit('mqttSensorData', {
        topic: topic,
        payload: data,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📊 Updated Dashboard: Flow=${deviceData.flowRate}L/h, ORP=${deviceData.orpLevel}mV, pH=${deviceData.pHLevel}, Power=${deviceData.powerConsumption}kW`);
      
    } else {
      console.log(`⚠️  Received message from non-combined topic: ${topic} - ignoring`);
    }
    
  } catch (error) {
    console.error('❌ Error parsing MQTT message:', error.message);
    console.error('❌ Topic:', topic);
    console.error('❌ Message:', message.toString().substring(0, 200) + '...');
  }
});

mqttClient.on('error', function (err) {
  console.error('❌ MQTT Client Error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('🔴 Cannot connect to MQTT broker. Make sure the broker is running:');
    console.error('   cd /home/teddy/mqtt_test && npm run broker');
  }
});

mqttClient.on('offline', function () {
  console.log('⚠️  MQTT Client offline - will attempt to reconnect');
});

mqttClient.on('reconnect', function () {
  console.log('🔄 MQTT Client reconnecting...');
});

// Original device simulation data structure

// Device status tracking
let deviceStatus = {
  flowRateDevices: {
    total: 3,
    active: 3,
    devices: [
      { id: 'FR001', status: 'operational', lastReading: 0 },
      { id: 'FR002', status: 'operational', lastReading: 0 },
      { id: 'FR003', status: 'operational', lastReading: 0 }
    ]
  },
  orpDevices: {
    total: 6,
    active: 6,
    devices: [
      { id: 'ORP001', status: 'operational', lastReading: 0 },
      { id: 'ORP002', status: 'operational', lastReading: 0 },
      { id: 'ORP003', status: 'operational', lastReading: 0 },
      { id: 'ORP004', status: 'operational', lastReading: 0 },
      { id: 'ORP005', status: 'operational', lastReading: 0 },
      { id: 'ORP006', status: 'operational', lastReading: 0 }
    ]
  },
  pHDevices: {
    total: 6,
    active: 6,
    devices: [
      { id: 'PH001', status: 'operational', lastReading: 0 },
      { id: 'PH002', status: 'operational', lastReading: 0 },
      { id: 'PH003', status: 'operational', lastReading: 0 },
      { id: 'PH004', status: 'operational', lastReading: 0 },
      { id: 'PH005', status: 'operational', lastReading: 0 },
      { id: 'PH006', status: 'operational', lastReading: 0 }
    ]
  },
  powerMeters: {
    total: 1,
    active: 1,
    devices: [
      { id: 'PM001', status: 'operational', lastReading: 0 }
    ]
  }
};

// Simulation functions
function simulateFlowRate() {
  // Flow Rate: varies between 120-135 L/h with some realistic fluctuation
  const baseValue = 127.5;
  const variation = (Math.random() - 0.5) * 10; // ±5 L/h variation
  const noise = (Math.random() - 0.5) * 2; // ±1 L/h noise
  return Number((baseValue + variation + noise).toFixed(1));
}

function simulateORPLevel() {
  // ORP Level: varies between 400-500 mV
  const baseValue = 450;
  const variation = (Math.random() - 0.5) * 80; // ±40 mV variation
  const noise = (Math.random() - 0.5) * 20; // ±10 mV noise
  return Math.floor(baseValue + variation + noise);
}

function simulatePHLevel() {
  // pH Level: varies between 6.8-7.8 with realistic water chemistry
  const baseValue = 7.3;
  const variation = (Math.random() - 0.5) * 0.8; // ±0.4 pH variation
  const noise = (Math.random() - 0.5) * 0.2; // ±0.1 pH noise
  return Number((baseValue + variation + noise).toFixed(1));
}

function simulatePowerConsumption() {
  // Power Consumption: varies between 2.0-3.5 kW based on load
  const baseValue = 2.75;
  const variation = (Math.random() - 0.5) * 1.0; // ±0.5 kW variation
  const noise = (Math.random() - 0.5) * 0.3; // ±0.15 kW noise
  return Number((baseValue + variation + noise).toFixed(1));
}

// Generate activity logs
function generateActivityLog() {
  const activities = [
    { type: 'flowRate', device: 'FR001', message: 'Normal operation resumed', level: 'info' },
    { type: 'flowRate', device: 'FR002', message: 'Calibration completed', level: 'success' },
    { type: 'orp', device: 'ORP003', message: 'Calibration completed', level: 'success' },
    { type: 'orp', device: 'ORP001', message: 'Reading stabilized', level: 'info' },
    { type: 'pH', device: 'PH005', message: 'Reading within normal range', level: 'info' },
    { type: 'pH', device: 'PH002', message: 'Auto-calibration initiated', level: 'warning' },
    { type: 'power', device: 'PM001', message: 'Monthly report generated', level: 'info' },
    { type: 'power', device: 'PM001', message: 'Load spike detected', level: 'warning' }
  ];

  return activities[Math.floor(Math.random() * activities.length)];
}

// Update device data every interval - Enhanced for live dashboard
function updateDeviceData() {
  // Generate realistic sensor values
  deviceData.flowRate = simulateFlowRate();
  deviceData.orpLevel = simulateORPLevel();
  deviceData.pHLevel = simulatePHLevel();
  deviceData.powerConsumption = simulatePowerConsumption();
  deviceData.lastUpdate = new Date().toISOString();

  // Update individual device readings with variations
  deviceStatus.flowRateDevices.devices.forEach((device, index) => {
    device.lastReading = simulateFlowRate() + (index * 1.5); // Small variation per device
    device.status = Math.random() > 0.95 ? 'warning' : 'operational'; // 5% chance of warning
  });
  
  deviceStatus.orpDevices.devices.forEach((device, index) => {
    device.lastReading = simulateORPLevel() + (index * 8); // Small variation per device
    device.status = Math.random() > 0.97 ? 'warning' : 'operational'; // 3% chance of warning
  });
  
  deviceStatus.pHDevices.devices.forEach((device, index) => {
    device.lastReading = simulatePHLevel() + (index * 0.05); // Small variation per device
    device.status = Math.random() > 0.98 ? 'warning' : 'operational'; // 2% chance of warning
  });
  
  deviceStatus.powerMeters.devices.forEach((device, index) => {
    device.lastReading = simulatePowerConsumption() + (index * 0.2); // Small variation per device
    device.status = deviceData.powerConsumption > 3.2 ? 'warning' : 'operational'; // Warning if high power
  });

  // Update active device counts based on status
  deviceStatus.flowRateDevices.active = deviceStatus.flowRateDevices.devices.filter(d => d.status === 'operational').length;
  deviceStatus.orpDevices.active = deviceStatus.orpDevices.devices.filter(d => d.status === 'operational').length;
  deviceStatus.pHDevices.active = deviceStatus.pHDevices.devices.filter(d => d.status === 'operational').length;
  deviceStatus.powerMeters.active = deviceStatus.powerMeters.devices.filter(d => d.status === 'operational').length;

  // Emit live data to all connected clients
  io.emit('deviceData', deviceData);
  io.emit('deviceStatus', deviceStatus);
  
  // Also emit as MQTT-style data for compatibility
  io.emit('mqttSensorData', {
    topic: 'sensors/combined',
    payload: {
      batch: Math.floor(Date.now() / 1000),
      timestamp: deviceData.lastUpdate,
      devices: {
        power_meter_01: {
          power: parseFloat(deviceData.powerConsumption) * 1000, // Convert back to Watts
          unit: 'W',
          status: 'online'
        },
        flow_rate_01: {
          value: parseFloat(deviceData.flowRate) / 60, // Convert back to L/min
          unit: 'L/min',
          status: 'online'
        },
        ORP_01: {
          value: parseFloat(deviceData.orpLevel) - 5,
          unit: 'mV',
          status: 'online'
        },
        ORP_02: {
          value: parseFloat(deviceData.orpLevel) + 5,
          unit: 'mV', 
          status: 'online'
        },
        pH_01: {
          value: parseFloat(deviceData.pHLevel) - 0.1,
          unit: 'pH',
          status: 'online'
        },
        pH_02: {
          value: parseFloat(deviceData.pHLevel) + 0.1,
          unit: 'pH',
          status: 'online'
        }
      },
      device_count: {
        total: deviceStatus.flowRateDevices.total + deviceStatus.orpDevices.total + 
               deviceStatus.pHDevices.total + deviceStatus.powerMeters.total,
        active: deviceStatus.flowRateDevices.active + deviceStatus.orpDevices.active + 
                deviceStatus.pHDevices.active + deviceStatus.powerMeters.active
      }
    },
    timestamp: new Date().toISOString()
  });

  // Log current values for monitoring
  console.log(`📊 Live Data Update: Flow=${deviceData.flowRate}L/h, ORP=${deviceData.orpLevel}mV, pH=${deviceData.pHLevel}, Power=${deviceData.powerConsumption}kW`);
  console.log(`📈 Active Devices: Flow(${deviceStatus.flowRateDevices.active}/${deviceStatus.flowRateDevices.total}), ORP(${deviceStatus.orpDevices.active}/${deviceStatus.orpDevices.total}), pH(${deviceStatus.pHDevices.active}/${deviceStatus.pHDevices.total}), Power(${deviceStatus.powerMeters.active}/${deviceStatus.powerMeters.total})`);
}

// Generate realistic activity logs based on current device states
function emitActivityLog() {
  const activities = [];
  
  // Generate activities based on current device status
  deviceStatus.flowRateDevices.devices.forEach(device => {
    if (device.status === 'warning') {
      activities.push({ 
        type: 'flowRate', 
        device: device.id, 
        message: `Flow rate ${device.lastReading.toFixed(1)} L/h - Outside normal range`, 
        level: 'warning' 
      });
    } else if (Math.random() > 0.8) {
      activities.push({ 
        type: 'flowRate', 
        device: device.id, 
        message: `Flow rate stable at ${device.lastReading.toFixed(1)} L/h`, 
        level: 'info' 
      });
    }
  });
  
  deviceStatus.orpDevices.devices.forEach(device => {
    if (device.status === 'warning') {
      activities.push({ 
        type: 'orp', 
        device: device.id, 
        message: `ORP ${device.lastReading} mV - Calibration needed`, 
        level: 'warning' 
      });
    } else if (Math.random() > 0.85) {
      activities.push({ 
        type: 'orp', 
        device: device.id, 
        message: `ORP reading normal at ${device.lastReading} mV`, 
        level: 'info' 
      });
    }
  });
  
  deviceStatus.pHDevices.devices.forEach(device => {
    if (device.status === 'warning') {
      activities.push({ 
        type: 'pH', 
        device: device.id, 
        message: `pH ${device.lastReading.toFixed(2)} - Chemical adjustment required`, 
        level: 'warning' 
      });
    } else if (Math.random() > 0.9) {
      activities.push({ 
        type: 'pH', 
        device: device.id, 
        message: `pH balanced at ${device.lastReading.toFixed(2)}`, 
        level: 'success' 
      });
    }
  });
  
  deviceStatus.powerMeters.devices.forEach(device => {
    if (device.status === 'warning') {
      activities.push({ 
        type: 'power', 
        device: device.id, 
        message: `High power consumption: ${device.lastReading.toFixed(2)} kW`, 
        level: 'warning' 
      });
    } else if (Math.random() > 0.7) {
      activities.push({ 
        type: 'power', 
        device: device.id, 
        message: `Power usage normal: ${device.lastReading.toFixed(2)} kW`, 
        level: 'info' 
      });
    }
  });

  // If no specific activities, generate a random general activity
  if (activities.length === 0) {
    const generalActivities = [
      { type: 'system', device: 'SYS001', message: 'System health check completed', level: 'success' },
      { type: 'system', device: 'SYS001', message: 'Data backup completed successfully', level: 'info' },
      { type: 'system', device: 'SYS001', message: 'Network connectivity verified', level: 'info' },
      { type: 'maintenance', device: 'MAINT', message: 'Scheduled maintenance reminder', level: 'info' },
      { type: 'alert', device: 'MON001', message: 'All systems operating normally', level: 'success' }
    ];
    activities.push(generalActivities[Math.floor(Math.random() * generalActivities.length)]);
  }
  
  // Emit the most recent activity
  if (activities.length > 0) {
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const logEntry = {
      ...activity,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    };
    
    io.emit('activityLog', logEntry);
    console.log(`📝 Activity Log: ${logEntry.device} - ${logEntry.message} (${logEntry.level})`);
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id} from ${socket.handshake.address}`);
  console.log(`📊 Total connected clients: ${io.engine.clientsCount}`);
  
  // Send current data immediately to new client
  socket.emit('deviceData', deviceData);
  socket.emit('deviceStatus', deviceStatus);
  
  // Handle client disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
    console.log(`📊 Remaining connected clients: ${io.engine.clientsCount}`);
  });
  
  // Handle client requesting device status
  socket.on('requestDeviceStatus', () => {
    socket.emit('deviceStatus', deviceStatus);
  });
});

// Add connection error handling
io.engine.on('connection_error', (err) => {
  console.log('🔴 Socket.IO connection error:', err.req);
  console.log('🔴 Error code:', err.code);
  console.log('🔴 Error message:', err.message);
  console.log('🔴 Error context:', err.context);
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
    connectedClients: io.engine.clientsCount
  });
});

app.get('/api/test-websocket', (req, res) => {
  res.json({
    status: 'WebSocket server ready',
    endpoint: `ws://148.135.137.236:3001/socket.io/`,
    transports: ['websocket', 'polling'],
    timestamp: new Date().toISOString(),
    connectedClients: io.engine.clientsCount,
    firewall: 'Port 3001 is now open'
  });
});

// Simple test endpoint to verify server is accessible
app.get('/', (req, res) => {
  res.json({
    message: 'IoT Backend Server is running!',
    endpoints: {
      health: '/api/health',
      devices: '/api/devices',
      websocket: '/socket.io/'
    },
    timestamp: new Date().toISOString()
  });
});

// Start simulation intervals - ENABLED: Generate live sensor data for dashboard
setInterval(updateDeviceData, 2000); // Update every 2 seconds for live data
setInterval(emitActivityLog, 10000); // Generate activity log every 10 seconds

console.log('📡 Server configured to generate live sensor data for dashboard');
console.log('🔄 Live data simulation: Every 2 seconds');
console.log('📝 Activity logs: Every 10 seconds');

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 IoT Backend Server running on port ${PORT}`);
  console.log(`📊 WebSocket endpoint: ws://148.135.137.236:${PORT}`);
  console.log(`🌐 API endpoint: http://148.135.137.236:${PORT}/api`);
  console.log(`💡 Real-time data simulation started`);
});
