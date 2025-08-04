# IoT Backend Server

Real-time IoT data simulation backend with WebSocket support for industrial monitoring dashboard.

## Features

- **Real-time WebSocket Data**: Simulates Flow Rate, ORP, pH, and Power consumption
- **Device Management**: Tracks individual device status and readings
- **Activity Logging**: Generates realistic device activity logs
- **REST API**: HTTP endpoints for device data access
- **CORS Support**: Configured for frontend integration

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Start production server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /api/devices` - All device data and status
- `GET /api/devices/flow-rate` - Flow rate device data
- `GET /api/devices/orp` - ORP device data  
- `GET /api/devices/ph` - pH device data
- `GET /api/devices/power` - Power meter data
- `GET /api/health` - Server health status

## WebSocket Events

### Emitted by Server:
- `deviceData` - Real-time sensor readings
- `activityLog` - Device activity notifications
- `deviceStatus` - Individual device status updates

### Received from Client:
- `requestDeviceStatus` - Request current device status

## Device Simulation

- **Flow Rate**: 120-135 L/h with realistic fluctuations
- **ORP Level**: 400-500 mV oxidation-reduction potential
- **pH Level**: 6.8-7.8 with water chemistry variations
- **Power Consumption**: 2.0-3.5 kW based on load patterns

## Configuration

Server runs on port 3001 by default. Set `PORT` environment variable to change.

WebSocket CORS configured for frontend at `http://localhost:5173`.
