// 🎪 DASHBOARD INTEGRATION HOOKS FOR SWARMDESK
// This file enhances the existing SwarmDesk with dashboard communication

// 🔧 Dashboard Communication Bridge
window.SwarmDeskDashboard = {
    // Current state
    currentProject: null,
    activeAgent: null,
    sidebarCallbacks: {
        onProjectSelect: null,
        onAgentInteract: null,
        onMCPTool: null,
        onActivityLog: null
    },

    // 📊 Register dashboard callbacks
    registerCallbacks: function (callbacks)
    {
        Object.assign(this.sidebarCallbacks, callbacks);
    },

    // 🎯 Project selection handler
    selectProject: function (projectName)
    {
        this.currentProject = projectName;

        // Update sidebar if callback exists
        if (this.sidebarCallbacks.onProjectSelect)
        {
            this.sidebarCallbacks.onProjectSelect(projectName, projectReadmes[projectName]);
        }

        // Log activity
        this.logActivity('SwarmDesk', `Selected project: ${projectName}`);

        // Focus camera on project workstation if possible
        this.focusOnProject(projectName);
    },

    // 🤖 Agent interaction handler
    interactWithAgent: function (agent)
    {
        this.activeAgent = agent;

        if (this.sidebarCallbacks.onAgentInteract)
        {
            this.sidebarCallbacks.onAgentInteract(agent.userData);
        }

        this.logActivity('Agent', `Interfacing with ${agent.userData.name}`);
    },

    // 🛠️ MCP tool execution handler
    executeMCPTool: function (toolName, result)
    {
        if (this.sidebarCallbacks.onMCPTool)
        {
            this.sidebarCallbacks.onMCPTool(toolName, result);
        }

        this.logActivity('MCP', `Executed: ${toolName}`);
    },

    // 📋 Activity logging
    logActivity: function (source, message)
    {
        if (this.sidebarCallbacks.onActivityLog)
        {
            this.sidebarCallbacks.onActivityLog(source, message, new Date());
        }
    },

    // 🎯 Focus camera on project workstation
    focusOnProject: function (projectName)
    {
        const station = workstations.find(s => s.userData.projectName === projectName);
        if (station && camera)
        {
            // Smooth camera movement toward the station
            const targetPos = station.position.clone();
            targetPos.y = 2;
            targetPos.z += 8; // Stand back from workstation

            // Animate camera movement (simple implementation)
            this.animateCamera(camera.position, targetPos, 2000);
        }
    },

    // 📸 Camera animation helper
    animateCamera: function (startPos, endPos, duration)
    {
        const startTime = Date.now();
        const initialPos = startPos.clone();

        const animate = () =>
        {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing
            const eased = progress * progress * (3.0 - 2.0 * progress);

            camera.position.lerpVectors(initialPos, endPos, eased);

            if (progress < 1)
            {
                requestAnimationFrame(animate);
            }
        };

        animate();
    },

    // 🎮 Enhanced interaction detection
    checkWorkstationInteraction: function (playerPosition)
    {
        let nearestStation = null;
        let minDistance = Infinity;

        workstations.forEach(station =>
        {
            const distance = playerPosition.distanceTo(station.position);
            if (distance < 5 && distance < minDistance)
            {
                minDistance = distance;
                nearestStation = station;
            }
        });

        // Auto-select project when near workstation
        if (nearestStation && nearestStation.userData.projectName !== this.currentProject)
        {
            this.selectProject(nearestStation.userData.projectName);
        }

        return nearestStation;
    },

    // 🎨 Get project color scheme
    getProjectColors: function (projectName)
    {
        const colors = {
            'EventGhost': { primary: '#ff6b35', secondary: '#ff8c5c' },
            'DVTTestKit': { primary: '#00ff88', secondary: '#33ffaa' },
            'Inventorium': { primary: '#0088ff', secondary: '#33aaff' },
            'Omnispindle': { primary: '#ff00ff', secondary: '#ff33ff' },
            'Swarmonomicon': { primary: '#ffaa00', secondary: '#ffcc33' },
            'MadnessCore': { primary: '#00ffff', secondary: '#33ffff' }
        };

        return colors[projectName] || { primary: '#ffffff', secondary: '#cccccc' };
    },

    // 📊 Get real-time analytics
    getAnalytics: function ()
    {
        return {
            activeProjects: Object.keys(projectReadmes).length,
            totalAgents: agents ? agents.length : 6,
            activeAgents: agents ? agents.filter(a => a.userData.isActive).length : 4,
            systemLoad: Math.floor(30 + Math.random() * 40) + '%',
            uptime: this.getUptime()
        };
    },

    // ⏰ Get system uptime
    getUptime: function ()
    {
        if (!this.startTime) this.startTime = Date.now();
        const uptime = Date.now() - this.startTime;
        const minutes = Math.floor(uptime / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }
};

// 🎪 ENHANCED SWARMDESK FUNCTIONS

// Override existing project exploration
if (typeof exploreProject !== 'undefined')
{
    const originalExploreProject = exploreProject;
    exploreProject = function (projectName)
    {
        originalExploreProject(projectName);
        SwarmDeskDashboard.selectProject(projectName);
    };
}

// Override existing agent dialogue opening
if (typeof openDialogue !== 'undefined')
{
    const originalOpenDialogue = openDialogue;
    openDialogue = function (agent)
    {
        originalOpenDialogue(agent);
        SwarmDeskDashboard.interactWithAgent(agent);
    };
}

// Override existing MCP tool execution
if (typeof runMCPCommand !== 'undefined')
{
    const originalRunMCPCommand = runMCPCommand;
    runMCPCommand = function (command)
    {
        originalRunMCPCommand(command);
        SwarmDeskDashboard.executeMCPTool(command, 'success');
    };
}

// 🚀 DASHBOARD INITIALIZATION
document.addEventListener('DOMContentLoaded', function ()
{
    // Wait for dashboard functions to be available
    setTimeout(() =>
    {
        if (typeof updateCurrentProjectDetails === 'function')
        {
            SwarmDeskDashboard.registerCallbacks({
                onProjectSelect: function (projectName, projectData)
                {
                    updateCurrentProjectDetails(projectName);
                    logActivity('SwarmDesk', `Dashboard: Selected ${projectName}`);
                },

                onAgentInteract: function (agentData)
                {
                    logActivity('Agent', `Dashboard: Interfacing with ${agentData.name}`);
                },

                onMCPTool: function (toolName, result)
                {
                    logActivity('MCP', `Dashboard: ${toolName} executed`);
                },

                onActivityLog: function (source, message, timestamp)
                {
                    if (typeof logActivity === 'function')
                    {
                        logActivity(source, message);
                    }
                }
            });

            console.log('🎪 SwarmDesk Dashboard integration initialized!');
        }
    }, 1000);
});

// 🎮 Enhanced animation loop integration
if (typeof animate !== 'undefined')
{
    // Add dashboard-specific updates to the animation loop
    const originalAnimate = animate;

    // We'll enhance the existing checkInteractions function
    if (typeof checkInteractions !== 'undefined')
    {
        const originalCheckInteractions = checkInteractions;
        checkInteractions = function ()
        {
            originalCheckInteractions();

            // Add workstation interaction detection
            if (camera && camera.position)
            {
                SwarmDeskDashboard.checkWorkstationInteraction(camera.position);
            }
        };
    }
}

console.log('🎪 SwarmDesk Dashboard hooks loaded successfully!'); 
