# MQTT Services Container (Broker + Subscriber)
FROM node:20-alpine AS mqtt-base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose ports
EXPOSE 1883 8083 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "const net = require('net'); const client = net.connect(1883, 'localhost'); client.on('connect', () => { console.log('MQTT broker healthy'); client.end(); process.exit(0); }); client.on('error', () => process.exit(1));"

# Start both MQTT broker and backend server
CMD ["sh", "-c", "node mqtt-broker.js & node server.js & wait"]
