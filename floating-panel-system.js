// 🎪 FLOATING PANEL SYSTEM - MADNESS INTERACTIVE DASHBOARD
// Advanced tabbed floating panels with context awareness and docking

class FloatingPanelSystem
{
    constructor()
    {
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

        this.init();
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

    // 🎮 SETUP EVENT LISTENERS - ENHANCED ERROR HANDLING
    setupEventListeners()
    {
        // Dragging events
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Keyboard shortcuts - with enhanced error checking and initialization verification
        document.addEventListener('keydown', (e) =>
        {
            try
            {
                // Ensure the handleKeyboard method exists and panel system is properly initialized
                if (typeof this.handleKeyboard === 'function')
                {
                    this.handleKeyboard(e);
                } else
                {
                    console.warn('⚠️ handleKeyboard method not available');
                }
            } catch (error)
            {
                console.warn('⚠️ Keyboard handler error:', error);
            }
        });

        // Window resize
        window.addEventListener('resize', () => this.handleResize());

        // Global error handler for panel system issues
        window.addEventListener('error', (event) =>
        {
            if (event.message && event.message.includes('panelSystem'))
            {
                console.warn('🔧 Panel system error intercepted:', event.message);
                event.preventDefault(); // Prevent error from breaking the app
            }
        });

        // Prevent multiple panel system instances
        if (window.panelSystem && window.panelSystem !== this)
        {
            console.warn('⚠️ Multiple panel systems detected, using existing instance');
            return window.panelSystem;
        }

        // Register this instance globally
        window.panelSystem = this;
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

        // Undock if needed
        if (panel.isDocked)
        {
            this.undockPanel(panelId);
        }

        // Remove from DOM
        panel.element.remove();
        this.panels.delete(panelId);

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

    // ⌨️ HANDLE KEYBOARD - ENHANCED ERROR HANDLING
    handleKeyboard(event)
    {
        try
        {
            // Don't interfere with SwarmDesk or input fields
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

            // Check if dialogue box exists before accessing it
            const dialogueBox = document.getElementById('dialogue-box');
            if (dialogueBox && dialogueBox.style.display === 'block') return;

            switch (event.key)
            {
                case 'F4':
                    event.preventDefault();
                    this.createContextualPanel('project');
                    break;
                case 'F5':
                    event.preventDefault();
                    this.createContextualPanel('agent');
                    break;
                case 'F6':
                    event.preventDefault();
                    this.createContextualPanel('mcp');
                    break;
                case 'F7':
                    event.preventDefault();
                    this.createContextualPanel('analytics');
                    break;
                case 'Escape':
                    if (this.dragState.isDragging)
                    {
                        this.cancelDrag();
                    }
                    break;
            }
        } catch (error)
        {
            console.warn('⚠️ Keyboard handling error:', error);
        }
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
        // Welcome panel
        this.createPanel({
            title: '🎪 Welcome to Floating Madness!',
            type: 'project-panel',
            position: { x: 50, y: 50 },
            width: 400,
            height: 300,
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
        });
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
        const configs = {
            project: {
                title: '📋 Project Management',
                type: 'project-panel',
                tabs: [
                    { id: 'overview', title: '📊 Overview', content: this.generateProjectOverviewContent() },
                    { id: 'todos', title: '✅ Todos', content: this.generateTodosContent() },
                    { id: 'files', title: '📁 Files', content: this.generateFilesContent() }
                ]
            },
            agent: {
                title: '🤖 Agent Interface',
                type: 'agent-panel',
                tabs: [
                    { id: 'chat', title: '💬 Chat', content: this.generateChatContent() },
                    { id: 'commands', title: '⚡ Commands', content: this.generateCommandsContent() },
                    { id: 'history', title: '📜 History', content: this.generateHistoryContent() }
                ]
            },
            mcp: {
                title: '🔧 MCP Tools',
                type: 'mcp-panel',
                tabs: [
                    { id: 'tools', title: '🛠️ Tools', content: this.generateMCPToolsContent() },
                    { id: 'logs', title: '📋 Logs', content: this.generateLogsContent() },
                    { id: 'debug', title: '🐛 Debug', content: this.generateDebugContent() }
                ]
            },
            analytics: {
                title: '📊 Analytics Dashboard',
                type: 'analytics-panel',
                tabs: [
                    { id: 'metrics', title: '📈 Metrics', content: this.generateMetricsContent() },
                    { id: 'activity', title: '🚀 Activity', content: this.generateActivityContent() },
                    { id: 'insights', title: '💡 Insights', content: this.generateInsightsContent() }
                ]
            }
        };

        const config = configs[type];
        if (config)
        {
            this.createPanel(config);
        }
    }

    // 🎯 CONTEXTUAL PROJECT PANEL (REFACTORED for single-state)
    createContextualProjectPanel(projectName, projectData)
    {
        const PANEL_ID = 'singleton-project-panel';
        const PANEL_TITLE = '📋 Project Management';
        const existingPanel = this.panels.get(PANEL_ID);

        // If the panel exists and is for the same project, close it (toggle off).
        if (existingPanel && existingPanel.config.projectName === projectName)
        {
            this.closePanel(PANEL_ID);
            return;
        }

        // If the panel doesn't exist, create it.
        if (!existingPanel)
        {
            const panelConfig = {
                id: PANEL_ID,
                title: PANEL_TITLE,
                type: 'project-management-panel', // New, consistent type
                x: window.innerWidth - 520,
                y: 60,
                width: 450,
                height: 500,
                tabs: [], // Tabs will be populated by the update function
                projectName: projectName // Store current project
            };
            this.createPanel(panelConfig);
        }

        // Update the content of the (now guaranteed to exist) panel
        this.updateProjectPanelContent(PANEL_ID, projectName, projectData);
    }

    updateProjectPanelContent(panelId, projectName, projectData)
    {
        const panel = this.panels.get(panelId);
        if (!panel) return;

        // Update the project associated with the panel
        panel.config.projectName = projectName;
        panel.config.title = `📋 ${projectName}`; // Update title to be specific
        const titleEl = panel.element.querySelector('.panel-title');
        if (titleEl) titleEl.textContent = panel.config.title;

        // Define tab content
        const overviewContent = `
            <div class="tab-content-inner">
                <h4>Project Overview</h4>
                <p>${projectData.description || 'No description available.'}</p>
                <hr>
                <h5>Key Metrics</h5>
                <p><strong>Active Projects:</strong> 5</p>
                <p><strong>Pending Tasks:</strong> 23</p>
                <p><strong>Completed Today:</strong> 7</p>
                <div style="margin-top: 20px;">
                    <button class="ui-button">View All Projects</button>
                    <button class="ui-button primary">Add New Task</button>
                </div>
            </div>`;

        const todosContent = `
            <div class="tab-content-inner">
                <h4>Active Todos for ${projectName}</h4>
                <ul>
                    ${(projectData.todos && projectData.todos.length > 0) ?
                projectData.todos.map(todo => `<li>${todo}</li>`).join('') :
                '<li>No active todos.</li>'}
                </ul>
            </div>`;

        const filesContent = `
            <div class="tab-content-inner">
                <h4>Files for ${projectName}</h4>
                <p>File browsing functionality coming soon...</p>
            </div>`;

        const tabs = [
            { id: 'overview', title: '📊 Overview', content: overviewContent },
            { id: 'todos', title: '✅ Todos', content: todosContent },
            { id: 'files', title: '📁 Files', content: filesContent }
        ];

        // Set the tabs and activate the first one
        this.setPanelTabs(panelId, tabs);
        this.setActiveTab(panelId, 'overview');
    }

    createMCPToolPanel(toolName)
    {
        const toolConfig = {
            'list_projects': { title: '📂 Project List', content: 'Displaying all projects...' },
            'add_todo': { title: '📝 Add Todo', content: 'Enter the todo description...' },
            'query_todos': { title: '🔍 Query Todos', content: 'Enter the todo description...' },
            'get_analytics': { title: '📊 Get Analytics', content: 'Getting analytics...' },
            'tools': { title: '🛠️ Tools', content: 'Displaying available tools...' },
            'logs': { title: '📋 Logs', content: 'Displaying MCP logs...' },
            'debug': { title: '🐛 Debug', content: 'Getting debug information...' }
        };

        const panelConfig = {
            id: `mcp-${toolName}-panel`,
            title: `🔧 MCP: ${toolName}`,
            type: 'mcp-panel',
            tabs: [
                { id: 'result', title: '📤 Result', content: toolConfig[toolName].content },
                { id: 'debug', title: '🐛 Debug', content: toolConfig[toolName].content }
            ]
        };

        this.createPanel(panelConfig);
    }

    // 🎯 CONTEXTUAL AGENT PANEL
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
        this.createMCPToolPanel(toolName);
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
                    <p><strong>F4</strong> - Create Project Panel</p>
                    <p><strong>F5</strong> - Create Agent Panel</p>
                    <p><strong>F6</strong> - Create MCP Tools Panel</p>
                    <p><strong>F7</strong> - Create Analytics Panel</p>
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
        return `
            <div class="content-section">
                <h3>🛠️ Available MCP Tools</h3>
                <button class="action-button">📂 list_projects</button>
                <button class="action-button">📝 add_todo</button>
                <button class="action-button">🔍 query_todos</button>
                <button class="action-button">📊 get_analytics</button>
            </div>
        `;
    }

    generateLogsContent()
    {
        return `
            <div class="content-section">
                <h3>📋 MCP Logs</h3>
                <div style="font-size: 11px; opacity: 0.8; height: 120px; overflow-y: auto;">
                    <p>[14:25] list_projects - SUCCESS</p>
                    <p>[14:23] add_todo - SUCCESS</p>
                    <p>[14:20] query_todos - SUCCESS</p>
                </div>
            </div>
        `;
    }

    generateDebugContent()
    {
        return `
            <div class="content-section">
                <h3>🐛 Debug Info</h3>
                <p style="font-size: 11px;">MCP Server: Connected</p>
                <p style="font-size: 11px;">Active Tools: 12</p>
                <p style="font-size: 11px;">Last Ping: 2ms</p>
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
}

// 🚀 INITIALIZE FLOATING PANEL SYSTEM - ENHANCED INITIALIZATION
window.addEventListener('load', () =>
{
    try
    {
        // Ensure we don't create multiple instances
        if (window.panelSystem)
        {
            console.log('🎪 Panel system already initialized');
            return;
        }

        window.panelSystem = new FloatingPanelSystem();

        // Verify the handleKeyboard method is available
        if (typeof window.panelSystem.handleKeyboard !== 'function')
        {
            console.error('❌ handleKeyboard method not found on panel system');
        } else
        {
            console.log('✅ handleKeyboard method verified');
        }

        console.log('🎪 Floating Panel Madness initialized!');
    } catch (error)
    {
        console.error('❌ Failed to initialize panel system:', error);
    }
});

// 🎮 INTEGRATION WITH SWARMDESK - ENHANCED ERROR HANDLING
if (typeof SwarmDeskDashboard !== 'undefined')
{
    // Enhanced project selection
    const originalSelectProject = SwarmDeskDashboard.selectProject;
    SwarmDeskDashboard.selectProject = function (projectName)
    {
        try
        {
            originalSelectProject.call(this, projectName);

            // Create contextual panel if system is ready
            if (window.panelSystem && typeof window.panelSystem.createContextualProjectPanel === 'function')
            {
                setTimeout(() =>
                {
                    window.panelSystem.createContextualProjectPanel(projectName, projectReadmes[projectName]);
                }, 100);
            }
        } catch (error)
        {
            console.warn('⚠️ Project selection integration failed:', error);
        }
    };
}

// 🛡️ GLOBAL ERROR HANDLER FOR PANEL SYSTEM
window.addEventListener('error', (event) =>
{
    if (event.message.includes('panelSystem') || event.message.includes('handleKeyboard'))
    {
        console.warn('🛡️ Intercepted panel system error:', event.message);
        event.preventDefault();
    }
});

console.log('🎪 Floating Panel System loaded successfully!');
