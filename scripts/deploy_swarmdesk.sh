#!/bin/bash

# SwarmDesk Deployment Script for Madness Interactive
# Integrates with existing Inventorium deployment process

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REMOTE_HOST="eaws"
REMOTE_PATH="/var/www/html"
LOCAL_PATH="../.."  # Go up to Inventorium root

echo -e "${BLUE}🚀 SwarmDesk Integration Deployment for Madness Interactive${NC}"
echo -e "${BLUE}==========================================================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we can find the integrated SwarmDesk files
cd $LOCAL_PATH
if [ ! -f "index.html" ] || [ ! -f "swarmdesk.js" ]; then
    print_error "SwarmDesk integration files not found. Make sure you're running from SwarmDesk/scripts/ directory."
    exit 1
fi

print_status "Found SwarmDesk integration files in Inventorium root"

# List all files that will be deployed
echo -e "${BLUE}📦 Files to be deployed:${NC}"
echo "  🎪 index.html (integrated React + SwarmDesk)"
echo "  🌀 swarmdesk.js (3D workshop environment)"
echo "  📱 floating-panel-system.js (panel management)"
echo "  ⚡ floating-panel-advanced.js (advanced features)"
echo "  🔗 swarmdesk-dashboard-hooks.js (dashboard integration)"
echo "  📁 SwarmDesk/ directory (if present)"

# Create remote directory if it doesn't exist
echo -e "${BLUE}📁 Setting up remote directory...${NC}"
ssh $REMOTE_HOST "sudo mkdir -p $REMOTE_PATH"
print_status "Remote directory prepared"

# Deploy core SwarmDesk integration files
echo -e "${BLUE}📤 Deploying SwarmDesk integration files...${NC}"
scp index.html \
    swarmdesk.js \
    floating-panel-system.js \
    floating-panel-advanced.js \
    swarmdesk-dashboard-hooks.js \
    $REMOTE_HOST:~/
print_status "Core integration files uploaded to staging area"

# Deploy SwarmDesk directory if it exists
if [ -d "SwarmDesk" ]; then
    echo -e "${BLUE}📁 Deploying SwarmDesk directory...${NC}"
    rsync -avz --progress SwarmDesk/ $REMOTE_HOST:~/SwarmDesk_temp/
    print_status "SwarmDesk directory uploaded"
fi

# Move files to web directory with proper permissions
echo -e "${BLUE}🔧 Setting up web directory with proper permissions...${NC}"
ssh $REMOTE_HOST "
    # Move core integration files
    sudo mv ~/index.html ~/swarmdesk.js ~/floating-panel-system.js ~/floating-panel-advanced.js ~/swarmdesk-dashboard-hooks.js $REMOTE_PATH/ &&
    
    # Move SwarmDesk directory if it exists
    if [ -d ~/SwarmDesk_temp ]; then
        sudo rm -rf $REMOTE_PATH/SwarmDesk
        sudo mv ~/SwarmDesk_temp $REMOTE_PATH/SwarmDesk
    fi &&
    
    # Set proper ownership and permissions
    sudo chown -R www-data:www-data $REMOTE_PATH &&
    sudo chmod -R 755 $REMOTE_PATH &&
    
    # Fix any specific permission issues
    sudo find $REMOTE_PATH -name '*.js' -exec chmod 644 {} \; &&
    sudo find $REMOTE_PATH -name '*.html' -exec chmod 644 {} \;
"
print_status "Files moved to web directory with proper permissions"

# Test deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
if curl -s --head "https://madnessinteractive.cc/" | head -n 1 | grep -q "200 OK"; then
    print_status "Integrated app is accessible at https://madnessinteractive.cc/"
else
    print_warning "Deployment test inconclusive - check manually"
fi

# Test SwarmDesk specific functionality
echo -e "${BLUE}🎪 Testing SwarmDesk integration...${NC}"
if curl -s "https://madnessinteractive.cc/" | grep -q "swarmdesk.js"; then
    print_status "SwarmDesk integration detected in main application"
else
    print_warning "SwarmDesk integration not detected - check file deployment"
fi

# Integration with backend (if running)
echo -e "${BLUE}🔗 Checking backend integration...${NC}"
if curl -s --head "https://madnessinteractive.cc/api/health" | head -n 1 | grep -q "200 OK"; then
    print_status "Backend API is running - SwarmDesk can access MCP tools"
else
    print_warning "Backend API not responding - SwarmDesk will run in demo mode"
fi

echo -e "${GREEN}🎉 SwarmDesk Integration deployment completed successfully!${NC}"
echo -e "${BLUE}📍 Access integrated app at: https://madnessinteractive.cc/${NC}"
echo -e "${BLUE}🔄 Toggle between React and SwarmDesk modes using the top-right button${NC}"
echo -e "${BLUE}🎮 SwarmDesk controls: WASD to navigate, E to interact, M for MCP debugging${NC}"
echo -e "${BLUE}🤖 Experience the full Madness Interactive ecosystem!${NC}" 
