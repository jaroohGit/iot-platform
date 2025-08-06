<template>
  <div class="app">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <button 
          @click="toggleSidebar" 
          class="menu-toggle"
          :class="{ 'active': sidebarOpen }"
        >
          <Menu class="w-6 h-6" />
        </button>
        <h1 class="app-title">I-Vane</h1>
      </div>
      
      <div class="header-center">
        <div class="search-bar">
          <Search class="w-5 h-5 search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            class="search-input"
          />
        </div>
      </div>
      
      <div class="header-right">
        <button class="header-btn">
          <Bell class="w-5 h-5" />
          <span class="notification-badge">3</span>
        </button>
        <button class="header-btn">
          <Settings class="w-5 h-5" />
        </button>
        <div class="profile">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" 
            alt="Profile" 
            class="profile-avatar"
          />
          <ChevronDown class="w-4 h-4" />
        </div>
      </div>
    </header>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'open': sidebarOpen }">
      <div class="sidebar-header">
        <div class="logo">
          <Zap class="w-8 h-8 text-blue-600" />
          <span class="logo-text">WebApp</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <ul class="nav-list">
          <li v-for="item in menuItems" :key="item.name" class="nav-item">
            <router-link 
              :to="item.path" 
              class="nav-link"
              :class="{ 'active': $route.name === item.name }"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span class="nav-text">{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
      
      <div class="sidebar-footer">
        <div class="upgrade-card">
          <Crown class="w-6 h-6 text-yellow-500" />
          <h3>Upgrade to Pro</h3>
          <p>Get access to premium features</p>
          <button class="upgrade-btn">Upgrade</button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>

    <!-- Sidebar Overlay -->
    <div 
      v-if="sidebarOpen" 
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  ChevronDown, 
  Zap, 
  Crown,
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Cog,
  Database
} from 'lucide-vue-next'

export default {
  name: 'App',
  components: {
    Menu,
    Search,
    Bell,
    Settings,
    ChevronDown,
    Zap,
    Crown,
    LayoutDashboard,
    Users,
    Package,
    BarChart3,
    Cog,
    Database
  },
  setup() {
    const sidebarOpen = ref(false)
    
    const menuItems = [
      { name: 'Dashboard', path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
      { name: 'Users', path: '/users', label: 'Users', icon: 'Users' },
      { name: 'Products', path: '/products', label: 'Products', icon: 'Package' },
      { name: 'Analytics', path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
      { name: 'DataTable', path: '/data-table', label: 'Data Table', icon: 'Database' },
      { name: 'Settings', path: '/settings', label: 'Settings', icon: 'Cog' }
    ]
    
    const toggleSidebar = () => {
      sidebarOpen.value = !sidebarOpen.value
    }
    
    const closeSidebar = () => {
      sidebarOpen.value = false
    }
    
    return {
      sidebarOpen,
      menuItems,
      toggleSidebar,
      closeSidebar
    }
  }
}
</script>

<style scoped>
.app {
  display: flex;
  height: 100vh;
  background: #f8fafc;
}

/* Header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #64748b;
}

.menu-toggle:hover {
  background: #f1f5f9;
}

.menu-toggle.active {
  background: #3b82f6;
  color: white;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.header-center {
  flex: 1;
  max-width: 500px;
  margin: 0 24px;
}

.search-bar {
  position: relative;
  width: 100%;
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
  padding: 8px 12px 8px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-btn {
  position: relative;
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #64748b;
}

.header-btn:hover {
  background: #f1f5f9;
}

.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

.profile {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.profile:hover {
  background: #f1f5f9;
}

.profile-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

/* Sidebar */
.sidebar {
  position: fixed;
  left: 0;
  top: 64px;
  bottom: 0;
  width: 280px;
  background: white;
  border-right: 1px solid #e2e8f0;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.nav-link.active {
  background: #3b82f6;
  color: white;
}

.nav-text {
  font-size: 14px;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.upgrade-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  color: white;
}

.upgrade-card h3 {
  margin: 8px 0 4px 0;
  font-size: 16px;
  font-weight: 600;
}

.upgrade-card p {
  margin: 0 0 16px 0;
  font-size: 12px;
  opacity: 0.9;
}

.upgrade-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.upgrade-btn:hover {
  transform: translateY(-1px);
}

/* Main Content */
.main-content {
  flex: 1;
  margin-top: 64px;
  margin-left: 0px;
  transition: margin-left 0.3s ease;
}

.main-content.sidebar-open {
  margin-left: 0px;
}

.content-wrapper {
  padding: 24px;
  width: 100%;
  margin: 0;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 64px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* Responsive */
@media (max-width: 768px) {
  .header-center {
    display: none;
  }
  
  .main-content.sidebar-open {
    margin-left: 0;
  }
  
  .sidebar {
    width: 280px;
  }
}

@media (min-width: 1024px) {
  .sidebar {
    position: relative;
    transform: translateX(0);
    top: 0;
  }
  
  .main-content {
    margin-top: 64px;
    margin-left: 0px;
  }
  
  .sidebar-overlay {
    display: none;
  }
  
  .menu-toggle {
    display: none;
  }
}
</style>
