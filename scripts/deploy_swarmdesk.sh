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
REMOTE_PATH="/var/www/html/SwarmDesk"
LOCAL_PATH="."

echo -e "${BLUE}🚀 SwarmDesk Deployment for Madness Interactive${NC}"
echo -e "${BLUE}===============================================${NC}"

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

# Check if we're in the SwarmDesk directory
if [ ! -f "index.html" ] || [ ! -f "swarmdesk.js" ]; then
    print_error "SwarmDesk files not found. Make sure you're in the SwarmDesk directory."
    exit 1
fi

print_status "Found SwarmDesk files in current directory"

# Create remote directory if it doesn't exist
echo -e "${BLUE}📁 Setting up remote directory...${NC}"
ssh $REMOTE_HOST "sudo mkdir -p $REMOTE_PATH"
print_status "Remote directory prepared"

# Deploy files
echo -e "${BLUE}📤 Deploying SwarmDesk files...${NC}"
scp index.html swarmdesk.js README.md $REMOTE_HOST:~/
print_status "Files uploaded to staging area"

# Move files to web directory with proper permissions
echo -e "${BLUE}🔧 Setting up web directory...${NC}"
ssh $REMOTE_HOST "
    sudo mv ~/index.html ~/swarmdesk.js ~/README.md $REMOTE_PATH/ &&
    sudo chown -R www-data:www-data $REMOTE_PATH &&
    sudo chmod -R 755 $REMOTE_PATH
"
print_status "Files moved to web directory with proper permissions"

# Test deployment
echo -e "${BLUE}🧪 Testing deployment...${NC}"
if curl -s --head "https://madnessinteractive.cc/SwarmDesk/" | head -n 1 | grep -q "200 OK"; then
    print_status "SwarmDesk is accessible at https://madnessinteractive.cc/SwarmDesk/"
else
    print_warning "SwarmDesk deployment test inconclusive - check manually"
fi

# Cache busting for immediate visibility
echo -e "${BLUE}🔄 Clearing CloudFlare cache...${NC}"
TIMESTAMP=$(date +%s)
print_status "Testing with cache buster: https://madnessinteractive.cc/SwarmDesk/?v=$TIMESTAMP"

# Check if CloudFlare CLI is available for cache purging
if command -v cf &> /dev/null; then
    echo -e "${BLUE}⚡ Purging CloudFlare cache...${NC}"
    cf cache purge "https://madnessinteractive.cc/SwarmDesk/*" 2>/dev/null || print_warning "CloudFlare cache purge failed - manual refresh required"
else
    print_warning "CloudFlare CLI not found - cache may need manual clearing"
fi

# Integration with backend (if running)
echo -e "${BLUE}🔗 Checking backend integration...${NC}"
if curl -s --head "https://madnessinteractive.cc/api/health" | head -n 1 | grep -q "200 OK"; then
    print_status "Backend API is running - SwarmDesk can access agent data"
else
    print_warning "Backend API not responding - SwarmDesk will run in demo mode"
fi

echo -e "${GREEN}🎉 SwarmDesk deployment completed successfully!${NC}"
echo -e "${BLUE}📍 Access SwarmDesk at: https://madnessinteractive.cc/SwarmDesk/${NC}"
echo -e "${BLUE}🎮 Use WASD to navigate, E to interact with agents${NC}"
echo -e "${BLUE}🤖 Experience the Madness Interactive agent swarm!${NC}" 
