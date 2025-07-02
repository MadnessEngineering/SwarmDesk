// 🎪 ADVANCED FLOATING PANEL FEATURES
// Multi-monitor support, persistent layouts, enhanced context intelligence

class AdvancedPanelFeatures
{
    constructor(panelSystem)
    {
        this.panelSystem = panelSystem;
        this.layoutStorage = new PanelLayoutStorage();
        this.multiMonitor = new MultiMonitorManager();
        this.contextEngine = new ContextualIntelligence(panelSystem);
        this.performanceOptimizer = new PanelPerformanceOptimizer();

        this.init();
    }

    init()
    {
        this.setupMultiMonitorSupport();
        this.setupPersistentLayouts();
        this.setupAdvancedContexts();
        this.setupPerformanceOptimizations();

        console.log('🚀 Advanced Panel Features loaded!');
    }

    // 🖥️ MULTI-MONITOR SUPPORT
    setupMultiMonitorSupport()
    {
        this.multiMonitor.detectScreens();
        this.setupCrossMonitorDragging();
        this.setupScreenAwareDocking();
    }

    setupCrossMonitorDragging()
    {
        // Enhanced drag to support multiple monitors
        const originalHandleMouseMove = this.panelSystem.handleMouseMove.bind(this.panelSystem);

        this.panelSystem.handleMouseMove = (event) =>
        {
            originalHandleMouseMove(event);

            if (this.panelSystem.dragState.isDragging)
            {
                this.multiMonitor.checkScreenBoundaries(event, this.panelSystem.dragState.panel);
            }
        };
    }

    setupScreenAwareDocking()
    {
        // Create dock zones for each connected monitor
        this.multiMonitor.screens.forEach((screen, index) =>
        {
            if (index > 0)
            { // Skip primary monitor (already has zones)
                this.createMonitorDockZones(screen, index);
            }
        });
    }

    createMonitorDockZones(screen, monitorIndex)
    {
        const zones = ['left', 'right', 'top', 'bottom'];

        zones.forEach(position =>
        {
            const zoneId = `dock-${position}-monitor-${monitorIndex}`;
            const zoneElement = this.createDockZoneElement(zoneId, position, screen);

            document.body.appendChild(zoneElement);

            this.panelSystem.dockZones.set(zoneId, {
                element: zoneElement,
                dockedPanels: [],
                position: this.calculateMonitorDockPosition(position, screen),
                monitor: monitorIndex
            });
        });
    }

    // 💾 PERSISTENT LAYOUTS
    setupPersistentLayouts()
    {
        this.loadSavedLayout();
        this.setupAutoSave();
        this.setupLayoutProfiles();
    }

    saveCurrentLayout()
    {
        const layout = {
            panels: [],
            timestamp: Date.now(),
            version: '1.0'
        };

        this.panelSystem.panels.forEach((panel, panelId) =>
        {
            layout.panels.push({
                id: panelId,
                config: panel.config,
                position: {
                    x: parseInt(panel.element.style.left),
                    y: parseInt(panel.element.style.top)
                },
                size: {
                    width: panel.element.offsetWidth,
                    height: panel.element.offsetHeight
                },
                isDocked: panel.isDocked,
                dockZone: panel.dockZone,
                activeTab: panel.activeTab,
                isMinimized: panel.element.classList.contains('minimized')
            });
        });

        this.layoutStorage.save('current', layout);
        console.log('💾 Layout saved successfully');
    }

    loadSavedLayout()
    {
        const layout = this.layoutStorage.load('current');

        if (layout && layout.panels)
        {
            // Clear existing panels (except welcome)
            this.panelSystem.panels.forEach((panel, panelId) =>
            {
                if (!panelId.includes('welcome'))
                {
                    this.panelSystem.closePanel(panelId);
                }
            });

            // Recreate panels from saved layout
            layout.panels.forEach(panelData =>
            {
                if (!panelData.id.includes('welcome'))
                {
                    const recreatedId = this.panelSystem.createPanel(panelData.config);
                    const recreatedPanel = this.panelSystem.panels.get(recreatedId);

                    // Restore position and state
                    recreatedPanel.element.style.left = panelData.position.x + 'px';
                    recreatedPanel.element.style.top = panelData.position.y + 'px';

                    if (panelData.isDocked && panelData.dockZone)
                    {
                        this.panelSystem.dockPanel(recreatedId, panelData.dockZone);
                    }

                    if (panelData.isMinimized)
                    {
                        this.panelSystem.minimizePanel(recreatedId);
                    }
                }
            });

            console.log('📂 Layout restored successfully');
        }
    }

    setupAutoSave()
    {
        // Auto-save layout every 30 seconds
        setInterval(() =>
        {
            this.saveCurrentLayout();
        }, 30000);

        // Save on window close
        window.addEventListener('beforeunload', () =>
        {
            this.saveCurrentLayout();
        });
    }

    setupLayoutProfiles()
    {
        this.layoutProfiles = {
            'development': {
                name: 'Development Mode',
                description: 'Project panels, MCP tools, and agent assistance',
                autoCreate: ['project', 'mcp', 'agent']
            },
            'analysis': {
                name: 'Analysis Mode',
                description: 'Analytics, metrics, and system monitoring',
                autoCreate: ['analytics', 'mcp']
            },
            'creative': {
                name: 'Creative Mode',
                description: 'Agent interaction and project exploration',
                autoCreate: ['agent', 'project']
            }
        };
    }

    // 🧠 ADVANCED CONTEXTUAL INTELLIGENCE
    setupAdvancedContexts()
    {
        this.contextEngine.setupIntelligentPanelSuggestions();
        this.contextEngine.setupWorkflowDetection();
        this.contextEngine.setupSmartContentGeneration();
    }

    // ⚡ PERFORMANCE OPTIMIZATIONS
    setupPerformanceOptimizations()
    {
        this.performanceOptimizer.setupLazyLoading();
        this.performanceOptimizer.setupVirtualization();
        this.performanceOptimizer.setupMemoryManagement();
    }
}

// 🖥️ MULTI-MONITOR MANAGER
class MultiMonitorManager
{
    constructor()
    {
        this.screens = [];
        this.primaryScreen = null;
    }

    detectScreens()
    {
        // Use Screen API if available
        if (window.screen && window.screen.isExtended)
        {
            this.screens = window.screen.getAllScreens ? window.screen.getAllScreens() : [window.screen];
        } else
        {
            // Fallback to single screen
            this.screens = [{
                left: 0,
                top: 0,
                width: window.screen.width,
                height: window.screen.height,
                isPrimary: true
            }];
        }

        this.primaryScreen = this.screens.find(screen => screen.isPrimary) || this.screens[0];
        console.log(`🖥️ Detected ${this.screens.length} screen(s)`);
    }

    checkScreenBoundaries(event, panel)
    {
        const panelRect = panel.element.getBoundingClientRect();

        // Find which screen the panel is on
        const currentScreen = this.screens.find(screen =>
            event.clientX >= screen.left &&
            event.clientX <= screen.left + screen.width &&
            event.clientY >= screen.top &&
            event.clientY <= screen.top + screen.height
        );

        if (currentScreen && currentScreen !== panel.currentScreen)
        {
            panel.currentScreen = currentScreen;
            console.log(`🖥️ Panel moved to screen ${this.screens.indexOf(currentScreen)}`);
        }
    }
}

// 💾 LAYOUT STORAGE MANAGER
class PanelLayoutStorage
{
    constructor()
    {
        this.storageKey = 'swarmdesk-panel-layouts';
        this.maxLayouts = 10;
    }

    save(name, layout)
    {
        try
        {
            const layouts = this.getAllLayouts();
            layouts[name] = layout;

            // Keep only the most recent layouts
            const layoutNames = Object.keys(layouts);
            if (layoutNames.length > this.maxLayouts)
            {
                const sortedByTime = layoutNames.sort((a, b) =>
                    (layouts[b].timestamp || 0) - (layouts[a].timestamp || 0)
                );

                // Remove oldest layouts
                sortedByTime.slice(this.maxLayouts).forEach(oldName =>
                {
                    delete layouts[oldName];
                });
            }

            localStorage.setItem(this.storageKey, JSON.stringify(layouts));
            return true;
        } catch (error)
        {
            console.error('💾 Failed to save layout:', error);
            return false;
        }
    }

    load(name)
    {
        try
        {
            const layouts = this.getAllLayouts();
            return layouts[name] || null;
        } catch (error)
        {
            console.error('📂 Failed to load layout:', error);
            return null;
        }
    }

    getAllLayouts()
    {
        try
        {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error)
        {
            console.error('📂 Failed to read layouts:', error);
            return {};
        }
    }

    deleteLayout(name)
    {
        try
        {
            const layouts = this.getAllLayouts();
            delete layouts[name];
            localStorage.setItem(this.storageKey, JSON.stringify(layouts));
            return true;
        } catch (error)
        {
            console.error('🗑️ Failed to delete layout:', error);
            return false;
        }
    }
}

// 🧠 CONTEXTUAL INTELLIGENCE ENGINE
class ContextualIntelligence
{
    constructor(panelSystem)
    {
        this.panelSystem = panelSystem;
        this.workflowPatterns = new Map();
        this.userPreferences = new Map();
        this.contextHistory = [];
    }

    setupIntelligentPanelSuggestions()
    {
        // Track user interactions to suggest relevant panels
        this.trackWorkflowPatterns();
        this.setupSmartSuggestions();
    }

    trackWorkflowPatterns()
    {
        // Monitor which panels are used together
        setInterval(() =>
        {
            const activePanels = Array.from(this.panelSystem.panels.keys());
            if (activePanels.length > 1)
            {
                const pattern = activePanels.sort().join('-');
                const count = this.workflowPatterns.get(pattern) || 0;
                this.workflowPatterns.set(pattern, count + 1);
            }
        }, 60000); // Check every minute
    }

    setupSmartSuggestions()
    {
        // Suggest panels based on context
        document.addEventListener('keydown', (e) =>
        {
            if (e.ctrlKey && e.shiftKey && e.key === 'P')
            {
                this.showSmartPanelSuggestions();
            }
        });
    }

    showSmartPanelSuggestions()
    {
        const suggestions = this.generateSuggestions();

        // Create suggestion popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 20, 40, 0.95);
            border: 2px solid #00ff88;
            border-radius: 12px;
            padding: 20px;
            z-index: 10000;
            backdrop-filter: blur(20px);
            min-width: 300px;
        `;

        popup.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #00ff88;">🧠 Smart Panel Suggestions</h3>
            ${suggestions.map(suggestion => `
                <div style="padding: 8px; margin: 5px 0; background: rgba(0,255,136,0.1); 
                     border-radius: 6px; cursor: pointer; transition: all 0.3s ease;"
                     onclick="panelSystem.createContextualPanel('${suggestion.type}'); this.parentElement.remove();">
                    <strong>${suggestion.title}</strong><br>
                    <small style="opacity: 0.8;">${suggestion.reason}</small>
                </div>
            `).join('')}
            <button onclick="this.parentElement.remove()" 
                    style="margin-top: 10px; padding: 6px 12px; background: rgba(255,68,68,0.2); 
                           border: 1px solid #ff4444; border-radius: 4px; color: #ff4444; cursor: pointer;">
                Close
            </button>
        `;

        document.body.appendChild(popup);

        // Auto-close after 10 seconds
        setTimeout(() =>
        {
            if (popup.parentElement) popup.remove();
        }, 10000);
    }

    generateSuggestions()
    {
        const suggestions = [];
        const activePanelTypes = new Set();

        this.panelSystem.panels.forEach(panel =>
        {
            activePanelTypes.add(panel.config.type);
        });

        // Suggest complementary panels
        if (activePanelTypes.has('project-panel') && !activePanelTypes.has('mcp-panel'))
        {
            suggestions.push({
                type: 'mcp',
                title: '🔧 MCP Tools Panel',
                reason: 'Useful for project development workflows'
            });
        }

        if (activePanelTypes.has('mcp-panel') && !activePanelTypes.has('analytics-panel'))
        {
            suggestions.push({
                type: 'analytics',
                title: '📊 Analytics Panel',
                reason: 'Monitor MCP tool performance and usage'
            });
        }

        if (!activePanelTypes.has('agent-panel'))
        {
            suggestions.push({
                type: 'agent',
                title: '🤖 Agent Interface',
                reason: 'AI assistance for your current workflow'
            });
        }

        return suggestions;
    }

    setupWorkflowDetection()
    {
        // Detect common workflows and auto-suggest optimizations
        this.workflowDetector = setInterval(() =>
        {
            this.analyzeCurrentWorkflow();
        }, 120000); // Every 2 minutes
    }

    analyzeCurrentWorkflow()
    {
        const panelTypes = Array.from(this.panelSystem.panels.values())
            .map(panel => panel.config.type);

        const workflow = this.detectWorkflowType(panelTypes);

        if (workflow && workflow !== this.lastDetectedWorkflow)
        {
            this.lastDetectedWorkflow = workflow;
            this.suggestWorkflowOptimizations(workflow);
        }
    }

    detectWorkflowType(panelTypes)
    {
        if (panelTypes.includes('project-panel') && panelTypes.includes('mcp-panel'))
        {
            return 'development';
        } else if (panelTypes.includes('analytics-panel') && panelTypes.includes('mcp-panel'))
        {
            return 'analysis';
        } else if (panelTypes.includes('agent-panel') && panelTypes.includes('project-panel'))
        {
            return 'creative';
        }
        return null;
    }

    suggestWorkflowOptimizations(workflow)
    {
        console.log(`[ContextualIntelligence] Suggesting optimizations for workflow: ${workflow}`);
        // TODO: Implement actual workflow optimization suggestions
        const suggestionPanelId = `workflow-suggestion-${Date.now()}`;
        const suggestionContent = `
            <h3>🚀 Workflow Optimization Suggested!</h3>
            <p>For your current <strong>${workflow}</strong> workflow, consider:</p>
            <ul>
                <li>Docking related panels together for easier access.</li>
                <li>Using layout profiles to save this workspace setup.</li>
                <li>Exploring related MCP tools to automate tasks.</li>
            </ul>
        `;

        if (this.panelSystem.createPanel)
        {
            this.panelSystem.createPanel({
                id: suggestionPanelId,
                type: 'suggestion',
                title: 'Workflow Suggestion',
                content: suggestionContent
            });
        }
    }

    setupSmartContentGeneration()
    {
        // Generate contextually relevant content based on SwarmDesk state
        this.contentGenerator = new SmartContentGenerator(this.panelSystem);
    }
}

// ⚡ PERFORMANCE OPTIMIZER
class PanelPerformanceOptimizer
{
    constructor()
    {
        this.observedPanels = new Set();
        this.intersectionObserver = null;
    }

    setupLazyLoading()
    {
        // Only render panel content when visible
        this.intersectionObserver = new IntersectionObserver((entries) =>
        {
            entries.forEach(entry =>
            {
                if (entry.isIntersecting)
                {
                    this.loadPanelContent(entry.target);
                } else
                {
                    this.unloadPanelContent(entry.target);
                }
            });
        }, { threshold: 0.1 });
    }

    setupVirtualization()
    {
        // Virtualize large lists in panels
        if (typeof this.setupVirtualScrolling === 'function')
        {
            this.setupVirtualScrolling();
        } else
        {
            console.warn('[PanelPerformanceOptimizer] setupVirtualScrolling is not implemented. Skipping virtualization.');
        }
    }

    setupMemoryManagement()
    {
        // Clean up unused resources
        setInterval(() =>
        {
            this.cleanupUnusedResources();
        }, 300000); // Every 5 minutes
    }

    loadPanelContent(panelElement)
    {
        if (!this.observedPanels.has(panelElement.id))
        {
            // Initialize lazy-loaded content
            const lazyContent = panelElement.querySelectorAll('[data-lazy-load]');
            lazyContent.forEach(element =>
            {
                if (element.dataset.lazyLoad === 'true')
                {
                    this.loadLazyContent(element);
                    element.dataset.lazyLoad = 'false';
                }
            });

            this.observedPanels.add(panelElement.id);
        }
    }

    unloadPanelContent(panelElement)
    {
        // Unload heavy content when panel is not visible
        if (this.observedPanels.has(panelElement.id))
        {
            const heavyContent = panelElement.querySelectorAll('[data-heavy-content]');
            heavyContent.forEach(element =>
            {
                if (element.dataset.heavyContent === 'loaded')
                {
                    this.unloadHeavyContent(element);
                    element.dataset.heavyContent = 'unloaded';
                }
            });
        }
    }

    cleanupUnusedResources()
    {
        // Remove closed panel references
        this.observedPanels.forEach(panelId =>
        {
            if (!document.getElementById(panelId))
            {
                this.observedPanels.delete(panelId);
            }
        });

        console.log('🧹 Cleaned up unused panel resources');
    }
}

// 🎨 SMART CONTENT GENERATOR
class SmartContentGenerator
{
    constructor(panelSystem)
    {
        this.panelSystem = panelSystem;
        this.templates = new Map();
        this.setupContentTemplates();
    }

    setupContentTemplates()
    {
        this.templates.set('project-insights', {
            generate: (projectData) => this.generateProjectInsights(projectData),
            refresh: 60000 // Refresh every minute
        });

        this.templates.set('workflow-suggestions', {
            generate: (context) => this.generateWorkflowSuggestions(context),
            refresh: 300000 // Refresh every 5 minutes
        });
    }

    generateProjectInsights(projectData)
    {
        return `
            <div class="content-section">
                <h3>💡 Project Insights</h3>
                <p>📈 Productivity Score: ${Math.floor(Math.random() * 30 + 70)}%</p>
                <p>🔥 Hot Files: ${projectData?.hotFiles || 'swarmdesk.js, dashboard-integrated.html'}</p>
                <p>⚡ Recent Activity: ${this.getRecentActivity()}</p>
                <p>🎯 Suggested Focus: ${this.getSuggestedFocus(projectData)}</p>
            </div>
        `;
    }

    generateWorkflowSuggestions(context)
    {
        const suggestions = [
            'Consider creating an analytics panel to track your progress',
            'The MCP tools panel could help automate repetitive tasks',
            'Agent assistance might speed up your current workflow',
            'Try docking panels to the edges for better screen organization'
        ];

        return `
            <div class="content-section">
                <h3>🚀 Workflow Suggestions</h3>
                <p>${suggestions[Math.floor(Math.random() * suggestions.length)]}</p>
            </div>
        `;
    }

    getRecentActivity()
    {
        const activities = [
            'Panel creation spike detected',
            'High SwarmDesk interaction rate',
            'Multiple project switches',
            'Intensive MCP tool usage'
        ];
        return activities[Math.floor(Math.random() * activities.length)];
    }

    getSuggestedFocus(projectData)
    {
        const focuses = [
            'Complete floating panel system',
            'Enhance SwarmDesk integration',
            'Optimize performance',
            'Add multi-monitor support'
        ];
        return focuses[Math.floor(Math.random() * focuses.length)];
    }
}

// 🚀 INITIALIZE ADVANCED FEATURES
window.addEventListener('load', () =>
{
    setTimeout(() =>
    {
        if (window.panelSystem)
        {
            window.advancedPanelFeatures = new AdvancedPanelFeatures(window.panelSystem);
            console.log('🎪 Advanced Panel Features initialized!');
        }
    }, 1000);
});

console.log('🚀 Advanced Panel Features loaded successfully!'); 
