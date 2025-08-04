# IoT Platform - Industrial Monitoring Dashboard

A modern, responsive industrial IoT monitoring dashboard built with Vue 3, Vite, and designed for real-time monitoring of industrial devices including Flow Rate, ORP, pH, and Power systems.

## 🚀 Features

### 📊 **Industrial Device Monitoring**
- **Flow Rate Devices**: Monitor 3 active flow rate sensors
- **ORP Devices**: Track 6 oxidation-reduction potential devices
- **pH Devices**: Monitor 6 pH level sensors
- **Power Meter**: Single power consumption monitoring device

### 🎨 **Modern UI/UX**
- Clean, professional dashboard interface
- Responsive design that works on desktop, tablet, and mobile
- Collapsible sidebar navigation with smooth animations
- Real-time device status indicators
- Activity log with recent device events

### 🔧 **Technical Features**
- Vue 3 with Composition API
- Vue Router for seamless navigation
- Vite for fast development and building
- Lucide Vue icons for modern iconography
- CSS Grid and Flexbox for responsive layouts
- Component-based architecture

## 📱 **Pages & Navigation**

- **Dashboard**: Real-time device monitoring and status overview
- **Users**: User management interface
- **Products**: Product catalog and management
- **Analytics**: Data visualization and reporting
- **Settings**: Application configuration and preferences

## 🛠️ **Installation & Setup**

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Clone & Install
```bash
# Clone the repository
git clone https://github.com/jaroohGit/iot-platform.git

# Navigate to project directory
cd iot-platform

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ **Project Structure**

```
iot-platform/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable Vue components
│   ├── views/             # Page components
│   │   ├── Dashboard.vue  # Main monitoring dashboard
│   │   ├── Users.vue      # User management
│   │   ├── Products.vue   # Product catalog
│   │   ├── Analytics.vue  # Data analytics
│   │   └── Settings.vue   # Application settings
│   ├── App.vue           # Root component with layout
│   ├── main.js           # Application entry point
│   └── style.css         # Global styles
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🎯 **Key Components**

### Dashboard Features
- **Device Status Cards**: Real-time status of all industrial devices
- **Activity Log**: Recent device events and system notifications
- **Monitoring Charts**: Placeholders for data visualization
- **Responsive Grid**: Adapts to different screen sizes

### Navigation
- **Sidebar Menu**: Collapsible navigation with active state indicators
- **Header Bar**: Global search, notifications, and user profile
- **Mobile-First**: Touch-friendly interface for mobile devices

## 🔧 **Technology Stack**

- **Frontend Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **Icons**: Lucide Vue Next
- **Styling**: Modern CSS with Grid & Flexbox
- **Development**: Hot Module Replacement (HMR)

## 📊 **Device Monitoring**

The platform is designed to monitor various industrial devices:

| Device Type | Count | Purpose |
|-------------|-------|---------|
| Flow Rate | 3 | Monitor liquid/gas flow rates |
| ORP | 6 | Oxidation-reduction potential monitoring |
| pH | 6 | Acidity/alkalinity level tracking |
| Power Meter | 1 | Electrical consumption monitoring |

## 🚀 **Development**

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Development Server
The development server runs on `http://localhost:5173/` with hot reload enabled.

## 📝 **License**

This project is licensed under the MIT License.

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 **Contact**

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for industrial IoT monitoring
