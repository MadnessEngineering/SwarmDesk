# SwarmDesk Makefile - Madness Interactive Agent Command Center
# Integrates with parent Inventorium deployment process

.PHONY: help deploy test clean check-files check-backend

# Default target
help:
	@echo "🚀 SwarmDesk - Madness Interactive Agent Command Center"
	@echo "====================================================="
	@echo "Available targets:"
	@echo "  deploy      - Deploy SwarmDesk to production server"
	@echo "  test        - Test SwarmDesk deployment"
	@echo "  check-files - Verify all required files are present"
	@echo "  check-backend - Test backend API connectivity"
	@echo "  clean       - Clean temporary files"
	@echo ""
	@echo "🎮 Usage: make -f Makefile.swarmdesk deploy"

# Check required files exist
check-files:
	@echo "🔍 Checking SwarmDesk files..."
	@test -f index.html || (echo "❌ index.html not found" && exit 1)
	@test -f swarmdesk.js || (echo "❌ swarmdesk.js not found" && exit 1)
	@test -f README.md || (echo "❌ README.md not found" && exit 1)
	@echo "✅ All required files present"

# Test backend connectivity
check-backend:
	@echo "🔗 Checking backend API connectivity..."
	@curl -s --head "https://madnessinteractive.cc/api/health" | head -n 1 | grep -q "200" && echo "✅ Backend API is running" || echo "⚠️ Backend API not responding - SwarmDesk will run in demo mode"

# Deploy SwarmDesk
deploy: check-files
	@echo "🚀 Deploying SwarmDesk to production..."
	./scripts/deploy_swarmdesk.sh

# Test deployment
test:
	@echo "🧪 Testing SwarmDesk deployment..."
	@curl -s --head "https://madnessinteractive.cc/SwarmDesk/" | head -n 1 | grep -q "200" && echo "✅ SwarmDesk is accessible" || echo "❌ SwarmDesk deployment test failed"
	@echo "📍 SwarmDesk URL: https://madnessinteractive.cc/SwarmDesk/"

# Clean temporary files
clean:
	@echo "🧹 Cleaning temporary files..."
	@echo "✅ No temporary files to clean"

# Integration target for parent Inventorium Makefile
inventorium-deploy: deploy test check-backend
	@echo "🎉 SwarmDesk integrated deployment completed!"
