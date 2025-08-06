<template>
  <div class="settings">
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
      <p class="page-description">Manage your account and application preferences</p>
    </div>
    
    <div class="settings-container">
      <!-- Settings Navigation -->
      <div class="settings-nav">
        <ul class="nav-list">
          <li v-for="tab in tabs" :key="tab.id" class="nav-item">
            <button 
              @click="activeTab = tab.id"
              class="nav-link"
              :class="{ 'active': activeTab === tab.id }"
            >
              <component :is="tab.icon" class="w-5 h-5" />
              <span>{{ tab.label }}</span>
            </button>
          </li>
        </ul>
      </div>
      
      <!-- Settings Content -->
      <div class="settings-content">
        <!-- Profile Settings -->
        <div v-if="activeTab === 'profile'" class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Profile Settings</h2>
            <p class="section-description">Update your personal information and profile details</p>
          </div>
          
          <div class="profile-form">
            <div class="avatar-section">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" 
                alt="Profile" 
                class="profile-avatar"
              />
              <div class="avatar-actions">
                <button class="btn-secondary">Change Photo</button>
                <button class="btn-text">Remove</button>
              </div>
            </div>
            
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">First Name</label>
                <input type="text" class="form-input" value="John" />
              </div>
              
              <div class="form-group">
                <label class="form-label">Last Name</label>
                <input type="text" class="form-input" value="Doe" />
              </div>
              
              <div class="form-group full-width">
                <label class="form-label">Email Address</label>
                <input type="email" class="form-input" value="john@example.com" />
              </div>
              
              <div class="form-group full-width">
                <label class="form-label">Bio</label>
                <textarea class="form-textarea" rows="3" placeholder="Tell us about yourself..."></textarea>
              </div>
            </div>
            
            <div class="form-actions">
              <button class="btn-primary">Save Changes</button>
              <button class="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
        
        <!-- Security Settings -->
        <div v-if="activeTab === 'security'" class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Security Settings</h2>
            <p class="section-description">Manage your password and security preferences</p>
          </div>
          
          <div class="security-form">
            <div class="security-item">
              <div class="security-info">
                <h3 class="security-title">Change Password</h3>
                <p class="security-description">Update your password to keep your account secure</p>
              </div>
              <button class="btn-primary">Change Password</button>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h3 class="security-title">Two-Factor Authentication</h3>
                <p class="security-description">Add an extra layer of security to your account</p>
              </div>
              <div class="toggle-switch">
                <input type="checkbox" id="2fa" class="toggle-input" />
                <label for="2fa" class="toggle-label"></label>
              </div>
            </div>
            
            <div class="security-item">
              <div class="security-info">
                <h3 class="security-title">Login Sessions</h3>
                <p class="security-description">Manage your active login sessions</p>
              </div>
              <button class="btn-secondary">View Sessions</button>
            </div>
          </div>
        </div>
        
        <!-- Notifications Settings -->
        <div v-if="activeTab === 'notifications'" class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Notification Preferences</h2>
            <p class="section-description">Choose how you want to be notified</p>
          </div>
          
          <div class="notifications-form">
            <div class="notification-group">
              <h3 class="group-title">Email Notifications</h3>
              
              <div class="notification-item">
                <div class="notification-info">
                  <div class="notification-title">Account Activity</div>
                  <div class="notification-description">Get notified about important account changes</div>
                </div>
                <div class="toggle-switch">
                  <input type="checkbox" id="account-email" class="toggle-input" checked />
                  <label for="account-email" class="toggle-label"></label>
                </div>
              </div>
              
              <div class="notification-item">
                <div class="notification-info">
                  <div class="notification-title">Marketing Emails</div>
                  <div class="notification-description">Receive updates about new features and promotions</div>
                </div>
                <div class="toggle-switch">
                  <input type="checkbox" id="marketing-email" class="toggle-input" />
                  <label for="marketing-email" class="toggle-label"></label>
                </div>
              </div>
            </div>
            
            <div class="notification-group">
              <h3 class="group-title">Push Notifications</h3>
              
              <div class="notification-item">
                <div class="notification-info">
                  <div class="notification-title">New Messages</div>
                  <div class="notification-description">Get notified when you receive new messages</div>
                </div>
                <div class="toggle-switch">
                  <input type="checkbox" id="messages-push" class="toggle-input" checked />
                  <label for="messages-push" class="toggle-label"></label>
                </div>
              </div>
              
              <div class="notification-item">
                <div class="notification-info">
                  <div class="notification-title">System Updates</div>
                  <div class="notification-description">Get notified about system maintenance and updates</div>
                </div>
                <div class="toggle-switch">
                  <input type="checkbox" id="system-push" class="toggle-input" checked />
                  <label for="system-push" class="toggle-label"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Appearance Settings -->
        <div v-if="activeTab === 'appearance'" class="settings-section">
          <div class="section-header">
            <h2 class="section-title">Appearance</h2>
            <p class="section-description">Customize how the application looks and feels</p>
          </div>
          
          <div class="appearance-form">
            <div class="appearance-group">
              <h3 class="group-title">Theme</h3>
              <div class="theme-options">
                <div class="theme-option">
                  <input type="radio" id="light" name="theme" value="light" checked />
                  <label for="light" class="theme-label">
                    <div class="theme-preview light"></div>
                    <span>Light</span>
                  </label>
                </div>
                
                <div class="theme-option">
                  <input type="radio" id="dark" name="theme" value="dark" />
                  <label for="dark" class="theme-label">
                    <div class="theme-preview dark"></div>
                    <span>Dark</span>
                  </label>
                </div>
                
                <div class="theme-option">
                  <input type="radio" id="auto" name="theme" value="auto" />
                  <label for="auto" class="theme-label">
                    <div class="theme-preview auto"></div>
                    <span>Auto</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="appearance-group">
              <h3 class="group-title">Language</h3>
              <select class="language-select">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { User, Shield, Bell, Palette } from 'lucide-vue-next'

export default {
  name: 'Settings',
  components: {
    User,
    Shield,
    Bell,
    Palette
  },
  setup() {
    const activeTab = ref('profile')
    
    const tabs = [
      { id: 'profile', label: 'Profile', icon: 'User' },
      { id: 'security', label: 'Security', icon: 'Shield' },
      { id: 'notifications', label: 'Notifications', icon: 'Bell' },
      { id: 'appearance', label: 'Appearance', icon: 'Palette' }
    ]
    
    return {
      activeTab,
      tabs
    }
  }
}
</script>

<style scoped>
.settings {
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

.settings-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

.settings-nav {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  padding: 8px;
  height: fit-content;
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
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: none;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.nav-link.active {
  background: #3b82f6;
  color: white;
}

.settings-content {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.settings-section {
  padding: 32px;
}

.section-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.section-description {
  color: #64748b;
  margin: 0;
}

/* Profile Settings */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-secondary, .btn-text {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
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

.btn-text {
  background: none;
  color: #64748b;
}

.btn-text:hover {
  color: #3b82f6;
}

/* Security Settings */
.security-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.security-title {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
  margin: 0 0 4px 0;
}

.security-description {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  display: block;
  width: 44px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.2s;
}

.toggle-label::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
}

.toggle-input:checked + .toggle-label {
  background: #3b82f6;
}

.toggle-input:checked + .toggle-label::after {
  transform: translateX(20px);
}

/* Notifications Settings */
.notifications-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.notification-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-title {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}

.notification-description {
  color: #64748b;
  font-size: 14px;
}

/* Appearance Settings */
.appearance-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.appearance-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.theme-option input {
  display: none;
}

.theme-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-option input:checked + .theme-label {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.theme-preview {
  width: 40px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.theme-preview.light {
  background: white;
}

.theme-preview.dark {
  background: #1e293b;
}

.theme-preview.auto {
  background: linear-gradient(90deg, white 50%, #1e293b 50%);
}

.language-select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  width: 200px;
}

@media (max-width: 1024px) {
  .settings-container {
    grid-template-columns: 1fr;
  }
  
  .settings-nav {
    order: 2;
  }
  
  .nav-list {
    display: flex;
    overflow-x: auto;
    gap: 4px;
  }
  
  .nav-item {
    margin-bottom: 0;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-group.full-width {
    grid-column: span 1;
  }
  
  .theme-options {
    grid-template-columns: 1fr;
  }
  
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
