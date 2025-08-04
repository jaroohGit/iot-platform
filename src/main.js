import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

// Lazy load views
const Dashboard = () => import('./views/Dashboard.vue')
const Users = () => import('./views/Users.vue')
const Products = () => import('./views/Products.vue')
const Analytics = () => import('./views/Analytics.vue')
const Settings = () => import('./views/Settings.vue')

// Create router
const routes = [
  { 
    path: '/', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { title: 'Dashboard' }
  },
  { 
    path: '/users', 
    name: 'Users', 
    component: Users,
    meta: { title: 'Users' }
  },
  { 
    path: '/products', 
    name: 'Products', 
    component: Products,
    meta: { title: 'Products' }
  },
  { 
    path: '/analytics', 
    name: 'Analytics', 
    component: Analytics,
    meta: { title: 'Analytics' }
  },
  { 
    path: '/settings', 
    name: 'Settings', 
    component: Settings,
    meta: { title: 'Settings' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create and mount the app
const app = createApp(App)
app.use(router)
app.mount('#app')
