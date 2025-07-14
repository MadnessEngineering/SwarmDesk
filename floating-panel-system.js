// 🎪 FLOATING PANEL SYSTEM - MADNESS INTERACTIVE DASHBOARD
// Advanced tabbed floating panels with context awareness and docking

class FloatingPanelSystem
{
    constructor()
    {
        // Singleton pattern: Ensure only one instance exists
        if (FloatingPanelSystem.instance)
        {
            return FloatingPanelSystem.instance;
        }

        this.panels = new Map();
        this.activePanelId = null;
        this.dragState = {
            isDragging: false,
            panel: null,
            offset: { x: 0, y: 0 },
            startPos: { x: 0, y: 0 }
        };
        this.dockZones = new Map();
        this.contextualTabs = new Map();
        this.panelIdCounter = 0;

        this.mcpData = {
            tools: [],
            logs: [],
            status: {
                server: 'Disconnected',
                activeTools: 0,
                lastPing: 'N/A'
            }
        };
        this.hasInitializedMCP = false;

        this.init();
        FloatingPanelSystem.instance = this;
    }

    // 🚀 INITIALIZATION
    init()
    {
        this.setupDockingZones();
        this.setupEventListeners();
        this.createInitialPanels();
        this.setupSwarmDeskIntegration();

        console.log('🎪 Floating Panel System initialized!');
    }

    // 🧲 SETUP DOCKING ZONES
    setupDockingZones()
    {
        const zones = ['dock-left', 'dock-right', 'dock-bottom', 'dock-top'];
        zones.forEach(zoneId =>
        {
            const zone = document.getElementById(zoneId);
            if (zone)
            {
                this.dockZones.set(zoneId, {
                    element: zone,
                    dockedPanels: [],
                    position: this.calculateDockPosition(zoneId)
                });
            }
        });
    }

    // 📍 CALCULATE DOCK POSITIONS
    calculateDockPosition(zoneId)
    {
        const zone = document.getElementById(zoneId);
        const rect = zone.getBoundingClientRect();
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            zone: zoneId
        };
    }

    // 🎮 SETUP EVENT LISTENERS
    setupEventListeners()
    {
        // Global mouse events for dragging
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Keyboard events for panel system
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // ⌨️ KEYBOARD HANDLER
    handleKeyboard(event)
    {
        // Handle keyboard shortcuts for panel system
        switch (event.key)
        {
            case 'F1':
                event.preventDefault();
                this.createContextualPanel('welcome');
                break;
            case 'F2':
                event.preventDefault();
                this.toggleAllPanels();
                break;
            case 'F8':
                event.preventDefault();
                this.createContextualPanel('debug');
                break;
            case 'F7':
                event.preventDefault();
                this.createContextualPanel('webllm');
                break;
            case 'F8':
                event.preventDefault();
                this.createContextualPanel('mcp');
                break;
            case 'F9':
                event.preventDefault();
                this.minimizeAllPanels();
                break;
            case 'F10':
                event.preventDefault();
                this.closeAllPanels();
                break;
            case 'Escape':
                if (this.activePanelId)
                {
                    this.setActivePanel(null);
                }
                break;
        }
    }

    // 🔧 TOGGLE ALL PANELS
    toggleAllPanels()
    {
        const allHidden = Array.from(this.panels.values()).every(panel =>
            panel.element.style.display === 'none' || panel.element.classList.contains('minimized')
        );

        this.panels.forEach((panel) =>
        {
            if (allHidden)
            {
                panel.element.style.display = 'block';
                panel.element.classList.remove('minimized');
            } else
            {
                panel.element.style.display = 'none';
            }
        });
    }

    // 📦 MINIMIZE ALL PANELS
    minimizeAllPanels()
    {
        this.panels.forEach((panel, panelId) =>
        {
            this.minimizePanel(panelId);
        });
    }

    // ❌ CLOSE ALL PANELS
    closeAllPanels()
    {
        // Create a copy of the keys to avoid modification during iteration
        const panelIds = Array.from(this.panels.keys());
        panelIds.forEach(panelId =>
        {
            this.closePanel(panelId);
        });
    }

    // 🏷️ CREATE PANEL
    createPanel(config = {})
    {
        const panelId = `panel-${++this.panelIdCounter}`;
        const template = document.getElementById('panel-template');
        const panelElement = template.content.cloneNode(true).firstElementChild;

        // Configure panel
        panelElement.id = panelId;
        panelElement.classList.add(config.type || 'project-panel');

        // Set title
        const titleElement = panelElement.querySelector('.panel-title');
        titleElement.textContent = config.title || 'New Panel';

        // Position panel
        const position = config.position || this.getDefaultPosition();
        panelElement.style.left = position.x + 'px';
        panelElement.style.top = position.y + 'px';

        // Set size
        if (config.width) panelElement.style.width = config.width + 'px';
        if (config.height) panelElement.style.height = config.height + 'px';

        // Setup tabs
        this.setupPanelTabs(panelElement, config.tabs || []);

        // Setup controls
        this.setupPanelControls(panelElement, panelId);

        // Setup dragging
        this.setupPanelDragging(panelElement, panelId);

        // Add to DOM and register
        document.getElementById('swarmdesk-workspace').appendChild(panelElement);
        panelElement.classList.add('panel-spawn');

        if (config.startHidden) {
            panelElement.style.display = 'none';
        }

        // Store panel data
        this.panels.set(panelId, {
            element: panelElement,
            config: config,
            isDocked: false,
            dockZone: null,
            tabs: new Map(),
            activeTab: null
        });

        // Set as active
        this.setActivePanel(panelId);

        // 🎮 Dispatch event to release mouse look
        window.dispatchEvent(new Event('panelCreated'));

        console.log(`🏷️ Created panel: ${panelId} (${config.title})`);
        return panelId;
    }

    // 📑 SETUP PANEL TABS
    setupPanelTabs(panelElement, tabsConfig)
    {
        const tabsContainer = panelElement.querySelector('.panel-tabs');
        const contentContainer = panelElement.querySelector('.panel-content');

        tabsConfig.forEach((tabConfig, index) =>
        {
            // Create tab button
            const tabButton = document.createElement('button');
            tabButton.className = 'panel-tab';
            tabButton.textContent = tabConfig.title;
            tabButton.dataset.tabId = tabConfig.id;

            if (tabConfig.contextual)
            {
                tabButton.classList.add('context-tab');
            }

            // Create tab content
            const tabContent = document.createElement('div');
            tabContent.className = 'tab-content';
            tabContent.dataset.tabId = tabConfig.id;
            tabContent.innerHTML = tabConfig.content || '<p>Loading...</p>';

            // Set first tab as active
            if (index === 0)
            {
                tabButton.classList.add('active');
                tabContent.classList.add('active');
            }

            // Tab click handler
            tabButton.addEventListener('click', () =>
            {
                this.switchTab(panelElement, tabConfig.id);
            });

            tabsContainer.appendChild(tabButton);
            contentContainer.appendChild(tabContent);
        });
    }

    // 🔄 SWITCH TAB
    switchTab(panelElement, tabId)
    {
        // Deactivate all tabs
        panelElement.querySelectorAll('.panel-tab').forEach(tab =>
        {
            tab.classList.remove('active');
        });
        panelElement.querySelectorAll('.tab-content').forEach(content =>
        {
            content.classList.remove('active');
        });

        // Activate selected tab
        const activeTab = panelElement.querySelector(`[data-tab-id="${tabId}"]`);
        if (activeTab)
        {
            if (activeTab.classList.contains('panel-tab'))
            {
                activeTab.classList.add('active');
            }
            if (activeTab.classList.contains('tab-content'))
            {
                activeTab.classList.add('active');
            }
        }

        // Also activate corresponding content
        const tabButton = panelElement.querySelector(`.panel-tab[data-tab-id="${tabId}"]`);
        const tabContent = panelElement.querySelector(`.tab-content[data-tab-id="${tabId}"]`);

        if (tabButton) tabButton.classList.add('active');
        if (tabContent) tabContent.classList.add('active');

        console.log(`🔄 Switched to tab: ${tabId}`);
    }

    // 🎯 SETUP PANEL CONTROLS
    setupPanelControls(panelElement, panelId)
    {
        const dockBtn = panelElement.querySelector('.dock-btn');
        const minimizeBtn = panelElement.querySelector('.minimize-btn');
        const closeBtn = panelElement.querySelector('.close-btn');

        dockBtn.addEventListener('click', () => this.toggleDock(panelId));
        minimizeBtn.addEventListener('click', () => this.minimizePanel(panelId));
        closeBtn.addEventListener('click', () => this.closePanel(panelId));
    }

    // 👆 SETUP PANEL DRAGGING
    setupPanelDragging(panelElement, panelId)
    {
        const header = panelElement.querySelector('.panel-header');

        header.addEventListener('mousedown', (e) =>
        {
            if (e.target.classList.contains('panel-control-btn')) return;

            this.startDrag(panelId, e);
            e.preventDefault();
        });
    }

    // 🖱️ START DRAG
    startDrag(panelId, event)
    {
        const panel = this.panels.get(panelId);
        if (!panel || panel.isDocked) return;

        const rect = panel.element.getBoundingClientRect();

        this.dragState = {
            isDragging: true,
            panel: panel,
            panelId: panelId,
            offset: {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            },
            startPos: { x: rect.left, y: rect.top }
        };

        // Set as active and show dock zones
        this.setActivePanel(panelId);
        this.showDockZones();

        // Add dragging class
        panel.element.classList.add('dragging');

        console.log(`👆 Started dragging panel: ${panelId}`);
    }

    // 🖱️ HANDLE MOUSE MOVE
    handleMouseMove(event)
    {
        if (!this.dragState.isDragging) return;

        const newX = event.clientX - this.dragState.offset.x;
        const newY = event.clientY - this.dragState.offset.y;

        // Update panel position
        this.dragState.panel.element.style.left = newX + 'px';
        this.dragState.panel.element.style.top = newY + 'px';

        // Check dock zone proximity
        this.checkDockZoneProximity(event.clientX, event.clientY);
    }

    // 🖱️ HANDLE MOUSE UP
    handleMouseUp(event)
    {
        if (!this.dragState.isDragging) return;

        const panel = this.dragState.panel;
        panel.element.classList.remove('dragging');

        // Check if we should dock
        const nearbyZone = this.findNearbyDockZone(event.clientX, event.clientY);
        if (nearbyZone)
        {
            this.dockPanel(this.dragState.panelId, nearbyZone);
        }

        // Reset drag state and hide dock zones
        this.dragState.isDragging = false;
        this.hideDockZones();

        console.log(`🖱️ Finished dragging panel: ${this.dragState.panelId}`);
    }

    // 🔍 CHECK DOCK ZONE PROXIMITY
    checkDockZoneProximity(mouseX, mouseY)
    {
        this.dockZones.forEach((zone, zoneId) =>
        {
            const rect = zone.element.getBoundingClientRect();
            const distance = this.calculateDistance(mouseX, mouseY,
                rect.left + rect.width / 2, rect.top + rect.height / 2);

            if (distance < 100)
            {
                zone.element.classList.add('highlight');
            } else
            {
                zone.element.classList.remove('highlight');
            }
        });
    }

    // 📏 CALCULATE DISTANCE
    calculateDistance(x1, y1, x2, y2)
    {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // 🔍 FIND NEARBY DOCK ZONE
    findNearbyDockZone(mouseX, mouseY)
    {
        let closestZone = null;
        let closestDistance = Infinity;

        this.dockZones.forEach((zone, zoneId) =>
        {
            const rect = zone.element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const distance = this.calculateDistance(mouseX, mouseY, centerX, centerY);

            if (distance < 150 && distance < closestDistance)
            {
                closestDistance = distance;
                closestZone = zoneId;
            }
        });

        return closestZone;
    }

    // 🧲 SHOW/HIDE DOCK ZONES
    showDockZones()
    {
        this.dockZones.forEach(zone =>
        {
            zone.element.classList.add('active');
        });
    }

    hideDockZones()
    {
        this.dockZones.forEach(zone =>
        {
            zone.element.classList.remove('active', 'highlight');
        });
    }

    // ⚓ DOCK/UNDOCK PANEL
    dockPanel(panelId, zoneId)
    {
        const panel = this.panels.get(panelId);
        const zone = this.dockZones.get(zoneId);

        if (!panel || !zone) return;

        // Calculate dock position
        const zoneRect = zone.element.getBoundingClientRect();
        const dockedPanelCount = zone.dockedPanels.length;

        // Position based on zone type
        let position = this.calculateDockedPosition(zoneId, dockedPanelCount, zoneRect);

        // Update panel
        panel.element.style.left = position.x + 'px';
        panel.element.style.top = position.y + 'px';
        panel.element.style.width = position.width + 'px';
        panel.element.style.height = position.height + 'px';

        panel.element.classList.add('docked', 'panel-dock');
        panel.isDocked = true;
        panel.dockZone = zoneId;

        // Register with dock zone
        zone.dockedPanels.push(panelId);

        console.log(`⚓ Docked panel ${panelId} to ${zoneId}`);
    }

    toggleDock(panelId)
    {
        const panel = this.panels.get(panelId);
        if (!panel) return;

        if (panel.isDocked)
        {
            this.undockPanel(panelId);
        } else
        {
            // Find best dock zone (simple heuristic)
            const bestZone = Array.from(this.dockZones.keys())[0];
            this.dockPanel(panelId, bestZone);
        }
    }

    undockPanel(panelId)
    {
        const panel = this.panels.get(panelId);
        if (!panel || !panel.isDocked) return;

        const zone = this.dockZones.get(panel.dockZone);

        // Remove from dock zone
        if (zone)
        {
            zone.dockedPanels = zone.dockedPanels.filter(id => id !== panelId);
        }

        // Reset panel
        panel.element.classList.remove('docked', 'panel-dock');
        panel.element.style.width = '';
        panel.element.style.height = '';
        panel.isDocked = false;
        panel.dockZone = null;

        console.log(`🔓 Undocked panel ${panelId}`);
    }

    // 📍 CALCULATE DOCKED POSITION
    calculateDockedPosition(zoneId, index, zoneRect)
    {
        const padding = 10;

        switch (zoneId)
        {
            case 'dock-left':
                return {
                    x: padding,
                    y: padding + (index * 250),
                    width: 280,
                    height: 240
                };
            case 'dock-right':
                return {
                    x: window.innerWidth - 290,
                    y: padding + (index * 250),
                    width: 280,
                    height: 240
                };
            case 'dock-bottom':
                return {
                    x: padding + (index * 320),
                    y: window.innerHeight - 210,
                    width: 300,
                    height: 180
                };
            case 'dock-top':
                return {
                    x: padding + (index * 320),
                    y: padding,
                    width: 300,
                    height: 140
                };
            default:
                return { x: 100, y: 100, width: 320, height: 240 };
        }
    }

    // 🎯 SET ACTIVE PANEL
    setActivePanel(panelId)
    {
        // Deactivate all panels
        this.panels.forEach((panel, id) =>
        {
            panel.element.classList.remove('active');
        });

        // Activate selected panel
        const panel = this.panels.get(panelId);
        if (panel)
        {
            panel.element.classList.add('active');
            this.activePanelId = panelId;

            // Bring to front
            panel.element.style.zIndex = 1001;

            // Lower other panels
            this.panels.forEach((otherPanel, otherId) =>
            {
                if (otherId !== panelId)
                {
                    otherPanel.element.style.zIndex = 1000;
                }
            });
        }
    }

    // ➖ MINIMIZE PANEL
    minimizePanel(panelId)
    {
        const panel = this.panels.get(panelId);
        if (!panel) return;

        panel.element.style.height = '40px';
        panel.element.classList.add('minimized');

        console.log(`➖ Minimized panel: ${panelId}`);
    }

    // ❌ CLOSE PANEL
    closePanel(panelId)
    {
        const panel = this.panels.get(panelId);
        if (!panel) return;

        // Check if this is a singleton panel (has panelType)
        if (panel.config && panel.config.panelType)
        {
            // For singleton panels, just hide instead of destroy
            panel.element.style.display = 'none';
            console.log(`🔄 Hiding panel: ${panel.config.panelType}`);
            return;
        }

        // For non-singleton panels, destroy completely
        panel.element.remove();
        this.panels.delete(panelId);

        // Select another panel if this was active
        if (this.activePanelId === panelId)
        {
            const remainingPanels = Array.from(this.panels.keys());
            if (remainingPanels.length > 0)
            {
                this.setActivePanel(remainingPanels[0]);
            }
        }

        console.log(`❌ Closed panel: ${panelId}`);
    }

    // 📍 GET DEFAULT POSITION
    getDefaultPosition()
    {
        return {
            x: 100 + (this.panelIdCounter * 30),
            y: 100 + (this.panelIdCounter * 30)
        };
    }

    // 🚫 CANCEL DRAG
    cancelDrag()
    {
        if (!this.dragState.isDragging) return;

        const panel = this.dragState.panel;

        // Reset to start position
        panel.element.style.left = this.dragState.startPos.x + 'px';
        panel.element.style.top = this.dragState.startPos.y + 'px';
        panel.element.classList.remove('dragging');

        // Reset state
        this.dragState.isDragging = false;
        this.hideDockZones();
    }

    // 📱 HANDLE RESIZE
    handleResize()
    {
        // Recalculate dock zone positions
        this.dockZones.forEach((zone, zoneId) =>
        {
            zone.position = this.calculateDockPosition(zoneId);
        });

        // Reposition docked panels
        this.panels.forEach((panel, panelId) =>
        {
            if (panel.isDocked)
            {
                const zone = this.dockZones.get(panel.dockZone);
                const index = zone.dockedPanels.indexOf(panelId);
                const zoneRect = zone.element.getBoundingClientRect();
                const position = this.calculateDockedPosition(panel.dockZone, index, zoneRect);

                panel.element.style.left = position.x + 'px';
                panel.element.style.top = position.y + 'px';
            }
        });
    }

    // 🎪 CREATE INITIAL PANELS
    createInitialPanels()
    {
        // Don't create any panels automatically - let user trigger them with hotkeys
        // This prevents the welcome panel from appearing on every page load
        console.log('🎪 Floating Panel System ready - use F3-F7 hotkeys to create panels');
    }

    // 🎮 SWARMDESK INTEGRATION
    setupSwarmDeskIntegration()
    {
        // Register with SwarmDesk dashboard hooks if available
        if (typeof SwarmDeskDashboard !== 'undefined')
        {
            SwarmDeskDashboard.registerCallbacks({
                onProjectSelect: (projectName, projectData) =>
                {
                    this.createContextualProjectPanel(projectName, projectData);
                },
                onAgentInteract: (agentData) =>
                {
                    this.createContextualAgentPanel(agentData);
                },
                onMCPTool: (toolName, result) =>
                {
                    this.createContextualMCPPanel(toolName, result);
                }
            });

            console.log('🎮 SwarmDesk integration active');
        }
    }

    // 🎯 CREATE CONTEXTUAL PANELS
    createContextualPanel(type)
    {
        // Check if panel of this type already exists
        const existingPanel = Array.from(this.panels.values()).find(
            p => p.config && p.config.panelType === type
        );

        if (existingPanel)
        {
            // Panel exists - toggle visibility or focus it
            const panelElement = existingPanel.element;
            if (panelElement.style.display === 'none')
            {
                // Show hidden panel
                panelElement.style.display = 'block';
                this.setActivePanel(existingPanel.element.id);

                // 🎮 Dispatch event to release mouse look
                window.dispatchEvent(new Event('panelCreated'));

                console.log(`🔄 Showing existing ${type} panel`);
            }
            else
            {
                // Hide visible panel (toggle off)
                panelElement.style.display = 'none';
                console.log(`🔄 Hiding ${type} panel`);
            }
            return existingPanel.element.id;
        }

        // No existing panel - create new one
        const configs = {
            control_center: {
                title: 'SwarmDesk Control Center',
                type: 'control-center-panel',
                panelType: 'control_center',
                tabs: [
                    { id: 'shortcuts', title: '🚀 Shortcuts', content: this.generateShortcutsContent() }
                ]
            },
            swarm_status: {
                title: 'Swarm Status',
                type: 'swarm-status-panel',
                panelType: 'swarm_status',
                tabs: [
                    { id: 'status', title: '🤖 Status', content: this.generateAgentStatusContent() }
                ]
            },
            welcome: {
                title: '🎪 Welcome to Floating Madness!',
                type: 'project-panel',
                panelType: 'welcome', // Add this for singleton tracking
                tabs: [
                    {
                        id: 'welcome',
                        title: '🚀 Welcome',
                        content: this.generateWelcomeContent()
                    },
                    {
                        id: 'shortcuts',
                        title: '⌨️ Shortcuts',
                        content: this.generateShortcutsContent()
                    }
                ]
            },
            project: {
                title: '📋 Project Management',
                type: 'project-panel',
                panelType: 'project', // Add this for singleton tracking
                tabs: [
                    { id: 'overview', title: '📊 Overview', content: this.generateProjectOverviewContent() },
                    { id: 'todos', title: '✅ Todos', content: this.generateTodosContent() },
                    { id: 'files', title: '📁 Files', content: this.generateFilesContent() }
                ]
            },
            agent: {
                title: '🤖 Agent Interface',
                type: 'agent-panel',
                panelType: 'agent', // Add this for singleton tracking
                tabs: [
                    { id: 'chat', title: '💬 Chat', content: this.generateChatContent() },
                    { id: 'commands', title: '⚡ Commands', content: this.generateCommandsContent() },
                    { id: 'history', title: '📜 History', content: this.generateHistoryContent() }
                ]
            },
            mcp: {
                title: '🔧 MCP Tools',
                type: 'mcp-panel',
                panelType: 'mcp', // Add this for singleton tracking
                tabs: [
                    { id: 'tools', title: '🛠️ Tools', content: this.generateMCPToolsContent() },
                    { id: 'logs', title: '📋 Logs', content: this.generateLogsContent() },
                    { id: 'debug', title: '🐛 Debug', content: this.generateDebugContent() }
                ],
                onOpen: () => this.connectToMCPServer()
            },
            analytics: {
                title: '📊 Analytics Dashboard',
                type: 'analytics-panel',
                panelType: 'analytics', // Add this for singleton tracking
                tabs: [
                    { id: 'metrics', title: '📈 Metrics', content: this.generateMetricsContent() },
                    { id: 'activity', title: '🚀 Activity', content: this.generateActivityContent() },
                    { id: 'insights', title: '💡 Insights', content: this.generateInsightsContent() }
                ]
            },
            webllm: {
                title: '🤖 WebLLM Manager',
                type: 'webllm-panel',
                panelType: 'webllm', // Add this for singleton tracking
                tabs: [
                    { id: 'models', title: '🧠 Models', content: this.generateWebLLMModelsContent() },
                    { id: 'compatibility', title: '✅ Compatibility', content: this.generateWebLLMCompatibilityContent() },
                    { id: 'status', title: '⚡ Status', content: this.generateWebLLMStatusContent() },
                    { id: 'settings', title: '⚙️ Settings', content: this.generateWebLLMSettingsContent() }
                ]
            }
        };

        const config = configs[type];
        if (config)
        {
            const panelId = this.createPanel(config);
            // If there's an onOpen callback, call it now
            if (config.onOpen) {
                config.onOpen();
            }
            return panelId;
        }
    }

    // 📡 CONNECT TO MCP SERVER
    connectToMCPServer() {
        if (this.hasInitializedMCP) {
            console.log('📡 MCP connection already initialized.');
            return;
        }

        const userId = localStorage.getItem('userId');
        if (!userId) {
            console.error('📡 MCP Error: User ID not found in localStorage. Cannot connect.');
            this.mcpData.status.server = 'Auth Error';
            this.updateMCPDebugContent();
            return;
        }

        console.log(`📡 Connecting to MCP server for user: ${userId}...`);
        const sse = new EventSource(`http://localhost:8000/sse?userId=${encodeURIComponent(userId)}`);

        sse.onopen = () => {
            console.log('📡 SSE connection opened.');
            this.mcpData.status.server = 'Connected';
            this.updateMCPDebugContent();
            this.hasInitializedMCP = true;
        };

        sse.addEventListener('tools', (event) => {
            const tools = JSON.parse(event.data);
            this.mcpData.tools = tools;
            console.log('🔧 Received tools:', tools);
            this.updateMCPToolsContent();
        });

        sse.addEventListener('logs', (event) => {
            const logEntry = JSON.parse(event.data);
            this.mcpData.logs.unshift(logEntry); // Add to beginning
            if (this.mcpData.logs.length > 50) { // Keep log size manageable
                this.mcpData.logs.pop();
            }
            console.log('📋 Received log:', logEntry);
            this.updateMCPLogsContent();
        });

        sse.addEventListener('status', (event) => {
            const status = JSON.parse(event.data);
            this.mcpData.status = { ...this.mcpData.status, ...status };
            console.log('🐛 Received status:', status);
            this.updateMCPDebugContent();
        });

        sse.onerror = (err) => {
            console.error('📡 SSE Error:', err);
            this.mcpData.status.server = 'Error';
            this.updateMCPDebugContent();
            sse.close();
        };
    }

    // 🔄 UPDATE MCP CONTENT
    updateMCPToolsContent() {
        const panel = this.findPanelByType('mcp');
        if (panel) {
            const contentDiv = panel.element.querySelector('.tab-content[data-tab-id="tools"]');
            if (contentDiv) {
                contentDiv.innerHTML = this.generateMCPToolsContent();
            }
        }
    }

    updateMCPLogsContent() {
        const panel = this.findPanelByType('mcp');
        if (panel) {
            const contentDiv = panel.element.querySelector('.tab-content[data-tab-id="logs"]');
            if (contentDiv) {
                contentDiv.innerHTML = this.generateLogsContent();
            }
        }
    }

    updateMCPDebugContent() {
        const panel = this.findPanelByType('mcp');
        if (panel) {
            const contentDiv = panel.element.querySelector('.tab-content[data-tab-id="debug"]');
            if (contentDiv) {
                contentDiv.innerHTML = this.generateDebugContent();
            }
        }
    }

    // 🎯 CONTEXTUAL PROJECT PANEL
    createContextualProjectPanel(projectName, projectData)
    {
        // Prevent duplicate contextual project panels
        const existingPanel = Array.from(this.panels.values()).find(
            p => p.config && p.config.title === `📋 ${projectName}` && p.config.type === 'project-panel'
        );
        if (existingPanel)
        {
            this.setActivePanel(existingPanel.element.id);
            console.warn(`[FloatingPanelSystem] Contextual panel for project '${projectName}' already exists. Focusing.`);
            return;
        }
        if (!projectName)
        {
            console.warn('[FloatingPanelSystem] No projectName provided to createContextualProjectPanel.');
            return;
        }
        if (!projectData)
        {
            console.warn(`[FloatingPanelSystem] No projectData found for '${projectName}'. Creating panel with limited info.`);
        }
        this.createPanel({
            title: `📋 ${projectName}`,
            type: 'project-panel',
            tabs: [
                {
                    id: 'details',
                    title: '📄 Details',
                    contextual: true,
                    content: this.generateProjectDetailsContent(projectName, projectData)
                },
                {
                    id: 'todos',
                    title: '✅ Todos',
                    contextual: true,
                    content: this.generateProjectTodosContent(projectName)
                },
                {
                    id: 'activity',
                    title: '🚀 Activity',
                    contextual: true,
                    content: this.generateProjectActivityContent(projectName)
                }
            ]
        });
    }

    // 🤖 CONTEXTUAL AGENT PANEL
    createContextualAgentPanel(agentData)
    {
        this.createPanel({
            title: `🤖 ${agentData.name}`,
            type: 'agent-panel',
            tabs: [
                {
                    id: 'interface',
                    title: '💬 Interface',
                    contextual: true,
                    content: this.generateAgentInterfaceContent(agentData)
                },
                {
                    id: 'capabilities',
                    title: '⚡ Capabilities',
                    contextual: true,
                    content: this.generateAgentCapabilitiesContent(agentData)
                }
            ]
        });
    }

    // 🔧 CONTEXTUAL MCP PANEL
    createContextualMCPPanel(toolName, result)
    {
        this.createPanel({
            title: `🔧 MCP: ${toolName}`,
            type: 'mcp-panel',
            tabs: [
                {
                    id: 'result',
                    title: '📤 Result',
                    contextual: true,
                    content: this.generateMCPResultContent(toolName, result)
                },
                {
                    id: 'debug',
                    title: '🐛 Debug',
                    contextual: true,
                    content: this.generateMCPDebugContent(toolName, result)
                }
            ]
        });
    }

    // 📄 CONTENT GENERATORS
    generateWelcomeContent()
    {
        return `
            <div class="content-section">
                <h3>🎪 Welcome to Floating Panel Madness!</h3>
                <p>This advanced floating panel system brings contextual workspace management to SwarmDesk!</p>
                <p><strong>🎯 Features:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px; font-size: 12px;">
                    <li>📱 Draggable panels with smart docking</li>
                    <li>🏷️ Contextual tabs that respond to SwarmDesk interactions</li>
                    <li>🧲 Magnetic docking zones (edges & corners)</li>
                    <li>⌨️ Keyboard shortcuts for quick access</li>
                    <li>🎮 Full SwarmDesk 3D workspace integration</li>
                </ul>
                <button class="action-button" onclick="panelSystem.createContextualPanel('project')">
                    📋 Create Project Panel
                </button>
                <button class="action-button" onclick="panelSystem.createContextualPanel('agent')">
                    🤖 Create Agent Panel
                </button>
            </div>
        `;
    }

    generateShortcutsContent()
    {
        return `
            <div class="content-section">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <div style="font-size: 12px; line-height: 1.6;">
                    <p><strong>F3</strong> - Toggle Welcome Panel</p>
                    <p><strong>F4</strong> - Toggle Project Panel</p>
                    <p><strong>F5</strong> - Toggle Agent Panel</p>
                    <p><strong>F6</strong> - Toggle MCP Tools Panel</p>
                    <p><strong>F7</strong> - Toggle Analytics Panel</p>
                    <p><strong>ESC</strong> - Cancel current drag operation</p>
                    <p><strong>Drag panels</strong> - Click and drag panel headers</p>
                    <p><strong>Dock panels</strong> - Drag near screen edges to dock</p>
                </div>
            </div>
        `;
    }

    generateProjectOverviewContent()
    {
        return `
            <div class="content-section">
                <h3>📊 Project Overview</h3>
                <p>Active Projects: 5</p>
                <p>Pending Tasks: 23</p>
                <p>Completed Today: 7</p>
                <button class="action-button">📋 View All Projects</button>
                <button class="action-button">➕ Add New Task</button>
            </div>
        `;
    }

    generateTodosContent()
    {
        return `
            <div class="content-section">
                <h3>✅ Todo Management</h3>
                <div style="margin: 10px 0;">
                    <div style="padding: 8px; background: rgba(0,255,136,0.1); border-radius: 4px; margin: 5px 0; font-size: 12px;">
                        <strong>🎪 Dashboard Integration</strong> - In Progress
                    </div>
                    <div style="padding: 8px; background: rgba(255,170,0,0.1); border-radius: 4px; margin: 5px 0; font-size: 12px;">
                        <strong>🔧 MCP Tool Enhancement</strong> - Pending
                    </div>
                </div>
                <button class="action-button">➕ Add Todo</button>
            </div>
        `;
    }

    generateFilesContent()
    {
        return `
            <div class="content-section">
                <h3>📁 Project Files</h3>
                <div style="font-size: 12px;">
                    <p>📄 dashboard-integrated.html</p>
                    <p>📄 floating-panels-dashboard.html</p>
                    <p>📄 floating-panel-system.js</p>
                    <p>📄 swarmdesk-dashboard-hooks.js</p>
                </div>
                <button class="action-button">📂 Browse Files</button>
            </div>
        `;
    }

    generateChatContent()
    {
        return `
            <div class="content-section">
                <h3>💬 Agent Chat</h3>
                <div style="height: 150px; background: rgba(0,0,0,0.3); border-radius: 4px; padding: 10px; margin: 10px 0; overflow-y: auto; font-size: 11px;">
                    <div style="margin: 5px 0; color: #00ff88;"><strong>Agent:</strong> Ready to assist with your projects!</div>
                    <div style="margin: 5px 0; color: #ff6b35;"><strong>You:</strong> Help me with the floating panels</div>
                    <div style="margin: 5px 0; color: #00ff88;"><strong>Agent:</strong> The floating panel system is amazing! You can drag panels anywhere and dock them to edges.</div>
                </div>
                <input type="text" placeholder="Type your message..." style="width: 100%; padding: 6px; background: rgba(0,0,0,0.5); border: 1px solid #00ff88; border-radius: 4px; color: #00ff88; font-family: 'Courier New', monospace; font-size: 11px; box-sizing: border-box;">
            </div>
        `;
    }

    generateCommandsContent()
    {
        return `
            <div class="content-section">
                <h3>⚡ Agent Commands</h3>
                <button class="action-button">🔍 Search Projects</button>
                <button class="action-button">📋 List Todos</button>
                <button class="action-button">🚀 Deploy Project</button>
                <button class="action-button">📊 Generate Report</button>
            </div>
        `;
    }

    generateHistoryContent()
    {
        return `
            <div class="content-section">
                <h3>📜 Command History</h3>
                <div style="font-size: 11px; opacity: 0.8;">
                    <p>14:23 - search_projects "SwarmDesk"</p>
                    <p>14:20 - add_todo "Create floating panels"</p>
                    <p>14:15 - deploy "dashboard-integration"</p>
                </div>
            </div>
        `;
    }

    generateMCPToolsContent()
    {
        if (this.mcpData.tools.length === 0) {
            return `
                <div class="content-section">
                    <h3>🛠️ Available MCP Tools</h3>
                    <p>No tools available. Waiting for server connection...</p>
                </div>
            `;
        }
        return `
            <div class="content-section">
                <h3>🛠️ Available MCP Tools</h3>
                ${this.mcpData.tools.map(tool => `<button class="action-button">${tool}</button>`).join('')}
            </div>
        `;
    }

    generateLogsContent()
    {
        return `
            <div class="content-section">
                <h3>📋 MCP Logs</h3>
                <div style="font-size: 11px; opacity: 0.8; height: 120px; overflow-y: auto;">
                    ${this.mcpData.logs.map(log => `<p>[${new Date(log.timestamp).toLocaleTimeString()}] ${log.message}</p>`).join('')}
                </div>
            </div>
        `;
    }

    generateDebugContent()
    {
        return `
            <div class="content-section">
                <h3>🐛 Debug Info</h3>
                <p style="font-size: 11px;">MCP Server: ${this.mcpData.status.server}</p>
                <p style="font-size: 11px;">Active Tools: ${this.mcpData.status.activeTools}</p>
                <p style="font-size: 11px;">Last Ping: ${this.mcpData.status.lastPing}</p>
            </div>
        `;
    }

    generateMetricsContent()
    {
        return `
            <div class="content-section">
                <h3>📈 System Metrics</h3>
                <p style="font-size: 12px;">CPU Usage: 42%</p>
                <p style="font-size: 12px;">Memory: 68%</p>
                <p style="font-size: 12px;">Active Panels: ${this.panels.size}</p>
                <p style="font-size: 12px;">Uptime: 2h 15m</p>
            </div>
        `;
    }

    generateActivityContent()
    {
        return `
            <div class="content-section">
                <h3>🚀 Recent Activity</h3>
                <div style="font-size: 11px;">
                    <p>🏷️ Panel created: Project Management</p>
                    <p>🎮 SwarmDesk interaction: Workstation selected</p>
                    <p>🔧 MCP tool executed: list_projects</p>
                </div>
            </div>
        `;
    }

    generateInsightsContent()
    {
        return `
            <div class="content-section">
                <h3>💡 Insights</h3>
                <p style="font-size: 12px;">Most used panel: Project Management</p>
                <p style="font-size: 12px;">Peak activity: 14:00-15:00</p>
                <p style="font-size: 12px;">Efficiency score: 87%</p>
            </div>
        `;
    }

    generateProjectDetailsContent(projectName, projectData)
    {
        return `
            <div class="content-section">
                <h3>📋 ${projectName} Details</h3>
                <p><strong>Status:</strong> ${projectData?.status || 'Active Development'}</p>
                <p><strong>Description:</strong> ${projectData?.description || 'Loading project information...'}</p>
                <button class="action-button">📂 Open in SwarmDesk</button>
                <button class="action-button">📝 Edit Details</button>
            </div>
        `;
    }

    generateProjectTodosContent(projectName)
    {
        return `
            <div class="content-section">
                <h3>✅ ${projectName} Todos</h3>
                <div style="font-size: 12px;">
                    <div style="padding: 6px; background: rgba(0,255,136,0.1); border-radius: 4px; margin: 4px 0;">
                        🎪 Complete floating panel system
                    </div>
                    <div style="padding: 6px; background: rgba(255,170,0,0.1); border-radius: 4px; margin: 4px 0;">
                        🔧 Add multi-monitor support
                    </div>
                </div>
                <button class="action-button">➕ Add Todo</button>
            </div>
        `;
    }

    generateProjectActivityContent(projectName)
    {
        return `
            <div class="content-section">
                <h3>🚀 ${projectName} Activity</h3>
                <div style="font-size: 11px; opacity: 0.9;">
                    <p>15:30 - Workstation selected</p>
                    <p>15:25 - Panel created</p>
                    <p>15:20 - Project opened</p>
                </div>
            </div>
        `;
    }

    generateAgentInterfaceContent(agentData)
    {
        return `
            <div class="content-section">
                <h3>💬 ${agentData.name} Interface</h3>
                <p><strong>Role:</strong> ${agentData.role || 'AI Assistant'}</p>
                <p><strong>Status:</strong> ${agentData.isActive ? 'Active' : 'Idle'}</p>
                <button class="action-button">💬 Start Conversation</button>
                <button class="action-button">⚡ Execute Command</button>
            </div>
        `;
    }

    generateAgentCapabilitiesContent(agentData)
    {
        return `
            <div class="content-section">
                <h3>⚡ Agent Capabilities</h3>
                <div style="font-size: 12px;">
                    <p>✅ Project Management</p>
                    <p>✅ Code Analysis</p>
                    <p>✅ MCP Tool Integration</p>
                    <p>✅ Real-time Communication</p>
                </div>
            </div>
        `;
    }

    generateMCPResultContent(toolName, result)
    {
        return `
            <div class="content-section">
                <h3>📤 ${toolName} Result</h3>
                <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; font-size: 11px; font-family: monospace;">
                    <pre>${JSON.stringify(result, null, 2)}</pre>
                </div>
                <button class="action-button">🔄 Run Again</button>
            </div>
        `;
    }

    generateMCPDebugContent(toolName, result)
    {
        return `
            <div class="content-section">
                <h3>🐛 ${toolName} Debug</h3>
                <p style="font-size: 11px;">Execution time: ${Math.random() * 100 | 0}ms</p>
                <p style="font-size: 11px;">Status: Success</p>
                <p style="font-size: 11px;">Memory usage: ${Math.random() * 10 | 0}MB</p>
            </div>
        `;
    }

    generateWebLLMModelsContent()
    {
        const availableModels = window.webLLMService?.getAvailableModels() || [];
        const currentModel = window.webLLMService?.getStatus()?.currentModel || 'None';

        return `
            <div class="content-section">
                <h3>🧠 Available Models</h3>
                <div style="margin-bottom: 10px;">
                    <p><strong>Current Model:</strong> ${currentModel}</p>
                </div>
                ${availableModels.map(model => `
                    <div style="background: rgba(0,255,136,0.1); padding: 8px; margin: 4px 0; border-radius: 4px;">
                        <div style="font-weight: bold;">${model.name}</div>
                        <div style="font-size: 11px; opacity: 0.8;">Size: ${model.size} | Performance: ${model.performance}</div>
                        <div style="font-size: 10px; opacity: 0.7;">${model.description}</div>
                        <button onclick="window.webLLMService.loadModel('${model.id}')" class="action-button" style="margin-top: 4px;">
                            Load Model
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateWebLLMCompatibilityContent()
    {
        return `
            <div class="content-section">
                <h3>✅ Browser Compatibility</h3>
                <div id="webllm-compatibility-status">
                    <p>🔄 Checking compatibility...</p>
                </div>
                <button onclick="this.checkWebLLMCompatibility()" class="action-button">
                    🔍 Check Compatibility
                </button>
            </div>
            <script>
                if (window.webLLMService) {
                    window.webLLMService.checkBrowserCompatibility().then(result => {
                        const statusDiv = document.getElementById('webllm-compatibility-status');
                        statusDiv.innerHTML = \`
                            <p><strong>WebGPU:</strong> \${result.webgpu ? '✅ Supported' : '❌ Not Supported'}</p>
                            <p><strong>Web Workers:</strong> \${result.webworker ? '✅ Supported' : '❌ Not Supported'}</p>
                            <p><strong>WebAssembly:</strong> \${result.webassembly ? '✅ Supported' : '❌ Not Supported'}</p>
                            <p><strong>Browser:</strong> \${result.browser.browser} v\${result.browser.version}</p>
                        \`;
                    });
                }
            </script>
        `;
    }

    generateWebLLMStatusContent()
    {
        const status = window.webLLMService?.getStatus() || {};

        return `
            <div class="content-section">
                <h3>⚡ WebLLM Status</h3>
                <div style="font-size: 12px;">
                    <p><strong>Initialized:</strong> ${status.initialized ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Current Model:</strong> ${status.currentModel || 'None'}</p>
                    <p><strong>Loading:</strong> ${status.isLoading ? '🔄 Yes' : '✅ No'}</p>
                    <p><strong>Inferencing:</strong> ${status.isInferencing ? '🔄 Yes' : '✅ No'}</p>
                    <p><strong>Queue Length:</strong> ${status.queueLength || 0}</p>
                    <p><strong>Loaded Models:</strong> ${status.loadedModels?.length || 0}</p>
                    <p><strong>Mode:</strong> ${status.mode || 'Standard'}</p>
                </div>
                <button onclick="window.webLLMService.initialize()" class="action-button">
                    🚀 Initialize WebLLM
                </button>
            </div>
        `;
    }

    generateWebLLMSettingsContent()
    {
        return `
            <div class="content-section">
                <h3>⚙️ WebLLM Settings</h3>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 12px;">
                        <strong>Agent Model Assignment:</strong>
                    </label>
                    <select style="width: 100%; padding: 4px; margin-bottom: 8px; background: rgba(0,0,0,0.3); color: #00ff88; border: 1px solid #00ff88;">
                        <option value="global">Use Global Model</option>
                        <option value="per-agent">Per-Agent Models</option>
                    </select>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 12px;">
                        <strong>Temperature:</strong>
                    </label>
                    <input type="range" min="0" max="1" step="0.1" value="0.7" style="width: 100%;">
                    <span style="font-size: 11px;">0.7</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <label style="display: block; margin-bottom: 5px; font-size: 12px;">
                        <strong>Max Tokens:</strong>
                    </label>
                    <input type="number" value="200" min="50" max="500" style="width: 100%; padding: 4px; background: rgba(0,0,0,0.3); color: #00ff88; border: 1px solid #00ff88;">
                </div>
                <button class="action-button">💾 Save Settings</button>
                <button class="action-button">🔄 Reset to Defaults</button>
            </div>
        `;
    }

    generateAgentStatusContent()
    {
        const status = window.webLLMService?.getStatus() || {};
        return `
            <div class="content-section">
                <h3>🤖 Agent Status</h3>
                <div style="font-size: 12px;">
                    <p><strong>Initialized:</strong> ${status.initialized ? '✅ Yes' : '❌ No'}</p>
                    <p><strong>Current Model:</strong> ${status.currentModel || 'None'}</p>
                    <p><strong>Loading:</strong> ${status.isLoading ? '🔄 Yes' : '✅ No'}</p>
                    <p><strong>Inferencing:</strong> ${status.isInferencing ? '🔄 Yes' : '✅ No'}</p>
                    <p><strong>Queue Length:</strong> ${status.queueLength || 0}</p>
                    <p><strong>Loaded Models:</strong> ${status.loadedModels?.length || 0}</p>
                    <p><strong>Mode:</strong> ${status.mode || 'Standard'}</p>
                </div>
                <button onclick="window.webLLMService.initialize()" class="action-button">
                    🚀 Initialize Agent
                </button>
            </div>
        `;
    }

    findPanelByType(type) {
        return Array.from(this.panels.values()).find(p => p.config.panelType === type);
    }
}

// 🎪 ONLY ONE INITIALIZATION - Initialize the single instance of the floating panel system
// This ensures the singleton pattern works correctly
if (!window.panelSystem)
{
    window.panelSystem = new FloatingPanelSystem();
    console.log('🎪 Floating Panel System loaded successfully!');
} else
{
    console.log('🎪 Floating Panel System already initialized - using existing instance');
}
