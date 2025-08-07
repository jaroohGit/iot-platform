const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mqtt = require('mqtt');
const TimescaleDB = require('./timescaledb-simple');
const MQTTBrokerSimulator = require('./mqtt-broker-simulator');
const MQTTDeviceSimulator = require('./mqtt-device-simulator');
const MQTTWebClient = require('./mqtt-web-client');

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

// Initialize MQTT system
const mqttBroker = new MQTTBrokerSimulator();
const mqttDeviceSimulator = new MQTTDeviceSimulator(mqttBroker);
const mqttWebClient = new MQTTWebClient(mqttBroker, io);

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["*"],
  credentials: false
}));
app.use(express.json());
app.use(express.static('public'));

// Device simulation data - now updated from MQTT messages
let deviceData = {
  flowRate: 125.4,
  orpLevel: 450,
  pHLevel: 7.2,
  powerConsumption: 2.4,
  lastUpdate: new Date().toISOString()
};

// MQTT Configuration - Connect to external MQTT broker
const MQTT_BROKER_URL = 'mqtt://148.135.137.236:1883';
const mqttClient = mqtt.connect(MQTT_BROKER_URL, {
  clientId: `backend-server-${Math.random().toString(16).slice(3)}`,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

// MQTT Topics to subscribe to - focusing on your combined sensors topic
const MQTT_TOPICS = [
  'sensors/combined',
  'sensors/+',
  'iot/sensors/+/data',
  'iot/devices/+/status'
];

// MQTT real-time data storage
let mqttDeviceData = {
  temperature: {},
  humidity: {},
  pressure: {},
  motion: {},
  flow_rate: {},
  orp_level: {},
  ph_level: {},
  power_meter: {},
  actuators: {}
};

// MQTT Connection handling
mqttClient.on('connect', function () {
  console.log('✅ Backend connected to MQTT broker');
  
  // Subscribe to all IoT topics
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

// MQTT Message handling - updated for your sensors/combined format
mqttClient.on('message', function (topic, message) {
  try {
    const data = JSON.parse(message.toString());
    console.log(`📨 MQTT Message received: ${topic}`);
    
    // Handle sensors/combined topic format
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
      
      // Store individual sensor readings in TimescaleDB
      if (devices.power_meter_01) {
        TimescaleDB.insertSensorReading(
          devices.power_meter_01.device_id,
          'power_meter',
          devices.power_meter_01.location,
          {
            value: parseFloat(devices.power_meter_01.power),
            unit: devices.power_meter_01.unit,
            voltage: parseFloat(devices.power_meter_01.voltage),
            current: parseFloat(devices.power_meter_01.current),
            quality: 'good',
            source: 'mqtt_combined'
          }
        ).catch(err => console.error('TimescaleDB Power Error:', err));
      }
      
      if (devices.flow_rate_01) {
        TimescaleDB.insertSensorReading(
          devices.flow_rate_01.device_id,
          'flow_rate',
          devices.flow_rate_01.location,
          {
            value: parseFloat(devices.flow_rate_01.value),
            unit: devices.flow_rate_01.unit,
            quality: 'good',
            source: 'mqtt_combined'
          }
        ).catch(err => console.error('TimescaleDB Flow Error:', err));
      }
      
      if (devices.ORP_01) {
        TimescaleDB.insertSensorReading(
          devices.ORP_01.device_id,
          'orp_level',
          devices.ORP_01.location,
          {
            value: parseFloat(devices.ORP_01.value),
            unit: devices.ORP_01.unit,
            quality: 'good',
            source: 'mqtt_combined'
          }
        ).catch(err => console.error('TimescaleDB ORP1 Error:', err));
      }
      
      if (devices.ORP_02) {
        TimescaleDB.insertSensorReading(
          devices.ORP_02.device_id,
          'orp_level',
          devices.ORP_02.location,
          {
            value: parseFloat(devices.ORP_02.value),
            unit: devices.ORP_02.unit,
            quality: 'good',
            source: 'mqtt_combined'
          }
        ).catch(err => console.error('TimescaleDB ORP2 Error:', err));
      }
      
      if (devices.pH_01) {
        TimescaleDB.insertSensorReading(
          devices.pH_01.device_id,
          'ph_level',
          devices.pH_01.location,
          {
            value: parseFloat(devices.pH_01.value),
            unit: devices.pH_01.unit,
            quality: 'good',
            source: 'mqtt_combined'
          }
        ).catch(err => console.error('TimescaleDB pH1 Error:', err));
      }
      
      if (devices.pH_02) {
        TimescaleDB.insertSensorReading(
          devices.pH_02.device_id,
          'ph_level',
          devices.pH_02.location,
          {
            value: parseFloat(devices.pH_02.value),
            unit: devices.pH_02.unit,
            quality: 'good',
            source: 'mqtt_combined'
          }
        ).catch(err => console.error('TimescaleDB pH2 Error:', err));
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
      
    } else if (data.deviceId && data.deviceType) {
      // Handle individual device messages (legacy format)
      console.log(`📨 Individual device: ${data.deviceType} - ${data.value}${data.unit}`);
      
      // Parse topic to extract device info
      const topicParts = topic.split('/');
      const deviceType = data.deviceType || 'unknown';
      const deviceId = data.deviceId || topicParts[2];
      
      // Store MQTT data based on device type
      if (deviceType === 'temperature') {
        mqttDeviceData.temperature[deviceId] = data;
        // Update main device data - convert temp to flow rate equivalent
        deviceData.flowRate = parseFloat((parseFloat(data.value) * 4).toFixed(1));
        
        // Update individual flow rate devices with MQTT data
        deviceStatus.flowRateDevices.devices.forEach((device, index) => {
          device.lastReading = parseFloat(data.value) * 4 + (index * 2); // Variation per device
          device.status = 'operational';
        });
        
      } else if (deviceType === 'humidity') {
        mqttDeviceData.humidity[deviceId] = data;
        // Update main device data - convert humidity to ORP equivalent
        deviceData.orpLevel = Math.floor(parseFloat(data.value) * 10);
        
        // Update individual ORP devices with MQTT data
        deviceStatus.orpDevices.devices.forEach((device, index) => {
          device.lastReading = Math.floor(parseFloat(data.value) * 10 + (index * 5)); // Variation per device
          device.status = 'operational';
        });
        
      } else if (deviceType === 'pressure') {
        mqttDeviceData.pressure[deviceId] = data;
        // Update main device data - convert pressure to pH equivalent
        deviceData.pHLevel = parseFloat(((parseFloat(data.value) - 980) / 10 + 7).toFixed(1));
        
        // Update individual pH devices with MQTT data
        deviceStatus.pHDevices.devices.forEach((device, index) => {
          device.lastReading = parseFloat(((parseFloat(data.value) - 980) / 10 + 7 + (index * 0.1)).toFixed(1));
          device.status = 'operational';
        });
        
      } else if (deviceType === 'motion') {
        mqttDeviceData.motion[deviceId] = data;
        
      } else if (deviceType === 'actuator') {
        mqttDeviceData.actuators[deviceId] = data;
        // Update power consumption based on actuator status
        if (data.status === 'online') {
          deviceData.powerConsumption = parseFloat((2.5 + Math.random() * 1.0).toFixed(1));
        } else {
          deviceData.powerConsumption = parseFloat((1.0 + Math.random() * 0.5).toFixed(1));
        }
        
        // Update power meter devices
        deviceStatus.powerMeters.devices.forEach(device => {
          device.lastReading = deviceData.powerConsumption;
          device.status = data.status === 'online' ? 'operational' : 'warning';
        });
      }
      
      // Store in TimescaleDB only for sensor data with numeric values
      if (data.deviceId && data.deviceType && data.value !== undefined && !isNaN(parseFloat(data.value))) {
        TimescaleDB.insertSensorReading(
          data.deviceId,
          data.deviceType,
          data.location || 'Unknown Location',
          {
            value: parseFloat(data.value),
            unit: data.unit || '',
            quality: data.quality || 'good',
            temperature: data.metadata?.temperature || 20,
            batteryLevel: data.batteryLevel || 100,
            signalStrength: data.signalStrength || 100,
            source: 'mqtt'
          }
        ).catch(err => console.error('TimescaleDB Error:', err));
      }
      
      // Update timestamp
      deviceData.lastUpdate = new Date().toISOString();
      
      // Emit real-time data to connected clients immediately
      io.emit('deviceData', deviceData);
      io.emit('deviceStatus', deviceStatus);
      io.emit('mqttData', {
        topic: topic,
        data: data,
        timestamp: new Date().toISOString()
      });
      
      console.log(`📊 Updated: Flow=${deviceData.flowRate}L/h, ORP=${deviceData.orpLevel}mV, pH=${deviceData.pHLevel}, Power=${deviceData.powerConsumption}kW`);
    }
    
  } catch (error) {
    console.error('❌ Error parsing MQTT message:', error.message);
    console.error('❌ Topic:', topic);
    console.error('❌ Message:', message.toString());
  }
});

mqttClient.on('error', function (err) {
  console.error('❌ MQTT Client Error:', err.message);
});

mqttClient.on('offline', function () {
  console.log('⚠️  MQTT Client offline');
});

mqttClient.on('reconnect', function () {
  console.log('🔄 MQTT Client reconnecting...');
});

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
  // return Number((baseValue + variation + noise).toFixed(1));
  return Number(999.9); // Simulate a constant value for testing
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
async function updateDeviceData() {
  deviceData.flowRate = simulateFlowRate();
  deviceData.orpLevel = simulateORPLevel();
  deviceData.pHLevel = simulatePHLevel();
  deviceData.powerConsumption = simulatePowerConsumption();
  deviceData.lastUpdate = new Date().toISOString();

  // Update individual device readings and store in TimescaleDB
  for (const device of deviceStatus.flowRateDevices.devices) {
    const value = simulateFlowRate();
    device.lastReading = value;
    
    // Store in TimescaleDB
    await TimescaleDB.insertSensorReading(
      device.id,
      'flow_rate',
      `Tank ${device.id.slice(-1)}`,
      {
        value: value,
        unit: 'L/h',
        quality: 'good',
        temperature: 20 + Math.random() * 10
      }
    );
  }
  
  for (const device of deviceStatus.orpDevices.devices) {
    const value = simulateORPLevel();
    device.lastReading = value;
    
    // Store in TimescaleDB
    await TimescaleDB.insertSensorReading(
      device.id,
      'orp_level',
      `Treatment Pool ${device.id.slice(-1)}`,
      {
        value: value,
        unit: 'mV',
        quality: 'good',
        temperature: 20 + Math.random() * 5
      }
    );
  }
  
  for (const device of deviceStatus.pHDevices.devices) {
    const value = simulatePHLevel();
    device.lastReading = value;
    
    // Store in TimescaleDB
    await TimescaleDB.insertSensorReading(
      device.id,
      'ph_level',
      `pH Monitor ${device.id.slice(-1)}`,
      {
        value: value,
        unit: 'pH',
        quality: 'good',
        temperature: 20 + Math.random() * 6
      }
    );
  }
  
  for (const device of deviceStatus.powerMeters.devices) {
    const value = simulatePowerConsumption();
    device.lastReading = value;
    
    // Store in TimescaleDB
    await TimescaleDB.insertSensorReading(
      device.id,
      'power_meter',
      'Main Panel',
      {
        value: value,
        unit: 'kW',
        quality: 'good',
        power_factor: 0.9 + Math.random() * 0.1,
        voltage: 220 + Math.random() * 20,
        current: 10 + Math.random() * 5
      }
    );
  }

  // Emit to all connected clients (WebSocket)
  io.emit('deviceData', deviceData);
  io.emit('deviceStatus', deviceStatus);
  
  // Log data emission for debugging
  if (io.engine.clientsCount > 0) {
    console.log(`📡 Emitted device data to ${io.engine.clientsCount} clients - Flow: ${deviceData.flowRate}L/h, ORP: ${deviceData.orpLevel}mV, pH: ${deviceData.pHLevel}, Power: ${deviceData.powerConsumption}kW`);
  }
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

// Emit real-time device status updates
function emitDeviceStatus() {
  io.emit('deviceStatus', deviceStatus);
  console.log(`📡 Emitted device status to ${io.engine.clientsCount} clients`);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id} from ${socket.handshake.address}`);
  console.log(`📊 Total connected clients: ${io.engine.clientsCount}`);
  
  // Send current data immediately to new client
  socket.emit('deviceData', deviceData);
  socket.emit('deviceStatus', deviceStatus);
  
  // Send a welcome message with connection status
  socket.emit('connectionStatus', {
    status: 'connected',
    message: 'Successfully connected to IoT Backend Server',
    timestamp: new Date().toISOString(),
    clientId: socket.id
  });
  
  // Handle client disconnect
  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id}, reason: ${reason}`);
    console.log(`📊 Remaining connected clients: ${io.engine.clientsCount}`);
  });
  
  // Handle client requesting device status
  socket.on('requestDeviceStatus', () => {
    socket.emit('deviceStatus', deviceStatus);
  });
  
  // Handle client requesting current device data
  socket.on('requestDeviceData', () => {
    socket.emit('deviceData', deviceData);
  });
});

// Add connection error handling
io.engine.on('connection_error', (err) => {
  console.log('🔴 Socket.IO connection error:', err.req);
  console.log('🔴 Error code:', err.code);
  console.log('🔴 Error message:', err.message);
  console.log('🔴 Error context:', err.context);
});

// MQTT API endpoints
app.get('/api/mqtt/status', (req, res) => {
  try {
    res.json({
      broker: mqttBroker.getStats(),
      devices: mqttDeviceSimulator.getDeviceStats(),
      web_client: mqttWebClient.getMQTTStats(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MQTT API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mqtt/devices', (req, res) => {
  try {
    const devices = mqttDeviceSimulator.getAllDevices();
    res.json({
      devices,
      total: devices.length,
      by_type: mqttDeviceSimulator.getDevicesByType(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MQTT API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mqtt/device/:deviceId', (req, res) => {
  try {
    const device = mqttDeviceSimulator.getDevice(req.params.deviceId);
    if (device) {
      res.json(device);
    } else {
      res.status(404).json({ error: 'Device not found' });
    }
  } catch (error) {
    console.error('MQTT API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/mqtt/device/:deviceId/control', (req, res) => {
  try {
    const { deviceId } = req.params;
    const { action, status } = req.body;
    
    if (action === 'setStatus' && status) {
      const success = mqttDeviceSimulator.setDeviceStatus(deviceId, status);
      if (success) {
        res.json({ success: true, deviceId, newStatus: status });
      } else {
        res.status(404).json({ error: 'Device not found' });
      }
    } else {
      res.status(400).json({ error: 'Invalid action or missing parameters' });
    }
  } catch (error) {
    console.error('MQTT API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mqtt/messages', (req, res) => {
  try {
    const { limit = 50, topic } = req.query;
    const messages = mqttWebClient.getMessageHistory(parseInt(limit), topic);
    res.json({
      messages,
      total: messages.length,
      filtered_by_topic: topic || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('MQTT API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/mqtt/publish', (req, res) => {
  try {
    const { topic, message, options = {} } = req.body;
    
    if (!topic || !message) {
      return res.status(400).json({ error: 'Topic and message are required' });
    }
    
    const success = mqttBroker.publish(topic, message, options);
    res.json({
      success,
      topic,
      published_at: new Date().toISOString(),
      message_id: `api_${Date.now()}`
    });
  } catch (error) {
    console.error('MQTT API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/mqtt/broker/stats', (req, res) => {
  try {
    res.json(mqttBroker.getStats());
  } catch (error) {
    console.error('MQTT API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// REST API endpoints
app.get('/api/devices', async (req, res) => {
  try {
    const deviceSummary = await TimescaleDB.getDeviceSummary();
    const allReadings = await TimescaleDB.getAllLatestReadings();
    
    res.json({
      data: deviceData,
      status: deviceStatus,
      summary: deviceSummary,
      latest_readings: allReadings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/devices/flow-rate', async (req, res) => {
  try {
    const readings = await TimescaleDB.getLatestReadingsByType('flow_rate');
    res.json({
      value: deviceData.flowRate,
      unit: 'L/h',
      devices: deviceStatus.flowRateDevices,
      readings: readings,
      timestamp: deviceData.lastUpdate
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/devices/orp', async (req, res) => {
  try {
    const readings = await TimescaleDB.getLatestReadingsByType('orp_level');
    res.json({
      value: deviceData.orpLevel,
      unit: 'mV',
      devices: deviceStatus.orpDevices,
      readings: readings,
      timestamp: deviceData.lastUpdate
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/devices/ph', async (req, res) => {
  try {
    const readings = await TimescaleDB.getLatestReadingsByType('ph_level');
    res.json({
      value: deviceData.pHLevel,
      unit: 'pH',
      devices: deviceStatus.pHDevices,
      readings: readings,
      timestamp: deviceData.lastUpdate
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/devices/power', async (req, res) => {
  try {
    const readings = await TimescaleDB.getLatestReadingsByType('power_meter');
    res.json({
      value: deviceData.powerConsumption,
      unit: 'kW',
      devices: deviceStatus.powerMeters,
      readings: readings,
      timestamp: deviceData.lastUpdate
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// New API endpoints for TimescaleDB data
app.get('/api/history/:deviceType', async (req, res) => {
  try {
    const { deviceType } = req.params;
    const { startTime, endTime, limit } = req.query;
    
    const readings = await TimescaleDB.getSensorReadings(
      null,
      deviceType,
      startTime ? new Date(startTime) : new Date(Date.now() - 24 * 60 * 60 * 1000), // Default: last 24 hours
      endTime ? new Date(endTime) : new Date(),
      limit ? parseInt(limit) : 100
    );
    
    res.json({
      device_type: deviceType,
      readings: readings,
      count: readings.length
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/analytics/:deviceType', async (req, res) => {
  try {
    const { deviceType } = req.params;
    const { startTime, endTime } = req.query;
    
    const start = startTime ? new Date(startTime) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const end = endTime ? new Date(endTime) : new Date();
    
    const hourlyData = await TimescaleDB.getHourlyAverages(deviceType, start, end);
    
    res.json({
      device_type: deviceType,
      period: { start, end },
      hourly_averages: hourlyData
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// Start intervals - reduced simulation since we're using MQTT data
// setInterval(updateDeviceData, 1000); // Disabled - using MQTT data instead
setInterval(emitActivityLog, 10000); // Generate activity log every 10 seconds
setInterval(emitDeviceStatus, 5000); // Emit device status every 5 seconds

// Initialize MQTT system - disabled internal broker, using external broker
function initializeMQTTSystem() {
  console.log('🚀 Using external MQTT broker at 148.135.137.236:1883');
  console.log('✅ MQTT client connected to external broker');
  
  // Internal MQTT broker disabled - using external broker
  // mqttBroker.start();
  // mqttDeviceSimulator.start();
  // mqttWebClient.connect();
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 IoT Backend Server running on port ${PORT}`);
  console.log(`📊 WebSocket endpoint: ws://148.135.137.236:${PORT}`);
  console.log(`🌐 API endpoint: http://148.135.137.236:${PORT}/api`);
  console.log(`� MQTT API endpoint: http://148.135.137.236:${PORT}/api/mqtt`);
  console.log(`�💡 Real-time data simulation started`);
  
  // Initialize MQTT system after server starts
  setTimeout(initializeMQTTSystem, 1000);
});
