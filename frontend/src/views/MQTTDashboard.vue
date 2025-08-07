<template>
  <div class="mqtt-dashboard">
    <!-- Header Section -->
    <div class="header-section">
      <h2>🔗 MQTT System Dashboard</h2>
      <div class="status-indicators">
        <div class="status-card" :class="mqttStatus.status">
          <span class="status-dot"></span>
          <span>MQTT Broker: {{ mqttStatus.status.toUpperCase() }}</span>
        </div>
        <div class="connection-info">
          <span>📡 {{ connectedClients }} clients connected</span>
        </div>
      </div>
    </div>

    <!-- Statistics Section -->
    <div class="stats-section">
      <div class="stat-card">
        <h3>📊 Broker Statistics</h3>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">Connected Clients</span>
            <span class="stat-value">{{ brokerStats.connectedClients || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Topics</span>
            <span class="stat-value">{{ brokerStats.totalTopics || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Messages Processed</span>
            <span class="stat-value">{{ totalMessages }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Active Devices</span>
            <span class="stat-value">{{ activeDevices }}</span>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <h3>🔧 Device Statistics</h3>
        <div class="device-type-grid">
          <div v-for="(count, type) in devicesByType" :key="type" class="device-type-item">
            <span class="device-icon">{{ getDeviceIcon(type) }}</span>
            <span class="device-label">{{ formatDeviceType(type) }}</span>
            <span class="device-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Live Messages Section -->
    <div class="messages-section">
      <div class="section-header">
        <h3>📨 Live MQTT Messages</h3>
        <div class="message-controls">
          <button @click="toggleAutoScroll" :class="{ active: autoScroll }">
            {{ autoScroll ? '⏸️ Pause' : '▶️ Resume' }}
          </button>
          <button @click="clearMessages">🗑️ Clear</button>
          <select v-model="selectedTopic" @change="filterMessages">
            <option value="">All Topics</option>
            <option v-for="topic in uniqueTopics" :key="topic" :value="topic">
              {{ topic }}
            </option>
          </select>
        </div>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div v-if="filteredMessages.length === 0" class="no-messages">
          📭 No messages to display
        </div>
        <div v-for="message in filteredMessages" :key="message.id" class="message-item">
          <div class="message-header">
            <span class="message-topic">{{ message.topic }}</span>
            <span class="message-time">{{ formatTime(message.receivedAt) }}</span>
          </div>
          <div class="message-payload">
            <pre>{{ formatPayload(message.payload) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Device Status Section -->
    <div class="devices-section">
      <h3>🔧 Device Status</h3>
      <div class="devices-grid">
        <div v-for="device in devices" :key="device.id" class="device-card" :class="device.status">
          <div class="device-header">
            <span class="device-icon">{{ getDeviceIcon(device.type) }}</span>
            <span class="device-id">{{ device.id }}</span>
            <span class="device-status" :class="device.status">{{ device.status }}</span>
          </div>
          <div class="device-info">
            <p><strong>Type:</strong> {{ formatDeviceType(device.type) }}</p>
            <p><strong>Location:</strong> {{ device.location }}</p>
            <p><strong>Last Reading:</strong> {{ device.lastReading }} {{ device.unit }}</p>
            <p><strong>Messages:</strong> {{ device.messageCount }}</p>
            <p><strong>Errors:</strong> {{ device.errors }}</p>
          </div>
          <div class="device-actions">
            <button @click="setDeviceStatus(device.id, 'maintenance')" 
                    :disabled="device.status === 'maintenance'">
              🔧 Maintenance
            </button>
            <button @click="setDeviceStatus(device.id, 'operational')" 
                    :disabled="device.status === 'operational'">
              ✅ Operational
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Real-time Sensor Data -->
    <div class="sensors-section">
      <h3>📈 Real-time Sensor Data</h3>
      <div class="sensors-grid">
        <div v-for="sensor in latestSensorData" :key="sensor.deviceId" class="sensor-card">
          <div class="sensor-header">
            <span class="sensor-icon">{{ getDeviceIcon(sensor.type) }}</span>
            <span class="sensor-id">{{ sensor.deviceId }}</span>
            <span class="sensor-quality" :class="sensor.quality">{{ sensor.quality }}</span>
          </div>
          <div class="sensor-value">
            <span class="value">{{ sensor.value }}</span>
            <span class="unit">{{ sensor.unit }}</span>
          </div>
          <div class="sensor-location">📍 {{ sensor.location }}</div>
          <div class="sensor-time">🕒 {{ formatTime(sensor.timestamp) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue';
import { io } from 'socket.io-client';

export default {
  name: 'MQTTDashboard',
  setup() {
    // Reactive data
    const mqttStatus = reactive({ status: 'disconnected' });
    const brokerStats = reactive({});
    const messages = ref([]);
    const filteredMessages = ref([]);
    const devices = ref([]);
    const latestSensorData = ref([]);
    const devicesByType = reactive({});
    
    // UI state
    const autoScroll = ref(true);
    const selectedTopic = ref('');
    const messagesContainer = ref(null);
    const connectedClients = ref(0);
    const totalMessages = ref(0);
    const activeDevices = ref(0);
    
    // Socket connection
    let socket = null;

    // Computed values
    const uniqueTopics = ref([]);

    // Initialize socket connection
    const initSocket = () => {
      const backendHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
      socket = io(`http://${backendHost}:3001`);

      socket.on('connect', () => {
        console.log('Connected to backend for MQTT dashboard');
      });

      socket.on('mqttStatus', (data) => {
        Object.assign(mqttStatus, data);
        console.log('MQTT Status:', data);
      });

      socket.on('mqttMessage', (message) => {
        messages.value.unshift(message);
        if (messages.value.length > 500) {
          messages.value = messages.value.slice(0, 500);
        }
        updateUniqueTopics();
        filterMessages();
        totalMessages.value++;
        
        if (autoScroll.value) {
          nextTick(() => scrollToTop());
        }
      });

      socket.on('sensorData', (data) => {
        updateSensorData(data);
      });

      socket.on('realtimeMetrics', (data) => {
        updateRealtimeMetrics(data);
      });

      socket.on('deviceStatusUpdate', (data) => {
        if (data.devices) {
          devices.value = data.devices;
          activeDevices.value = data.devices.filter(d => d.status === 'operational').length;
        }
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from backend');
        mqttStatus.status = 'disconnected';
      });
    };

    // Load initial data
    const loadInitialData = async () => {
      try {
        const backendHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
        
        // Load MQTT status
        const statusResponse = await fetch(`http://${backendHost}:3001/api/mqtt/status`);
        const statusData = await statusResponse.json();
        
        Object.assign(brokerStats, statusData.broker);
        connectedClients.value = statusData.broker.connectedClients || 0;
        Object.assign(devicesByType, statusData.devices.by_type || {});
        
        // Load devices
        const devicesResponse = await fetch(`http://${backendHost}:3001/api/mqtt/devices`);
        const devicesData = await devicesResponse.json();
        devices.value = devicesData.devices || [];
        activeDevices.value = devices.value.filter(d => d.status === 'operational').length;
        
        // Load recent messages
        const messagesResponse = await fetch(`http://${backendHost}:3001/api/mqtt/messages?limit=100`);
        const messagesData = await messagesResponse.json();
        messages.value = messagesData.messages || [];
        totalMessages.value = messages.value.length;
        
        updateUniqueTopics();
        filterMessages();
        
      } catch (error) {
        console.error('Failed to load initial MQTT data:', error);
      }
    };

    // Update sensor data
    const updateSensorData = (data) => {
      console.log('Sensor data received:', data);
    };

    // Update real-time metrics
    const updateRealtimeMetrics = (data) => {
      const existingIndex = latestSensorData.value.findIndex(s => s.deviceId === data.deviceId);
      if (existingIndex >= 0) {
        latestSensorData.value[existingIndex] = data;
      } else {
        latestSensorData.value.push(data);
      }
      
      // Keep only latest 20 sensor readings
      if (latestSensorData.value.length > 20) {
        latestSensorData.value = latestSensorData.value.slice(-20);
      }
    };

    // Update unique topics
    const updateUniqueTopics = () => {
      const topics = [...new Set(messages.value.map(m => m.topic))];
      uniqueTopics.value = topics.sort();
    };

    // Filter messages
    const filterMessages = () => {
      if (selectedTopic.value) {
        filteredMessages.value = messages.value.filter(m => m.topic.includes(selectedTopic.value));
      } else {
        filteredMessages.value = [...messages.value];
      }
    };

    // UI methods
    const toggleAutoScroll = () => {
      autoScroll.value = !autoScroll.value;
    };

    const clearMessages = () => {
      messages.value = [];
      filteredMessages.value = [];
      totalMessages.value = 0;
    };

    const scrollToTop = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = 0;
      }
    };

    // Format methods
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString();
    };

    const formatPayload = (payload) => {
      if (typeof payload === 'object') {
        return JSON.stringify(payload, null, 2);
      }
      return payload;
    };

    const formatDeviceType = (type) => {
      return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const getDeviceIcon = (type) => {
      const icons = {
        'flow_rate': '🌊',
        'orp_level': '⚗️', 
        'ph_level': '🧪',
        'power_meter': '⚡'
      };
      return icons[type] || '📟';
    };

    // Device control
    const setDeviceStatus = async (deviceId, status) => {
      try {
        const backendHost = window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname;
        const response = await fetch(`http://${backendHost}:3001/api/mqtt/device/${deviceId}/control`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'setStatus',
            status: status
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Device status updated:', result);
          
          // Update local device status
          const device = devices.value.find(d => d.id === deviceId);
          if (device) {
            device.status = status;
          }
        } else {
          console.error('Failed to update device status');
        }
      } catch (error) {
        console.error('Error updating device status:', error);
      }
    };

    // Lifecycle
    onMounted(() => {
      initSocket();
      loadInitialData();
    });

    onUnmounted(() => {
      if (socket) {
        socket.disconnect();
      }
    });

    return {
      // Data
      mqttStatus,
      brokerStats,
      messages,
      filteredMessages,
      devices,
      latestSensorData,
      devicesByType,
      connectedClients,
      totalMessages,
      activeDevices,
      uniqueTopics,
      
      // UI state
      autoScroll,
      selectedTopic,
      messagesContainer,
      
      // Methods
      toggleAutoScroll,
      clearMessages,
      filterMessages,
      formatTime,
      formatPayload,
      formatDeviceType,
      getDeviceIcon,
      setDeviceStatus
    };
  }
};
</script>

<style scoped>
.mqtt-dashboard {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.header-section h2 {
  margin: 0;
  color: #333;
}

.status-indicators {
  display: flex;
  gap: 20px;
  align-items: center;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  border-radius: 5px;
  font-weight: bold;
}

.status-card.connected {
  background: #d4edda;
  color: #155724;
}

.status-card.disconnected {
  background: #f8d7da;
  color: #721c24;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-card.connected .status-dot {
  background: #28a745;
}

.status-card.disconnected .status-dot {
  background: #dc3545;
}

.connection-info {
  color: #666;
  font-size: 14px;
}

.stats-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stat-card h3 {
  margin: 0 0 15px 0;
  color: #333;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.device-type-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-type-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.device-icon {
  font-size: 20px;
}

.device-label {
  flex: 1;
  font-weight: 500;
}

.device-count {
  background: #007bff;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.messages-section {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.message-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.message-controls button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  font-size: 12px;
}

.message-controls button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.message-controls select {
  padding: 5px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.messages-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 20px 20px 20px;
}

.no-messages {
  text-align: center;
  color: #666;
  padding: 40px;
  font-style: italic;
}

.message-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.message-topic {
  background: #e9ecef;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-family: monospace;
}

.message-time {
  color: #666;
  font-size: 12px;
}

.message-payload {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
}

.message-payload pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.devices-section, .sensors-section {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.devices-section h3, .sensors-section h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.devices-grid, .sensors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.device-card, .sensor-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: #f8f9fa;
}

.device-card.operational {
  border-color: #28a745;
  background: #d4edda;
}

.device-card.maintenance {
  border-color: #ffc107;
  background: #fff3cd;
}

.device-header, .sensor-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.device-id, .sensor-id {
  font-weight: bold;
  font-family: monospace;
}

.device-status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.device-status.operational, .sensor-quality.good {
  background: #28a745;
  color: white;
}

.device-status.maintenance, .sensor-quality.acceptable {
  background: #ffc107;
  color: #212529;
}

.sensor-quality.poor {
  background: #dc3545;
  color: white;
}

.device-info {
  margin: 10px 0;
  font-size: 14px;
}

.device-info p {
  margin: 5px 0;
}

.device-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.device-actions button {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
  cursor: pointer;
  font-size: 12px;
}

.device-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sensor-value {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin: 10px 0;
}

.sensor-value .value {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
}

.sensor-value .unit {
  font-size: 14px;
  color: #666;
}

.sensor-location, .sensor-time {
  font-size: 12px;
  color: #666;
  margin: 5px 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .stat-grid {
    grid-template-columns: 1fr;
  }
  
  .devices-grid, .sensors-grid {
    grid-template-columns: 1fr;
  }
  
  .message-controls {
    flex-wrap: wrap;
  }
}
</style>
