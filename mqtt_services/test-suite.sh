#!/bin/bash

# MQTT Test Suite - Complete testing environment

echo "🚀 MQTT Test Suite"
echo "=================="
echo "Complete MQTT broker testing environment"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    netstat -ln 2>/dev/null | grep -q ":$1 "
}

echo -e "${BLUE}Environment Check:${NC}"
echo "=================="

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "✅ Node.js: $NODE_VERSION"
else
    echo -e "❌ Node.js not found - please install Node.js"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "✅ npm: $NPM_VERSION"
else
    echo -e "❌ npm not found"
    exit 1
fi

# Check dependencies
if [ -f "package.json" ]; then
    echo -e "✅ package.json found"
    if [ -d "node_modules" ]; then
        echo -e "✅ Dependencies installed"
    else
        echo -e "⚠️  Dependencies not installed - run 'npm install'"
    fi
else
    echo -e "❌ package.json not found"
    exit 1
fi

echo ""
echo -e "${BLUE}Port Status:${NC}"
echo "============"

# Check MQTT ports
if port_in_use 1883; then
    echo -e "🔴 Port 1883 (MQTT TCP) is in use"
else
    echo -e "✅ Port 1883 (MQTT TCP) is available"
fi

if port_in_use 8083; then
    echo -e "🔴 Port 8083 (MQTT WebSocket) is in use"
else
    echo -e "✅ Port 8083 (MQTT WebSocket) is available"
fi

echo ""
echo -e "${BLUE}Available Test Scenarios:${NC}"
echo "=========================="
echo "1. Start MQTT Broker"
echo "2. Start Universal Subscriber"
echo "3. Start External Publisher"
echo "4. Run Complete Test (Broker + Subscriber + Publisher)"
echo "5. Network Setup (Firewall Configuration)"
echo "6. Exit"
echo ""

read -p "Select test scenario (1-6): " choice

case $choice in
    1)
        echo -e "${GREEN}Starting MQTT Broker...${NC}"
        echo "Press Ctrl+C to stop"
        echo ""
        npm run broker
        ;;
    2)
        echo -e "${GREEN}Starting Universal Subscriber...${NC}"
        echo "This will monitor all MQTT topics"
        echo "Press Ctrl+C to stop"
        echo ""
        if [ -z "$MQTT_HOST" ]; then
            echo -e "${YELLOW}Using localhost - set MQTT_HOST for remote broker${NC}"
        else
            echo -e "${BLUE}Using broker: $MQTT_HOST${NC}"
        fi
        npm run subscriber
        ;;
    3)
        echo -e "${GREEN}Starting External Publisher...${NC}"
        echo "This will publish sample IoT data"
        echo "Press Ctrl+C to stop"
        echo ""
        if [ -z "$MQTT_HOST" ]; then
            echo -e "${YELLOW}Using localhost - set MQTT_HOST for remote broker${NC}"
        else
            echo -e "${BLUE}Using broker: $MQTT_HOST${NC}"
        fi
        npm run external-publisher
        ;;
    4)
        echo -e "${GREEN}Running Complete Test Suite...${NC}"
        echo "This will start Broker, Subscriber, and Publisher"
        echo "Press Ctrl+C to stop all processes"
        echo ""
        
        # Start broker in background
        echo -e "${BLUE}Starting MQTT Broker...${NC}"
        npm run broker &
        BROKER_PID=$!
        
        # Wait for broker to start
        sleep 3
        
        # Start subscriber in background
        echo -e "${BLUE}Starting Subscriber...${NC}"
        npm run subscriber &
        SUBSCRIBER_PID=$!
        
        # Wait for subscriber to connect
        sleep 2
        
        # Start publisher
        echo -e "${BLUE}Starting Publisher...${NC}"
        npm run external-publisher &
        PUBLISHER_PID=$!
        
        echo -e "${GREEN}All components started!${NC}"
        echo "Monitor the output to see MQTT messages flowing"
        echo "Press any key to stop all processes..."
        
        # Wait for user input
        read -n 1 -s
        
        # Stop all processes
        echo -e "\n${YELLOW}Stopping all processes...${NC}"
        kill $PUBLISHER_PID 2>/dev/null
        kill $SUBSCRIBER_PID 2>/dev/null
        kill $BROKER_PID 2>/dev/null
        
        # Wait a moment for graceful shutdown
        sleep 2
        
        echo -e "${GREEN}All processes stopped${NC}"
        ;;
    5)
        echo -e "${GREEN}Running Network Setup...${NC}"
        echo "This will configure firewall rules for MQTT"
        echo ""
        ./setup-network.sh
        ;;
    6)
        echo -e "${GREEN}Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid selection${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}Test completed!${NC}"
