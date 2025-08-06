<template>
  <div class="data-table-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Sensor Data Table</h1>
        <p class="page-description">Historical sensor readings from TimescaleDB</p>
      </div>
      <div class="controls">
        <select v-model="selectedDeviceType" @change="fetchData" class="device-filter">
          <option value="">All Device Types</option>
          <option value="flow_rate">Flow Rate</option>
          <option value="orp_level">ORP Level</option>
          <option value="ph_level">pH Level</option>
          <option value="power_meter">Power Meter</option>
        </select>
        <button @click="refreshData" class="refresh-btn">
          <RefreshCw class="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading sensor data...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <AlertCircle class="w-6 h-6" />
      <p>{{ error }}</p>
      <button @click="fetchData" class="retry-btn">Try Again</button>
    </div>

    <!-- Data Table -->
    <div v-if="!loading && !error" class="table-container">
      <div class="table-stats">
        <div class="stat">
          <span class="stat-label">Total Records:</span>
          <span class="stat-value">{{ totalRecords }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Last Updated:</span>
          <span class="stat-value">{{ lastUpdated }}</span>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th @click="sortBy('time')" class="sortable">
                <span>Time</span>
                <ChevronUp v-if="sortField === 'time' && sortOrder === 'asc'" class="sort-icon" />
                <ChevronDown v-if="sortField === 'time' && sortOrder === 'desc'" class="sort-icon" />
              </th>
              <th @click="sortBy('device_type')" class="sortable">
                <span>Device Type</span>
                <ChevronUp v-if="sortField === 'device_type' && sortOrder === 'asc'" class="sort-icon" />
                <ChevronDown v-if="sortField === 'device_type' && sortOrder === 'desc'" class="sort-icon" />
              </th>
              <th @click="sortBy('device_id')" class="sortable">
                <span>Device ID</span>
                <ChevronUp v-if="sortField === 'device_id' && sortOrder === 'asc'" class="sort-icon" />
                <ChevronDown v-if="sortField === 'device_id' && sortOrder === 'desc'" class="sort-icon" />
              </th>
              <th>Location</th>
              <th>Value</th>
              <th>Unit</th>
              <th>Quality</th>
              <th>Temperature</th>
              <th>Additional Data</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reading in sortedData" :key="`${reading.device_id}-${reading.time}`" class="table-row">
              <td class="time-cell">{{ formatTime(reading.time) }}</td>
              <td>
                <span :class="getDeviceTypeClass(reading.device_type)" class="device-badge">
                  {{ getDeviceTypeName(reading.device_type) }}
                </span>
              </td>
              <td class="device-id">{{ reading.device_id }}</td>
              <td>{{ reading.location }}</td>
              <td class="value-cell">{{ reading.data.value }}</td>
              <td class="unit-cell">{{ reading.data.unit }}</td>
              <td>
                <span :class="getQualityClass(reading.data.quality)" class="quality-badge">
                  {{ reading.data.quality }}
                </span>
              </td>
              <td>{{ reading.data.temperature }}°C</td>
              <td class="additional-data">
                <button @click="showDetails(reading)" class="details-btn">
                  <Eye class="w-4 h-4" />
                  Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="pagination">
        <button 
          @click="prevPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
        >
          <ChevronLeft class="w-4 h-4" />
          Previous
        </button>
        
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }} 
          ({{ startRecord }}-{{ endRecord }} of {{ totalRecords }})
        </span>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
        >
          Next
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedReading" class="modal-overlay" @click="closeDetails">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Sensor Reading Details</h3>
          <button @click="closeDetails" class="close-btn">
            <X class="w-5 h-5" />
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Device ID:</label>
              <span>{{ selectedReading.device_id }}</span>
            </div>
            <div class="detail-item">
              <label>Device Type:</label>
              <span>{{ getDeviceTypeName(selectedReading.device_type) }}</span>
            </div>
            <div class="detail-item">
              <label>Location:</label>
              <span>{{ selectedReading.location }}</span>
            </div>
            <div class="detail-item">
              <label>Timestamp:</label>
              <span>{{ formatTime(selectedReading.time) }}</span>
            </div>
            <div class="detail-item full-width">
              <label>Complete Data:</label>
              <pre class="json-data">{{ JSON.stringify(selectedReading.data, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { 
  RefreshCw, 
  AlertCircle, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  X
} from 'lucide-vue-next'

export default {
  name: 'DataTable',
  components: {
    RefreshCw,
    AlertCircle,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Eye,
    X
  },
  setup() {
    const loading = ref(false)
    const error = ref(null)
    const sensorData = ref([])
    const selectedDeviceType = ref('')
    const selectedReading = ref(null)
    
    // Sorting
    const sortField = ref('time')
    const sortOrder = ref('desc')
    
    // Pagination
    const currentPage = ref(1)
    const itemsPerPage = ref(20)
    
    // Computed properties
    const totalRecords = computed(() => sensorData.value.length)
    const totalPages = computed(() => Math.ceil(totalRecords.value / itemsPerPage.value))
    const startRecord = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1)
    const endRecord = computed(() => Math.min(currentPage.value * itemsPerPage.value, totalRecords.value))
    const lastUpdated = computed(() => new Date().toLocaleString())
    
    const sortedData = computed(() => {
      let data = [...sensorData.value]
      
      // Sort data
      data.sort((a, b) => {
        let aVal = a[sortField.value]
        let bVal = b[sortField.value]
        
        if (sortField.value === 'time') {
          aVal = new Date(aVal)
          bVal = new Date(bVal)
        }
        
        if (sortOrder.value === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
      
      // Paginate
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return data.slice(start, end)
    })
    
    // Methods
    const fetchData = async () => {
      loading.value = true
      error.value = null
      
      try {
        const endpoint = selectedDeviceType.value 
          ? `/api/history/${selectedDeviceType.value}?limit=1000`
          : '/api/devices'
        
        const response = await fetch(`http://localhost:3001${endpoint}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (selectedDeviceType.value) {
          sensorData.value = data.readings || []
        } else {
          sensorData.value = data.latest_readings || []
        }
        
        currentPage.value = 1
      } catch (err) {
        error.value = `Failed to fetch data: ${err.message}`
        console.error('Error fetching sensor data:', err)
      } finally {
        loading.value = false
      }
    }
    
    const refreshData = () => {
      fetchData()
    }
    
    const sortBy = (field) => {
      if (sortField.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortField.value = field
        sortOrder.value = 'asc'
      }
    }
    
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }
    
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }
    
    const showDetails = (reading) => {
      selectedReading.value = reading
    }
    
    const closeDetails = () => {
      selectedReading.value = null
    }
    
    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleString()
    }
    
    const getDeviceTypeName = (type) => {
      const names = {
        'flow_rate': 'Flow Rate',
        'orp_level': 'ORP Level',
        'ph_level': 'pH Level',
        'power_meter': 'Power Meter'
      }
      return names[type] || type
    }
    
    const getDeviceTypeClass = (type) => {
      const classes = {
        'flow_rate': 'device-flow',
        'orp_level': 'device-orp',
        'ph_level': 'device-ph',
        'power_meter': 'device-power'
      }
      return classes[type] || 'device-default'
    }
    
    const getQualityClass = (quality) => {
      const classes = {
        'good': 'quality-good',
        'fair': 'quality-fair',
        'poor': 'quality-poor'
      }
      return classes[quality] || 'quality-unknown'
    }
    
    onMounted(() => {
      fetchData()
    })
    
    return {
      loading,
      error,
      sensorData,
      selectedDeviceType,
      selectedReading,
      sortField,
      sortOrder,
      currentPage,
      totalRecords,
      totalPages,
      startRecord,
      endRecord,
      lastUpdated,
      sortedData,
      fetchData,
      refreshData,
      sortBy,
      prevPage,
      nextPage,
      showDetails,
      closeDetails,
      formatTime,
      getDeviceTypeName,
      getDeviceTypeClass,
      getQualityClass
    }
  }
}
</script>

<style scoped>
.data-table-page {
  min-height: 100vh;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.device-filter {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 160px;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #2563eb;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #ef4444;
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.table-stats {
  display: flex;
  gap: 32px;
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.data-table th.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.data-table th.sortable:hover {
  background: #f1f5f9;
}

.sort-icon {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  vertical-align: middle;
}

.data-table td {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #374151;
  font-size: 14px;
}

.table-row:hover {
  background: #f8fafc;
}

.time-cell {
  font-family: monospace;
  color: #6b7280;
}

.device-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.device-flow { background: #dbeafe; color: #1e40af; }
.device-orp { background: #d1fae5; color: #166534; }
.device-ph { background: #e0e7ff; color: #5b21b6; }
.device-power { background: #fed7aa; color: #c2410c; }
.device-default { background: #f3f4f6; color: #6b7280; }

.device-id {
  font-family: monospace;
  font-weight: 600;
}

.value-cell {
  font-weight: 600;
  color: #1e293b;
}

.unit-cell {
  color: #6b7280;
  font-size: 12px;
}

.quality-badge {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.quality-good { background: #dcfce7; color: #166534; }
.quality-fair { background: #fef3c7; color: #92400e; }
.quality-poor { background: #fee2e2; color: #dc2626; }
.quality-unknown { background: #f3f4f6; color: #6b7280; }

.details-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  color: #64748b;
  transition: all 0.2s;
}

.details-btn:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #64748b;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.close-btn:hover {
  background: #f1f5f9;
}

.modal-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
}

.detail-item span {
  font-size: 14px;
  color: #1e293b;
}

.json-data {
  background: #f8fafc;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  color: #374151;
  margin: 0;
  overflow-x: auto;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .controls {
    justify-content: flex-start;
  }
  
  .table-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
