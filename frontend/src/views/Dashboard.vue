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
    </div>
    
    <!-- Device Status Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <Droplets class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Flow Rate Devices</h3>
            <p class="stat-value real-time">{{ flowRate }} L/h</p>
          <span class="stat-change positive">
            <span class="live-indicator"></span>
            All systems operational
          </span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon green">
          <Zap class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">ORP Devices</h3>
          <p class="stat-value real-time">{{ orpLevel }} mV</p>
          <span class="stat-change positive">
            <span class="live-indicator"></span>
            Normal oxidation levels
          </span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon purple">
          <TestTube class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">pH Devices</h3>
          <p class="stat-value real-time">{{ pHLevel }} pH</p>
          <span class="stat-change positive">
            <span class="live-indicator"></span>
            pH levels stable
          </span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon orange">
          <Gauge class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Power Meter</h3>
          <p class="stat-value real-time">{{ powerConsumption }} kW</p>
          <span class="stat-change positive">
            <span class="live-indicator"></span>
            Real-time consumption
          </span>
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
              <p class="activity-text">Flow Rate Device #FR001: <strong>Normal operation resumed</strong></p>
              <span class="activity-time">2 minutes ago</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon green">
              <Zap class="w-4 h-4" />
            </div>
            <div class="activity-content">
              <p class="activity-text">ORP Device #ORP003: Calibration completed</p>
              <span class="activity-time">8 minutes ago</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon purple">
              <TestTube class="w-4 h-4" />
            </div>
            <div class="activity-content">
              <p class="activity-text">pH Device #PH005: Reading within normal range</p>
              <span class="activity-time">15 minutes ago</span>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon orange">
              <Gauge class="w-4 h-4" />
            </div>
            <div class="activity-content">
              <p class="activity-text">Power Meter #PM001: Monthly report generated</p>
              <span class="activity-time">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
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
    const flowRate = ref(125.4)
    const orpLevel = ref(450)
    const pHLevel = ref(7.2)
    const powerConsumption = ref(2.4)
    const connectionStatus = ref('Connecting...')
    let socket = null

    // Initialize WebSocket connection
    const initializeWebSocket = () => {
      console.log('Attempting to connect to backend...')
      // Use window.location.hostname to automatically detect if accessing via IP or localhost
      const backendHost = window.location.hostname === 'localhost' ? 'localhost' : '148.135.137.236'
      const backendUrl = `http://${backendHost}:3001`
      console.log('Backend URL:', backendUrl)
      
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
        console.log('✅ Connected to IoT Backend Server:', socket.id)
        connectionStatus.value = 'Connected'
      })

      socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from IoT Backend Server:', reason)
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

      // Listen for real-time device data
      socket.on('deviceData', (data) => {
        console.log('Received device data:', data)
        flowRate.value = data.flowRate
        orpLevel.value = data.orpLevel
        pHLevel.value = data.pHLevel
        powerConsumption.value = data.powerConsumption
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
      connectionStatus
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
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.blue { background: #3b82f6; }
.stat-icon.green { background: #10b981; }
.stat-icon.purple { background: #8b5cf6; }
.stat-icon.orange { background: #f59e0b; }

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 4px 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
  transition: color 0.3s ease;
}

.stat-value.real-time {
  animation: valueUpdate 1s ease-in-out infinite alternate;
}

@keyframes valueUpdate {
  0% { transform: scale(1); }
  100% { transform: scale(1.02); }
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

.stat-change {
  font-size: 12px;
}

.stat-change.positive { color: #10b981; }
.stat-change.negative { color: #ef4444; }

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
  
  .stats-grid {
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
}
</style>
