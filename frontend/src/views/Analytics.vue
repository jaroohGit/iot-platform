<template>
  <div class="analytics">
    <div class="page-header">
      <h1 class="page-title">Analytics</h1>
      <div class="time-selector">
        <select class="time-select">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 3 months</option>
          <option>Last year</option>
        </select>
      </div>
    </div>
    
    <!-- Key Metrics -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-header">
          <TrendingUp class="w-5 h-5 text-green-600" />
          <span class="metric-title">Revenue Growth</span>
        </div>
        <div class="metric-value">+23.5%</div>
        <div class="metric-change positive">+2.1% from last period</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-header">
          <Users class="w-5 h-5 text-blue-600" />
          <span class="metric-title">User Acquisition</span>
        </div>
        <div class="metric-value">1,234</div>
        <div class="metric-change positive">+15.3% from last period</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-header">
          <Target class="w-5 h-5 text-purple-600" />
          <span class="metric-title">Conversion Rate</span>
        </div>
        <div class="metric-value">3.2%</div>
        <div class="metric-change negative">-0.5% from last period</div>
      </div>
      
      <div class="metric-card">
        <div class="metric-header">
          <Clock class="w-5 h-5 text-orange-600" />
          <span class="metric-title">Avg. Session Time</span>
        </div>
        <div class="metric-value">4m 32s</div>
        <div class="metric-change positive">+0.8% from last period</div>
      </div>
    </div>
    
    <!-- Charts Section -->
    <div class="charts-grid">
      <!-- Revenue Chart -->
      <div class="chart-card large">
        <div class="chart-header">
          <h3 class="chart-title">Revenue Trend</h3>
          <div class="chart-actions">
            <button class="chart-btn">Daily</button>
            <button class="chart-btn active">Weekly</button>
            <button class="chart-btn">Monthly</button>
          </div>
        </div>
        <div class="chart-content">
          <div class="chart-placeholder">
            <BarChart3 class="w-20 h-20 text-gray-400" />
            <p class="text-gray-500">Revenue trend chart will be displayed here</p>
          </div>
        </div>
      </div>
      
      <!-- Traffic Sources -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Traffic Sources</h3>
        </div>
        <div class="chart-content">
          <div class="traffic-list">
            <div class="traffic-item">
              <div class="traffic-source">
                <div class="traffic-dot organic"></div>
                <span>Organic Search</span>
              </div>
              <div class="traffic-stats">
                <span class="traffic-percentage">42%</span>
                <span class="traffic-visitors">12,543</span>
              </div>
            </div>
            
            <div class="traffic-item">
              <div class="traffic-source">
                <div class="traffic-dot social"></div>
                <span>Social Media</span>
              </div>
              <div class="traffic-stats">
                <span class="traffic-percentage">28%</span>
                <span class="traffic-visitors">8,321</span>
              </div>
            </div>
            
            <div class="traffic-item">
              <div class="traffic-source">
                <div class="traffic-dot direct"></div>
                <span>Direct</span>
              </div>
              <div class="traffic-stats">
                <span class="traffic-percentage">18%</span>
                <span class="traffic-visitors">5,432</span>
              </div>
            </div>
            
            <div class="traffic-item">
              <div class="traffic-source">
                <div class="traffic-dot referral"></div>
                <span>Referral</span>
              </div>
              <div class="traffic-stats">
                <span class="traffic-percentage">12%</span>
                <span class="traffic-visitors">3,654</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Top Pages -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Top Pages</h3>
          <button class="view-all-link">View All</button>
        </div>
        <div class="chart-content">
          <div class="pages-list">
            <div class="page-item">
              <div class="page-info">
                <div class="page-title">/dashboard</div>
                <div class="page-views">23,456 views</div>
              </div>
              <div class="page-progress">
                <div class="progress-bar" style="width: 85%"></div>
              </div>
            </div>
            
            <div class="page-item">
              <div class="page-info">
                <div class="page-title">/products</div>
                <div class="page-views">18,234 views</div>
              </div>
              <div class="page-progress">
                <div class="progress-bar" style="width: 70%"></div>
              </div>
            </div>
            
            <div class="page-item">
              <div class="page-info">
                <div class="page-title">/about</div>
                <div class="page-views">12,543 views</div>
              </div>
              <div class="page-progress">
                <div class="progress-bar" style="width: 48%"></div>
              </div>
            </div>
            
            <div class="page-item">
              <div class="page-info">
                <div class="page-title">/contact</div>
                <div class="page-views">8,765 views</div>
              </div>
              <div class="page-progress">
                <div class="progress-bar" style="width: 33%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { TrendingUp, Users, Target, Clock, BarChart3 } from 'lucide-vue-next'

export default {
  name: 'Analytics',
  components: {
    TrendingUp,
    Users,
    Target,
    Clock,
    BarChart3
  }
}
</script>

<style scoped>
.analytics {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.time-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  background: white;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.metric-title {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.metric-change {
  font-size: 12px;
}

.metric-change.positive {
  color: #10b981;
}

.metric-change.negative {
  color: #ef4444;
}

.charts-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 24px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.chart-card.large {
  grid-row: span 2;
}

.chart-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 4px;
}

.chart-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: #f8fafc;
  color: #64748b;
}

.chart-btn.active, .chart-btn:hover {
  background: #3b82f6;
  color: white;
}

.view-all-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.chart-content {
  padding: 24px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  gap: 12px;
}

.traffic-list, .pages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.traffic-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.traffic-source {
  display: flex;
  align-items: center;
  gap: 8px;
}

.traffic-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.traffic-dot.organic { background: #10b981; }
.traffic-dot.social { background: #3b82f6; }
.traffic-dot.direct { background: #8b5cf6; }
.traffic-dot.referral { background: #f59e0b; }

.traffic-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.traffic-percentage {
  font-weight: 600;
  color: #1e293b;
}

.traffic-visitors {
  font-size: 12px;
  color: #64748b;
}

.page-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-weight: 500;
  color: #1e293b;
}

.page-views {
  font-size: 12px;
  color: #64748b;
}

.page-progress {
  height: 4px;
  background: #f1f5f9;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #3b82f6;
  border-radius: 2px;
  transition: width 0.3s ease;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card.large {
    grid-row: span 1;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}
</style>
