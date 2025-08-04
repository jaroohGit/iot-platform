# IoT Monitoring Platform

ระบบติดตามอุปกรณ์ IoT แบบ Real-time สำหรับอุตสาหกรรม

## 🚀 คุณสมบัติ

- **Real-time Monitoring**: ติดตามข้อมูลอุปกรณ์ทุกวินาที
- **Industrial Devices**: รองรับ Flow Rate (3), ORP (6), pH (6), และ Power Meter (1)
- **WebSocket Communication**: การสื่อสารแบบ Real-time ผ่าน Socket.IO
- **Responsive Design**: ใช้งานได้ทั้งเดสก์ท็อปและมือถือ
- **External Access**: เข้าถึงได้จากอุปกรณ์ภายนอก

## 📁 โครงสร้างโปรเจกต์

```
iot-monitoring-platform/
├── src/                # Vue.js Frontend
│   ├── views/
│   │   └── Dashboard.vue
│   ├── components/
│   │   └── layout/
│   └── App.vue
├── backend/            # Node.js Backend
│   ├── server.js
│   ├── package.json
│   └── public/
│       └── external-test.html
├── package.json
└── README.md
```

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- Vue.js 3 (Composition API)
- Vite (Build Tool)
- Socket.IO Client
- Lucide Vue Icons
- Vue Router 4

### Backend
- Node.js + Express
- Socket.IO Server
- CORS Support
- Real-time Data Simulation

## 🚀 การติดตั้งและรัน

### 1. Clone โปรเจกต์
```bash
git clone https://github.com/jaroohGit/iot-platform.git
cd iot-platform
```

### 2. ติดตั้ง Dependencies

#### Frontend
```bash
npm install
```

#### Backend
```bash
cd backend
npm install
cd ..
```

### 3. รันโปรเจกต์

#### เริ่ม Backend Server
```bash
cd backend
npm run dev
# รันที่ http://localhost:3001
```

#### เริ่ม Frontend Server (terminal ใหม่)
```bash
npm run dev
# รันที่ http://localhost:5173
```

## 🌐 การเข้าถึง

### Local Access
- **Frontend**: http://localhost:5173/
- **Backend API**: http://localhost:3001/api/
- **WebSocket**: ws://localhost:3001

### External Access (แทนที่ YOUR_IP ด้วย IP ของเครื่อง)
- **Frontend**: http://YOUR_IP:5173/
- **Backend API**: http://YOUR_IP:3001/api/
- **Test Page**: http://YOUR_IP:3001/external-test.html

## 🔧 การกำหนดค่า

### Firewall (Ubuntu/Linux)
```bash
sudo ufw allow 3001/tcp comment "IoT Backend Server"
sudo ufw allow 5173/tcp comment "IoT Frontend Server"
```

### Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ backend:
```env
PORT=3001
NODE_ENV=development
```

## 📊 API Endpoints

- `GET /api/health` - ตรวจสอบสถานะเซิร์ฟเวอร์
- `GET /api/devices` - ข้อมูลอุปกรณ์ทั้งหมด
- `GET /api/devices/flow-rate` - ข้อมูล Flow Rate
- `GET /api/devices/orp` - ข้อมูล ORP
- `GET /api/devices/ph` - ข้อมูล pH
- `GET /api/devices/power` - ข้อมูล Power Consumption

## 🔌 WebSocket Events

### Client → Server
- `requestDeviceStatus` - ขอข้อมูลสถานะอุปกรณ์

### Server → Client
- `deviceData` - ข้อมูลอุปกรณ์แบบ Real-time (ทุกวินาที)
- `deviceStatus` - สถานะอุปกรณ์
- `activityLog` - Log กิจกรรม (ทุก 5 วินาที)

## 🐛 การแก้ไขปัญหา

### 1. Connection Timeout
- ตรวจสอบ Firewall settings
- ตรวจสอบว่า Backend server รันอยู่
- ใช้ `curl` ทดสอบ API: `curl http://localhost:3001/api/health`

### 2. ข้อมูลไม่อัปเดต
- ตรวจสอบ WebSocket connection ใน Browser Console
- ตรวจสอบ Backend logs สำหรับ client connections

### 3. External Access ไม่ได้
- ตรวจสอบ IP address: `hostname -I`
- ตรวจสอบ Firewall rules: `sudo ufw status`

## 📱 อุปกรณ์ที่รองรับ

### Device Categories
- **Flow Rate Devices (3)**: FR001, FR002, FR003
- **ORP Devices (6)**: ORP001-ORP006
- **pH Devices (6)**: PH001-PH006  
- **Power Meters (1)**: PM001

### Data Ranges
- Flow Rate: 120-135 L/h
- ORP Level: 400-500 mV
- pH Level: 6.8-7.8
- Power Consumption: 2.0-3.5 kW

## 📝 License

MIT License - ดูรายละเอียดใน LICENSE file

## 👥 Contributors

- Developer: Teddy
- Repository: https://github.com/jaroohGit/iot-platform

---

## 🔄 Updates

### Version 1.0.0
- ✅ Real-time IoT monitoring dashboard
- ✅ WebSocket communication via Socket.IO
- ✅ External device access support
- ✅ Industrial device simulation
- ✅ Auto-detection for localhost/external IP
  - 1 Power meter device

- **Modern Dashboard Interface**:
  - Responsive sidebar navigation
  - Professional header with search and notifications
  - Real-time status cards
  - Activity logging system
  - Interactive charts and analytics

- **Multi-page Application**:
  - Dashboard - Device overview and monitoring
  - Users - User management interface
  - Products - Product catalog management
  - Analytics - Data visualization and insights
  - Settings - Application configuration

## 🛠️ Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Build Tool**: Vite
- **Routing**: Vue Router 4
- **Icons**: Lucide Vue Next
- **Styling**: Modern CSS with responsive design
- **Development**: Hot Module Replacement (HMR)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jaroohGit/iot-platform.git
   cd iot-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 📱 Device Categories

### Flow Rate Devices (3 Active)
- Monitor liquid flow rates in real-time
- Operational status tracking
- Flow rate measurements and alerts

### ORP Devices (6 Active)
- Oxidation-Reduction Potential monitoring
- Water quality assessment
- Chemical process control

### pH Devices (6 Active)
- pH level monitoring and control
- Acid/base balance tracking
- Automated pH regulation alerts

### Power Meter (1 Active)
- Real-time power consumption monitoring
- Energy usage analytics
- Power efficiency tracking

## 🎨 UI Components

- **Responsive Layout**: Mobile-first design approach
- **Modern Sidebar**: Collapsible navigation with icons
- **Professional Header**: Search functionality and user profile
- **Status Cards**: Real-time device status indicators
- **Activity Log**: Device event tracking and notifications
- **Charts & Analytics**: Visual data representation

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Developed by [jaroohGit](https://github.com/jaroohGit)

---

Built with ❤️ using Vue 3 and Vite
