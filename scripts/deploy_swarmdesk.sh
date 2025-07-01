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

# Create remote directory if it doesn't exist
echo -e "${BLUE}📁 Setting up remote directory...${NC}"
ssh $REMOTE_HOST "sudo mkdir -p $REMOTE_PATH && sudo chown -R www-data:www-data $REMOTE_PATH"
print_status "Remote directory prepared"

# Deploy files directly with rsync
echo -e "${BLUE}📤 Deploying SwarmDesk files with rsync...${NC}"
echo "Transfer starting: syncing entire SwarmDesk directory"
rsync -avzI --progress \
--rsync-path="sudo rsync" \
--exclude='.git*' \
--exclude='node_modules' \
--exclude='*.bak' \
--exclude='.DS_Store' \
--exclude='scripts/' \
./ \
$REMOTE_HOST:$REMOTE_PATH/

# Set proper permissions after rsync
echo -e "${BLUE}🔧 Setting file permissions...${NC}"
ssh $REMOTE_HOST "sudo chown -R www-data:www-data $REMOTE_PATH && sudo chmod -R 755 $REMOTE_PATH && sudo find $REMOTE_PATH -name '*.html' -o -name '*.js' -o -name '*.md' | sudo xargs chmod 644"
print_status "Complete SwarmDesk directory deployed with proper permissions"

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
    print_status "Backend API is running - SwarmDesk can access MCP tools"
else
    print_warning "Backend API not responding - SwarmDesk will run in demo mode"
fi

echo -e "${GREEN}🎉 SwarmDesk deployment completed successfully!${NC}"
echo -e "${BLUE}📍 Access SwarmDesk at: https://madnessinteractive.cc/SwarmDesk/${NC}"
echo -e "${BLUE}🎮 Use WASD to navigate, E to interact with agents${NC}"
echo -e "${BLUE}🤖 Experience the Madness Interactive agent swarm!${NC}"
