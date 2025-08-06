<template>
  <div class="users">
    <div class="page-header">
      <h1 class="page-title">Users</h1>
      <div class="page-actions">
        <button class="btn-secondary">
          <Download class="w-4 h-4" />
          Export
        </button>
        <button class="btn-primary">
          <Plus class="w-4 h-4" />
          Add User
        </button>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="filters">
      <div class="search-filter">
        <Search class="w-5 h-5 search-icon" />
        <input 
          type="text" 
          placeholder="Search users..." 
          class="search-input"
          v-model="searchQuery"
        />
      </div>
      <select class="filter-select">
        <option>All Roles</option>
        <option>Admin</option>
        <option>User</option>
        <option>Manager</option>
      </select>
      <select class="filter-select">
        <option>All Status</option>
        <option>Active</option>
        <option>Inactive</option>
        <option>Pending</option>
      </select>
    </div>
    
    <!-- Users Table -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Last Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
            <td>
              <div class="user-info">
                <img :src="user.avatar" :alt="user.name" class="user-avatar" />
                <div>
                  <div class="user-name">{{ user.name }}</div>
                  <div class="user-id">ID: {{ user.id }}</div>
                </div>
              </div>
            </td>
            <td class="user-email">{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role.toLowerCase()">
                {{ user.role }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="user.status.toLowerCase()">
                {{ user.status }}
              </span>
            </td>
            <td class="last-active">{{ user.lastActive }}</td>
            <td>
              <div class="actions">
                <button class="action-btn">
                  <Edit class="w-4 h-4" />
                </button>
                <button class="action-btn">
                  <Trash2 class="w-4 h-4" />
                </button>
                <button class="action-btn">
                  <MoreHorizontal class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="pagination">
      <div class="pagination-info">
        Showing 1-10 of 156 users
      </div>
      <div class="pagination-controls">
        <button class="pagination-btn" disabled>
          <ChevronLeft class="w-4 h-4" />
          Previous
        </button>
        <button class="pagination-btn">
          Next
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { 
  Download, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight 
} from 'lucide-vue-next'

export default {
  name: 'Users',
  components: {
    Download,
    Plus,
    Search,
    Edit,
    Trash2,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight
  },
  setup() {
    const searchQuery = ref('')
    
    const users = [
      {
        id: '001',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin',
        status: 'Active',
        lastActive: '2 hours ago',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: '002',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'User',
        status: 'Active',
        lastActive: '1 day ago',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616c6f4fb3e?w=40&h=40&fit=crop&crop=face'
      },
      {
        id: '003',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'Manager',
        status: 'Inactive',
        lastActive: '1 week ago',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
      }
    ]
    
    const filteredUsers = computed(() => {
      return users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })
    
    return {
      searchQuery,
      users,
      filteredUsers
    }
  }
}
</script>

<style scoped>
.users {
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

.page-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-filter {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #64748b;
  background: white;
}

.table-container {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 24px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  border-bottom: 1px solid #e5e7eb;
}

.user-row {
  border-bottom: 1px solid #f3f4f6;
}

.user-row:hover {
  background: #f9fafb;
}

.users-table td {
  padding: 16px;
  vertical-align: middle;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.user-id {
  font-size: 12px;
  color: #6b7280;
}

.user-email {
  color: #6b7280;
}

.role-badge, .status-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.role-badge.admin {
  background: #fef2f2;
  color: #dc2626;
}

.role-badge.user {
  background: #f0f9ff;
  color: #0369a1;
}

.role-badge.manager {
  background: #f3e8ff;
  color: #7c3aed;
}

.status-badge.active {
  background: #dcfce7;
  color: #16a34a;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.last-active {
  color: #6b7280;
  font-size: 14px;
}

.actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f9fafb;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
