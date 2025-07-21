// 🎪 DASHBOARD INTEGRATION HOOKS FOR SWARMDESK
// This file enhances the existing SwarmDesk with dashboard communication

// Helper function to wait for a global variable
function waitFor(variableName, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            if (window[variableName] && Object.keys(window[variableName]).length > 0) {
                clearInterval(interval);
                resolve(window[variableName]);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(interval);
                reject(new Error(`Timeout waiting for ${variableName}`));
            }
        }, 100);
    });
}


// 🔧 Dashboard Communication Bridge
window.SwarmDeskDashboard = {
    // Current state
    currentProject: null,
    activeAgent: null,
    sidebarCallbacks: {
        onProjectSelect: null,
        onAgentInteract: null,
        onMCPTool: null,
        onActivityLog: null,
        onProjectNavigator: null
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

    // 🚀 Project Navigator handler
    openProjectNavigator: function ()
    {
        // Trigger project navigator in React dashboard
        if (this.sidebarCallbacks.onProjectNavigator)
        {
            this.sidebarCallbacks.onProjectNavigator();
        }

        this.logActivity('SwarmDesk', 'Opened Project Navigator');
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
            activeProjects: Object.keys(projectReadmes || {}).length,
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
document.addEventListener('DOMContentLoaded', async function ()
{
    try {
        // Wait for projectReadmes to be loaded by swarmdesk.js
        await waitFor('projectReadmes');

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
    } catch (error) {
        console.error('Error initializing dashboard hooks:', error);
    }
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

// 🌐 GLOBAL FUNCTION WRAPPERS FOR HTML INTEGRATION
// These functions are called directly from HTML onclick handlers

function selectProject(projectName) {
    SwarmDeskDashboard.selectProject(projectName);
}

function runMCPTool(toolName) {
    // Execute MCP tool and handle result
    console.log(`🔧 Executing MCP tool: ${toolName}`);

    // Mock tool execution for now - replace with actual MCP calls
    const mockResults = {
        'list_projects': 'Found 5 active projects',
        'add_todo': 'Todo item added successfully',
        'query_todos': 'Found 23 pending todos',
        'check_status': 'All systems operational',
        'analytics': 'Analytics data refreshed'
    };

    const result = mockResults[toolName] || 'Tool executed successfully';
    SwarmDeskDashboard.executeMCPTool(toolName, result);

    // Show result in chat or console
    if (typeof logActivity === 'function') {
        logActivity('MCP', `${toolName}: ${result}`);
    }
}

function handleChatInput(event) {
    if (event.key === 'Enter') {
        const input = event.target;
        const message = input.value.trim();

        if (message) {
            // Add to chat container
            const chatContainer = document.getElementById('chatContainer');
            if (chatContainer) {
                const messageDiv = document.createElement('div');
                messageDiv.style.cssText = 'color:#00ff88;font-size:12px;margin:5px 0;';
                messageDiv.textContent = `> ${message}`;
                chatContainer.appendChild(messageDiv);

                // Auto-scroll to bottom
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }

            // Log activity
            SwarmDeskDashboard.logActivity('Chat', `User: ${message}`);

            // Clear input
            input.value = '';

            // Mock AI response after delay
            setTimeout(() => {
                if (chatContainer) {
                    const responseDiv = document.createElement('div');
                    responseDiv.style.cssText = 'color:#ff6b35;font-size:12px;margin:5px 0;';
                    responseDiv.textContent = `🤖 Processing: "${message}"...`;
                    chatContainer.appendChild(responseDiv);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }, 1000);
        }
    }
}

// 📊 DASHBOARD HELPER FUNCTIONS

function updateCurrentProjectDetails(projectName) {
    const detailsElement = document.getElementById('currentProjectDetails');
    if (detailsElement && projectName) {
        const colors = SwarmDeskDashboard.getProjectColors(projectName);
        detailsElement.innerHTML = `
            <div style="color: ${colors.primary}; font-weight: bold; margin-bottom: 8px;">
                📋 ${projectName}
            </div>
            <div style="font-size: 11px; opacity: 0.8; line-height: 1.4;">
                Status: Active Development<br>
                Last Updated: ${new Date().toLocaleDateString()}<br>
                <span style="color: ${colors.secondary};">Click workstation for details</span>
            </div>
        `;
    }
}

function logActivity(source, message) {
    const activityLog = document.getElementById('activityLog');
    if (activityLog) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.style.cssText = 'margin: 3px 0; padding: 3px; border-left: 2px solid #00ff88;';
        logEntry.innerHTML = `
            <span style="color: #888; font-size: 10px;">${timestamp}</span><br>
            <span style="color: #00ff88;">[${source}]</span> ${message}
        `;

        activityLog.appendChild(logEntry);
        activityLog.scrollTop = activityLog.scrollHeight;

        // Keep only last 50 entries
        while (activityLog.children.length > 50) {
            activityLog.removeChild(activityLog.firstChild);
        }
    }
}

// 🎯 ANALYTICS UPDATE LOOP
function updateAnalytics() {
    const analytics = SwarmDeskDashboard.getAnalytics();

    // Update analytics display
    const elements = {
        'activeProjects': analytics.activeProjects,
        'pendingTodos': Math.floor(Math.random() * 30) + 15, // Mock dynamic data
        'completedToday': Math.floor(Math.random() * 10) + 5,
        'activeAgents': analytics.activeAgents,
        'systemLoad': analytics.systemLoad
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Start analytics update loop
setInterval(updateAnalytics, 5000);

// Initial analytics update
setTimeout(updateAnalytics, 1000);
