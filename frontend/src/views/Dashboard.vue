<template>
  <div class="dashboard">
    <div class="page-header">
      <div>
        <h1 class="page-title">Industrial Monitoring Dashboard</h1>
        <p class="page-description">Real-time monitoring of Flow Rate, ORP, pH, and Power systems</p>
      </div>
      <div class="connection-status">
        <span class="status-indicator" :class="{ 
          'connected': connectionStatus === 'Connected',
          'disconnected': connectionStatus === 'Disconnected',
          'connecting': connectionStatus === 'Connecting...'
        }"></span>
        <span class="status-text">{{ connectionStatus }}</span>
      </div>
      
      <!-- Data Status -->
      <div class="data-status" v-if="lastUpdate">
        <div class="data-info">
          <span class="data-label">Last Update:</span>
          <span class="data-value">{{ formatTime(lastUpdate) }}</span>
        </div>
        <div class="data-info" v-if="deviceCount > 0">
          <span class="data-label">Active Devices:</span>
          <span class="data-value">{{ deviceCount }}</span>
        </div>
      </div>
    </div>
    
    <!-- Combined Sensor Data Card -->
    <div class="stats-grid">
      <div class="combined-stat-card">
        <div class="card-header">
          <h3 class="card-title">Live Sensor Data</h3>
          <div class="connection-indicator">
            <span class="live-indicator"></span>
            {{ isDataReceiving ? 'Live MQTT Data' : 'Waiting for data...' }}
          </div>
        </div>
        
        <div class="sensor-grid">
          <div class="sensor-item">
            <div class="sensor-icon blue">
              <Droplets class="w-5 h-5" />
            </div>
            <div class="sensor-data">
              <span class="sensor-label">Flow Rate</span>
              <span class="sensor-value">{{ flowRate }} L/h</span>
            </div>
          </div>
          
          <div class="sensor-item">
            <div class="sensor-icon green">
              <Zap class="w-5 h-5" />
            </div>
            <div class="sensor-data">
              <span class="sensor-label">ORP Level</span>
              <span class="sensor-value">{{ orpLevel }} mV</span>
            </div>
          </div>
          
          <div class="sensor-item">
            <div class="sensor-icon purple">
              <TestTube class="w-5 h-5" />
            </div>
            <div class="sensor-data">
              <span class="sensor-label">pH Level</span>
              <span class="sensor-value">{{ pHLevel }} pH</span>
            </div>
          </div>
          
          <div class="sensor-item">
            <div class="sensor-icon orange">
              <Gauge class="w-5 h-5" />
            </div>
            <div class="sensor-data">
              <span class="sensor-label">Power</span>
              <span class="sensor-value">{{ powerConsumption }} kW</span>
            </div>
          </div>
        </div>
        
        <div class="card-footer" v-if="lastUpdate">
          <span class="last-update">Last Update: {{ formatTime(lastUpdate) }}</span>
          <span class="device-count" v-if="deviceCount > 0">{{ deviceCount }} Devices Active</span>
        </div>
      </div>
    </div>
    
    <!-- Device Monitoring Charts -->
    <div class="charts-section">
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">Real-Time Device Monitoring</h3>
          <select class="time-select">
            <option>Last 1 hour</option>
            <option>Last 6 hours</option>
            <option>Last 24 hours</option>
          </select>
        </div>
        <div class="chart-placeholder">
          <BarChart3 class="w-16 h-16 text-gray-400" />
          <p class="text-gray-500">Device performance chart will be rendered here</p>
        </div>
      </div>
      
      <div class="chart-card">
        <div class="card-header">
          <h3 class="card-title">Device Distribution</h3>
        </div>
        <div class="chart-placeholder">
          <PieChart class="w-16 h-16 text-gray-400" />
          <p class="text-gray-500">Device type distribution chart</p>
        </div>
      </div>
    </div>
    
    <!-- Device Activity Log -->
    <div class="activity-section">
      <div class="activity-card">
        <div class="card-header">
          <h3 class="card-title">Recent Device Activity</h3>
          <button class="view-all-btn">View All Logs</button>
        </div>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon blue">
              <Droplets class="w-4 h-4" />
            </div>
            <div class="activity-content">
              <p class="activity-text">Flow Rate Device <strong>FR_001</strong>: {{ flowRate !== '--' ? `Current rate ${flowRate} L/h` : 'Waiting for data...' }}</p>
              <span class="activity-time">{{ lastUpdate ? formatTime(lastUpdate) : 'No data' }}</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon green">
              <Zap class="w-4 h-4" />
            </div>
            <div class="activity-content">
              <p class="activity-text">ORP Devices <strong>ORP_001 & ORP_002</strong>: {{ orpLevel !== '--' ? `Average level ${orpLevel} mV` : 'Waiting for data...' }}</p>
              <span class="activity-time">{{ lastUpdate ? formatTime(lastUpdate) : 'No data' }}</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon purple">
              <TestTube class="w-4 h-4" />
            </div>
            <div class="activity-content">
              <p class="activity-text">pH Devices <strong>PH_001 & PH_002</strong>: {{ pHLevel !== '--' ? `Average pH ${pHLevel}` : 'Waiting for data...' }}</p>
              <span class="activity-time">{{ lastUpdate ? formatTime(lastUpdate) : 'No data' }}</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon orange">
              <Gauge class="w-4 h-4" />
            </div>
            <div class="activity-content">
              <p class="activity-text">Power Meter <strong>PM_001</strong>: {{ powerConsumption !== '--' ? `Current consumption ${powerConsumption} kW` : 'Waiting for data...' }}</p>
              <span class="activity-time">{{ lastUpdate ? formatTime(lastUpdate) : 'No data' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { io } from 'socket.io-client'
import { 
  Droplets,
  Zap, 
  TestTube, 
  Gauge, 
  BarChart3, 
  PieChart
} from 'lucide-vue-next'

export default {
  name: 'Dashboard',
  components: {
    Droplets,
    Zap,
    TestTube,
    Gauge,
    BarChart3,
    PieChart
  },
  setup() {
    const flowRate = ref('--')
    const orpLevel = ref('--')
    const pHLevel = ref('--')
    const powerConsumption = ref('--')
    const connectionStatus = ref('Connecting...')
    const lastUpdate = ref(null)
    const deviceCount = ref(0)
    let socket = null

    // Computed property to check if we're receiving data
    const isDataReceiving = computed(() => {
      return flowRate.value !== '--' || 
             orpLevel.value !== '--' || 
             pHLevel.value !== '--' || 
             powerConsumption.value !== '--'
    })

    // Initialize WebSocket connection
    const initializeWebSocket = () => {
      console.log('Attempting to connect to MQTT Test backend...')
      // Connect to the server.js in mqtt_test directory (port 3001)
      const backendHost = window.location.hostname === 'localhost' ? 'localhost' : '148.135.137.236'
      const backendUrl = `http://${backendHost}:3001`
      console.log('MQTT Test Backend URL:', backendUrl)
      
      socket = io(backendUrl, {
        transports: ['polling', 'websocket'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        maxReconnectionAttempts: 5,
        forceNew: true
      })

      socket.on('connect', () => {
        console.log('✅ Connected to MQTT Test Backend Server:', socket.id)
        connectionStatus.value = 'Connected'
      })

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from MQTT Test Backend Server:', reason)
        connectionStatus.value = 'Disconnected'
      })

      socket.on('connect_error', (error) => {
        console.error('🔴 Connection error:', error)
        console.error('Error details:', error.message, error.description)
        connectionStatus.value = 'Connection Error'
      })

      socket.on('reconnect', (attemptNumber) => {
        console.log('🔄 Reconnected after', attemptNumber, 'attempts')
      })

      socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('🔄 Reconnection attempt:', attemptNumber)
        connectionStatus.value = 'Reconnecting...'
      })

      socket.on('reconnect_error', (error) => {
        console.error('🔴 Reconnection error:', error)
      })

      socket.on('reconnect_failed', () => {
        console.error('🔴 Reconnection failed')
        connectionStatus.value = 'Connection Failed'
      })

      // Listen for real-time device data from MQTT Test server
      socket.on('deviceData', (data) => {
        console.log('📊 Received MQTT device data:', data)
        
        // Handle the format from /home/teddy/mqtt_test/server.js
        if (data.flowRate !== undefined) flowRate.value = data.flowRate
        if (data.orpLevel !== undefined) orpLevel.value = data.orpLevel
        if (data.pHLevel !== undefined) pHLevel.value = data.pHLevel
        if (data.powerConsumption !== undefined) powerConsumption.value = data.powerConsumption
        if (data.lastUpdate) lastUpdate.value = new Date(data.lastUpdate)
        
        console.log(`📈 Updated Dashboard: Flow=${flowRate.value}L/h, ORP=${orpLevel.value}mV, pH=${pHLevel.value}, Power=${powerConsumption.value}kW`)
      })

      // Listen for MQTT sensor data directly from MQTT Test server
      socket.on('mqttSensorData', (data) => {
        console.log('🔄 Received MQTT sensor data from mqtt_test/server.js:', data)
        
        // Handle the exact format from your MQTT subscriber via server.js
        if (data.topic === 'sensors/combined' && data.payload) {
          try {
            const payload = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload
            
            if (payload.devices) {
              console.log('📊 Processing combined sensor data - Batch:', payload.batch)
              
              // Power meter data
              if (payload.devices.power_meter_01) {
                const powerData = payload.devices.power_meter_01
                powerConsumption.value = (parseFloat(powerData.power) / 1000).toFixed(2)
                console.log('⚡ Power updated:', powerConsumption.value + 'kW')
              }
              
              // Flow rate data (convert L/min to L/h)
              if (payload.devices.flow_rate_01) {
                const flowData = payload.devices.flow_rate_01
                const flowInLh = (parseFloat(flowData.value) * 60).toFixed(1)
                flowRate.value = flowInLh
                console.log('💧 Flow updated:', flowRate.value + 'L/h')
              }
              
              // ORP data - average of both sensors
              const orpValues = []
              if (payload.devices.ORP_01) orpValues.push(parseFloat(payload.devices.ORP_01.value))
              if (payload.devices.ORP_02) orpValues.push(parseFloat(payload.devices.ORP_02.value))
              
              if (orpValues.length > 0) {
                const avgORP = orpValues.reduce((a, b) => a + b, 0) / orpValues.length
                orpLevel.value = avgORP.toFixed(1)
                console.log('🧪 ORP updated:', orpLevel.value + 'mV')
              }
              
              // pH data - average of both sensors
              const pHValues = []
              if (payload.devices.pH_01) pHValues.push(parseFloat(payload.devices.pH_01.value))
              if (payload.devices.pH_02) pHValues.push(parseFloat(payload.devices.pH_02.value))
              
              if (pHValues.length > 0) {
                const avgPH = pHValues.reduce((a, b) => a + b, 0) / pHValues.length
                pHLevel.value = avgPH.toFixed(2)
                console.log('⚗️  pH updated:', pHLevel.value)
              }
              
              // Update metadata
              if (payload.device_count && payload.device_count.total) {
                deviceCount.value = payload.device_count.total
              }
              
              lastUpdate.value = new Date(payload.timestamp)
              
              console.log(`📈 Dashboard updated from MQTT: Flow=${flowRate.value}L/h, ORP=${orpLevel.value}mV, pH=${pHLevel.value}, Power=${powerConsumption.value}kW`)
            }
          } catch (error) {
            console.error('❌ Error parsing MQTT sensor data:', error)
          }
        }
      })

      // Listen for MQTT data from external IoT devices
      socket.on('mqttData', (data) => {
        console.log('🌐 Received external MQTT device data:', data)
        // This handles individual device messages from external publishers
        if (data.data) {
          const deviceData = data.data
          console.log(`📡 External IoT Device: ${deviceData.deviceType} = ${deviceData.value}${deviceData.unit || ''}`)
        }
      })

      // Listen for activity logs
      socket.on('activityLog', (log) => {
        console.log('New activity log:', log)
        // You can add activity log handling here
      })

      // Listen for device status updates
      socket.on('deviceStatus', (status) => {
        console.log('Device status update:', status)
        // You can add device status handling here
      })
    }

    // Helper function to format timestamp
    const formatTime = (date) => {
      if (!date) return '--'
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(date)
    }

    onMounted(() => {
      // Initialize WebSocket connection when component mounts
      initializeWebSocket()
    })

    onUnmounted(() => {
      // Clean up WebSocket connection when component unmounts
      if (socket) {
        socket.disconnect()
        console.log('WebSocket connection closed')
      }
    })

    return {
      flowRate,
      orpLevel,
      pHLevel,
      powerConsumption,
      connectionStatus,
      lastUpdate,
      deviceCount,
      isDataReceiving,
      formatTime
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.data-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 8px;
}

.data-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.data-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-value {
  font-size: 13px;
  color: #1e293b;
  font-weight: 600;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.connected {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.status-indicator.disconnected {
  background: #ef4444;
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.status-indicator.connecting {
  background: #f59e0b;
  animation: pulse 2s infinite;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.page-description {
  color: #64748b;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.combined-stat-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 24px 24px 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
}

.connection-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.sensor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1px;
  background: #f1f5f9;
}

.sensor-item {
  background: white;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.sensor-item:hover {
  background: #f8fafc;
}

.sensor-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.sensor-icon.blue { background: #3b82f6; }
.sensor-icon.green { background: #10b981; }
.sensor-icon.purple { background: #8b5cf6; }
.sensor-icon.orange { background: #f59e0b; }

.sensor-data {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.sensor-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sensor-value {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  transition: all 0.3s ease;
}

.card-footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.last-update {
  color: #64748b;
  font-weight: 500;
}

.device-count {
  color: #10b981;
  font-weight: 600;
}

.live-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  margin-right: 6px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.chart-card, .activity-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  padding: 24px 24px 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.time-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #64748b;
}

.chart-placeholder {
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.activity-section {
  margin-bottom: 32px;
}

.view-all-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.activity-list {
  padding: 0 24px 24px 24px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #1e293b;
  margin: 0 0 4px 0;
  font-size: 14px;
}

.activity-time {
  color: #94a3b8;
  font-size: 12px;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .sensor-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .connection-status {
    align-self: flex-start;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
