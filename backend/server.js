const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

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

// Device simulation data
let deviceData = {
  flowRate: 125.4,
  orpLevel: 450,
  pHLevel: 7.2,
  powerConsumption: 2.4,
  lastUpdate: new Date().toISOString()
};

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

// Update device data every second
function updateDeviceData() {
  deviceData.flowRate = simulateFlowRate();
  deviceData.orpLevel = simulateORPLevel();
  deviceData.pHLevel = simulatePHLevel();
  deviceData.powerConsumption = simulatePowerConsumption();
  deviceData.lastUpdate = new Date().toISOString();

  // Update individual device readings
  deviceStatus.flowRateDevices.devices.forEach(device => {
    device.lastReading = simulateFlowRate();
  });
  
  deviceStatus.orpDevices.devices.forEach(device => {
    device.lastReading = simulateORPLevel();
  });
  
  deviceStatus.pHDevices.devices.forEach(device => {
    device.lastReading = simulatePHLevel();
  });
  
  deviceStatus.powerMeters.devices.forEach(device => {
    device.lastReading = simulatePowerConsumption();
  });

  // Emit to all connected clients
  io.emit('deviceData', deviceData);
}

// Generate random activity logs
function emitActivityLog() {
  const activity = generateActivityLog();
  const logEntry = {
    ...activity,
    timestamp: new Date().toISOString(),
    id: Date.now()
  };
  
  io.emit('activityLog', logEntry);
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

// Start simulation intervals
setInterval(updateDeviceData, 1000); // Update every second
setInterval(emitActivityLog, 5000); // Generate activity log every 5 seconds

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 IoT Backend Server running on port ${PORT}`);
  console.log(`📊 WebSocket endpoint: ws://148.135.137.236:${PORT}`);
  console.log(`🌐 API endpoint: http://148.135.137.236:${PORT}/api`);
  console.log(`💡 Real-time data simulation started`);
});
