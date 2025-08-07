#!/bin/bash

# Network Setup Script for MQTT Broker
# Configures firewall rules and port forwarding for external MQTT access

echo "🔧 MQTT Broker Network Setup"
echo "============================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detect current user and system info
CURRENT_USER=$(whoami)
HOSTNAME=$(hostname)
SYSTEM_INFO=$(uname -a)

echo -e "${BLUE}System Information:${NC}"
echo "User: $CURRENT_USER"
echo "Hostname: $HOSTNAME"
echo "System: $SYSTEM_INFO"
echo ""

# Get network interfaces and IP addresses
echo -e "${BLUE}Network Interfaces:${NC}"
ip addr show | grep -E "inet [0-9]" | grep -v 127.0.0.1 | awk '{print "  "$2}' | sort
echo ""

# MQTT ports to configure
MQTT_TCP_PORT=1883
MQTT_WS_PORT=8083
BACKEND_PORT=3001

echo -e "${BLUE}Configuring ports:${NC}"
echo "  - MQTT TCP: $MQTT_TCP_PORT"
echo "  - MQTT WebSocket: $MQTT_WS_PORT"
echo "  - Backend API: $BACKEND_PORT"
echo ""

# Function to check if firewall is active
check_firewall_status() {
    if command -v ufw >/dev/null 2>&1; then
        if ufw status | grep -q "Status: active"; then
            echo "UFW"
        else
            echo "UFW_INACTIVE"
        fi
    elif command -v firewall-cmd >/dev/null 2>&1; then
        if systemctl is-active firewalld >/dev/null 2>&1; then
            echo "FIREWALLD"
        else
            echo "FIREWALLD_INACTIVE"
        fi
    elif command -v iptables >/dev/null 2>&1; then
        echo "IPTABLES"
    else
        echo "NONE"
    fi
}

# Function to configure UFW
configure_ufw() {
    echo -e "${YELLOW}Configuring UFW firewall...${NC}"
    
    # Check if UFW is active
    if ! ufw status | grep -q "Status: active"; then
        echo -e "${RED}UFW is not active. Activating...${NC}"
        if [[ $EUID -eq 0 ]]; then
            ufw --force enable
        else
            echo -e "${RED}Please run with sudo to enable UFW${NC}"
            echo "sudo ufw --force enable"
        fi
    fi
    
    # Add MQTT rules
    if [[ $EUID -eq 0 ]]; then
        ufw allow $MQTT_TCP_PORT/tcp comment 'MQTT TCP'
        ufw allow $MQTT_WS_PORT/tcp comment 'MQTT WebSocket'
        ufw allow $BACKEND_PORT/tcp comment 'Backend API'
        echo -e "${GREEN}✅ UFW rules added successfully${NC}"
    else
        echo -e "${YELLOW}Run these commands as sudo:${NC}"
        echo "sudo ufw allow $MQTT_TCP_PORT/tcp comment 'MQTT TCP'"
        echo "sudo ufw allow $MQTT_WS_PORT/tcp comment 'MQTT WebSocket'"
        echo "sudo ufw allow $BACKEND_PORT/tcp comment 'Backend API'"
    fi
    
    # Show current status
    echo -e "${BLUE}UFW Status:${NC}"
    ufw status numbered
}

# Function to configure firewalld
configure_firewalld() {
    echo -e "${YELLOW}Configuring firewalld...${NC}"
    
    if [[ $EUID -eq 0 ]]; then
        firewall-cmd --permanent --add-port=$MQTT_TCP_PORT/tcp
        firewall-cmd --permanent --add-port=$MQTT_WS_PORT/tcp
        firewall-cmd --permanent --add-port=$BACKEND_PORT/tcp
        firewall-cmd --reload
        echo -e "${GREEN}✅ Firewalld rules added successfully${NC}"
    else
        echo -e "${YELLOW}Run these commands as sudo:${NC}"
        echo "sudo firewall-cmd --permanent --add-port=$MQTT_TCP_PORT/tcp"
        echo "sudo firewall-cmd --permanent --add-port=$MQTT_WS_PORT/tcp"
        echo "sudo firewall-cmd --permanent --add-port=$BACKEND_PORT/tcp"
        echo "sudo firewall-cmd --reload"
    fi
    
    # Show current configuration
    echo -e "${BLUE}Firewalld Status:${NC}"
    firewall-cmd --list-ports
}

# Function to configure iptables
configure_iptables() {
    echo -e "${YELLOW}Configuring iptables...${NC}"
    
    if [[ $EUID -eq 0 ]]; then
        iptables -A INPUT -p tcp --dport $MQTT_TCP_PORT -j ACCEPT
        iptables -A INPUT -p tcp --dport $MQTT_WS_PORT -j ACCEPT
        iptables -A INPUT -p tcp --dport $BACKEND_PORT -j ACCEPT
        
        # Save iptables rules (depends on distribution)
        if command -v iptables-save >/dev/null 2>&1; then
            if [[ -d /etc/iptables ]]; then
                iptables-save > /etc/iptables/rules.v4
            elif [[ -f /etc/sysconfig/iptables ]]; then
                iptables-save > /etc/sysconfig/iptables
            fi
        fi
        echo -e "${GREEN}✅ Iptables rules added successfully${NC}"
    else
        echo -e "${YELLOW}Run these commands as sudo:${NC}"
        echo "sudo iptables -A INPUT -p tcp --dport $MQTT_TCP_PORT -j ACCEPT"
        echo "sudo iptables -A INPUT -p tcp --dport $MQTT_WS_PORT -j ACCEPT"
        echo "sudo iptables -A INPUT -p tcp --dport $BACKEND_PORT -j ACCEPT"
        echo "sudo iptables-save > /etc/iptables/rules.v4  # or appropriate location"
    fi
    
    # Show current rules
    echo -e "${BLUE}Current iptables rules:${NC}"
    iptables -L INPUT -n --line-numbers | grep -E "(1883|8083|3001)"
}

# Detect and configure firewall
FIREWALL_TYPE=$(check_firewall_status)

echo -e "${BLUE}Detected firewall: $FIREWALL_TYPE${NC}"
echo ""

case $FIREWALL_TYPE in
    "UFW")
        configure_ufw
        ;;
    "UFW_INACTIVE")
        echo -e "${YELLOW}UFW is installed but inactive${NC}"
        configure_ufw
        ;;
    "FIREWALLD")
        configure_firewalld
        ;;
    "FIREWALLD_INACTIVE")
        echo -e "${YELLOW}Firewalld is installed but inactive${NC}"
        echo -e "${RED}Please start firewalld first: sudo systemctl start firewalld${NC}"
        ;;
    "IPTABLES")
        configure_iptables
        ;;
    "NONE")
        echo -e "${YELLOW}No recognized firewall detected${NC}"
        echo "You may need to manually configure your firewall for ports:"
        echo "- $MQTT_TCP_PORT (MQTT TCP)"
        echo "- $MQTT_WS_PORT (MQTT WebSocket)"
        echo "- $BACKEND_PORT (Backend API)"
        ;;
esac

echo ""
echo -e "${BLUE}Network Configuration Complete${NC}"
echo "================================"

# Test port accessibility
echo -e "${BLUE}Testing port accessibility...${NC}"
for port in $MQTT_TCP_PORT $MQTT_WS_PORT $BACKEND_PORT; do
    if netstat -ln | grep -q ":$port "; then
        echo -e "${GREEN}✅ Port $port is listening${NC}"
    else
        echo -e "${YELLOW}⚠️  Port $port is not currently listening${NC}"
    fi
done

echo ""
echo -e "${BLUE}Connection Instructions for External Clients:${NC}"
echo "=============================================="
echo "1. Use one of these server IP addresses:"
ip addr show | grep -E "inet [0-9]" | grep -v 127.0.0.1 | awk '{print "   - "$2}' | sort

echo ""
echo "2. MQTT Connection Formats:"
echo "   - TCP: mqtt://YOUR_SERVER_IP:$MQTT_TCP_PORT"
echo "   - WebSocket: ws://YOUR_SERVER_IP:$MQTT_WS_PORT/mqtt"
echo ""
echo "3. Test connectivity from external machine:"
echo "   - ping YOUR_SERVER_IP"
echo "   - telnet YOUR_SERVER_IP $MQTT_TCP_PORT"
echo "   - nc -zv YOUR_SERVER_IP $MQTT_TCP_PORT"
echo ""
echo "4. Start your MQTT broker with:"
echo "   npm run broker"
echo ""
echo "5. Start external publisher with:"
echo "   MQTT_HOST=YOUR_SERVER_IP npm run external-publisher"

echo ""
echo -e "${GREEN}🎉 Network setup completed!${NC}"
