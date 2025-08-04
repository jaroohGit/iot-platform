<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">Industrial Monitoring Dashboard</h1>
      <p class="page-description">Real-time monitoring of Flow Rate, ORP, pH, and Power systems</p>
    </div>
    
    <!-- Device Status Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <Droplets class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Flow Rate Devices</h3>
          <p class="stat-value">3 Active</p>
          <span class="stat-change positive">All systems operational</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon green">
          <Zap class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">ORP Devices</h3>
          <p class="stat-value">6 Active</p>
          <span class="stat-change positive">Normal oxidation levels</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon purple">
          <TestTube class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">pH Devices</h3>
          <p class="stat-value">6 Active</p>
          <span class="stat-change positive">pH levels stable</span>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon orange">
          <Gauge class="w-6 h-6" />
        </div>
        <div class="stat-content">
          <h3 class="stat-title">Power Meter</h3>
          <p class="stat-value">1 Active</p>
          <span class="stat-change positive">Consumption: 2.4 kW</span>
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
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
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
}
</style>
