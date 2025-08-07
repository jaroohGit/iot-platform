# MQTT Test Environment

This directory contains a dedicated MQTT broker for handling external IoT device connections from other PCs in your network.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   cd /home/teddy/mqtt_test
   npm install
   ```

2. **Configure network (optional):**
   ```bash
   ./setup-network.sh
   ```

3. **Start the MQTT broker:**
   ```bash
   npm run broker
   ```

4. **Monitor all MQTT messages (optional):**
   ```bash
   npm run subscriber
   ```

5. **Test with external publisher (from another PC):**
   ```bash
   MQTT_HOST=YOUR_SERVER_IP npm run external-publisher
   ```

## 📁 Files Overview

- **`mqtt-broker.js`** - Main MQTT broker with external connectivity support
- **`mqtt_subscriber.js`** - Universal MQTT subscriber for monitoring all topics
- **`external-mqtt-publisher.js`** - Sample external publisher for remote PCs
- **`setup-network.sh`** - Network configuration script for firewall rules
- **`package.json`** - Project dependencies and scripts
- **`README.md`** - This documentation file

## 🔧 Configuration

### MQTT Broker Settings
- **TCP Port:** 1883 (standard MQTT)
- **WebSocket Port:** 8083 (for web clients)
- **Binding:** 0.0.0.0 (accepts external connections)

### Network Requirements
The broker accepts connections from external machines. Ensure:
- Firewall allows ports 1883 and 8083
- Network connectivity between machines
- Correct IP address configuration

## 📡 External Publisher Usage

### From Remote PC (Linux/Mac):
```bash
# Install Node.js and npm first
npm install mqtt

# Set server IP and run
MQTT_HOST=192.168.1.100 node external-mqtt-publisher.js
```

### From Remote PC (Windows):
```cmd
rem Install Node.js and npm first
npm install mqtt

rem Set server IP and run
set MQTT_HOST=192.168.1.100
node external-mqtt-publisher.js
```

## 🔍 Monitoring

### MQTT Broker Logging
The broker provides comprehensive logging:
- Client connection/disconnection events
- Message statistics every 30 seconds
- Network interface discovery
- Error handling and troubleshooting info

### Universal Subscriber
The `mqtt_subscriber.js` provides real-time monitoring of all MQTT messages:
- **Universal Topic Subscription**: Monitors all topics with wildcards (`#`, `+/+/+`, `iot/+/+/+`)
- **Structured Message Display**: Parses and formats JSON payloads
- **Real-time Statistics**: Shows message rates, topic activity, and device summaries
- **Device Tracking**: Monitors individual device status and message frequency
- **Comprehensive Analytics**: 30-second statistics and 60-second device reports

## 📊 Message Format

External publishers send structured IoT data:

```json
{
  "deviceId": "ext_temp_hostname",
  "deviceType": "temperature",
  "location": "External - Hostname Room",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "value": 25.6,
  "unit": "°C",
  "quality": "good",
  "batteryLevel": 85,
  "signalStrength": 92,
  "metadata": {
    "firmware": "2.3.0",
    "serialNumber": "EXTAB1CD2EF3G",
    "externalClient": true,
    "publisherHost": "remote-pc",
    "publisherIP": "192.168.1.150",
    "messageNumber": 142
  }
}
```

## 🛠 Troubleshooting

### Connection Issues
1. **Check broker is running:**
   ```bash
   netstat -ln | grep 1883
   ```

2. **Test from same machine:**
   ```bash
   npm run external-publisher
   ```

3. **Test network connectivity:**
   ```bash
   ping YOUR_SERVER_IP
   telnet YOUR_SERVER_IP 1883
   ```

4. **Check firewall:**
   ```bash
   # UFW
   sudo ufw status
   
   # Firewalld
   sudo firewall-cmd --list-ports
   
   # Iptables
   sudo iptables -L INPUT -n
   ```

### Common Solutions
- **Port blocked:** Run `./setup-network.sh` as sudo
- **Wrong IP:** Check server IP with `ip addr show`
- **DNS issues:** Use IP address instead of hostname
- **Authentication:** Check broker logs for auth requirements

## 🔗 Integration

This broker integrates with your main IoT platform:
1. External devices publish to this broker
2. Your backend subscribes to receive data
3. Data flows to your Vue.js dashboard in real-time

## 📋 Device Types

The external publisher simulates these device types:
- **Temperature** sensors (°C)
- **Humidity** sensors (%)
- **Pressure** sensors (hPa)
- **Light** sensors (lux)
- **Actuator** devices (status)

## 🔐 Security Notes

- Default configuration has no authentication
- For production, enable authentication in `mqtt-broker.js`
- Consider TLS/SSL for encrypted communication
- Use VPN for secure remote connections

## 📞 Support

For issues or questions:
1. Check broker logs for error messages
2. Verify network configuration
3. Test step-by-step from local to remote
4. Monitor message flow in broker logs
