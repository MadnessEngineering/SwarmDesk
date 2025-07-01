// SwarmDesk - Madness Interactive Agent Command Center
// Scene setup with cyber-punk aesthetic
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000511);
scene.fog = new THREE.Fog(0x000511, 20, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1.6, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000511);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Project README data - the heart of our madness!
const projectReadmes = {
    "EventGhost": {
        title: "🎭 EventGhost-Rust",
        description: "Automation system rewritten in Rust for maximum performance and madness",
        features: ["🚀 Lightning-fast event processing", "🔧 Plugin architecture", "🌐 Network automation"],
        status: "🔥 Active Development"
    },
    "DVTTestKit": {
        title: "🧪 DVT TestKit",
        description: "Design Verification Testing framework for ensuring quality chaos",
        features: ["✅ Automated testing", "📊 Performance metrics", "🔍 Regression detection"],
        status: "🛠️ Maintenance Mode"
    },
    "Inventorium": {
        title: "📦 Inventorium",
        description: "Asset and inventory management system - organizing the beautiful chaos",
        features: ["📋 Asset tracking", "🏷️ Smart categorization", "📈 Analytics dashboard"],
        status: "🚀 Production Ready"
    },
    "Omnispindle": {
        title: "🌀 Omnispindle",
        description: "MCP server for todo management - the spinning wheel of productivity",
        features: ["📝 Todo management", "🔄 MCP integration", "🎯 Project coordination"],
        status: "🔄 Continuous Evolution"
    },
    "Swarmonomicon": {
        title: "🐝 Swarmonomicon",
        description: "AI agent swarm coordination system - the book of digital bees",
        features: ["🤖 Agent orchestration", "💬 Communication protocols", "🎮 Interactive interfaces"],
        status: "✨ Experimental Madness"
    },
    "MadnessCore": {
        title: "🧠 MadnessCore",
        description: "System architecture foundation - the beating heart of chaos",
        features: ["🏗️ Core infrastructure", "🔌 Plugin system", "⚡ High performance"],
        status: "🏛️ Foundational"
    }
};

// MCP Toolkit data for the debugging wall
const mcpToolkit = {
    "Todo Management": [
        "📝 add_todo_tool - Create new todos",
        "📋 list_todos_by_status - View todos by status",
        "✅ mark_todo_complete - Complete todos",
        "🔍 query_todos - Search and filter todos"
    ],
    "Project Management": [
        "📂 list_projects - Get all projects",
        "📊 list_project_todos - Project-specific todos",
        "📈 query_todo_logs - Track project activity"
    ],
    "Knowledge Base": [
        "🧠 add_lesson - Store learning",
        "📚 search_lessons - Find knowledge",
        "💡 list_lessons - Browse all lessons"
    ],
    "System Integration": [
        "🔧 Real-time status updates",
        "🌐 Cross-project coordination",
        "🎯 Intelligent task routing"
    ]
};

// Cyber-punk lighting
const ambientLight = new THREE.AmbientLight(0x0a0a2e, 0.3);
scene.add(ambientLight);

const neonLight1 = new THREE.DirectionalLight(0x00ff00, 0.8);
neonLight1.position.set(10, 20, 10);
neonLight1.castShadow = true;
scene.add(neonLight1);

const neonLight2 = new THREE.PointLight(0xff6b35, 1, 50);
neonLight2.position.set(-10, 5, -10);
scene.add(neonLight2);

// Floor with grid pattern
const floorGeometry = new THREE.PlaneGeometry(60, 60);
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x001122,
    metalness: 0.8,
    roughness: 0.2
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Add grid lines to floor
const gridHelper = new THREE.GridHelper(60, 60, 0x00ff00, 0x003300);
gridHelper.position.y = 0.01;
scene.add(gridHelper);

// Walls with holographic displays
const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x001122,
    metalness: 0.6,
    roughness: 0.4
});

// Back wall
const backWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), wallMaterial);
backWall.position.set(0, 7.5, -30);
backWall.receiveShadow = true;
scene.add(backWall);

// Side walls
const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), wallMaterial);
leftWall.position.set(-30, 7.5, 0);
leftWall.rotation.y = Math.PI / 2;
scene.add(leftWall);

const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), wallMaterial);
rightWall.position.set(30, 7.5, 0);
rightWall.rotation.y = -Math.PI / 2;
scene.add(rightWall);

// Holographic displays on walls
const holoMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff88,
    transparent: true,
    opacity: 0.6
});

for (let i = -20; i <= 20; i += 15)
{
    const holo = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), holoMaterial);
    holo.position.set(i, 8, -29.9);
    scene.add(holo);
}

// Agent workstations with project computers
const stationMaterial = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.7,
    roughness: 0.3
});

function createWorkstation(x, z, projectName, agentType)
{
    const station = new THREE.Group();

    // Desk
    const desk = new THREE.Mesh(new THREE.BoxGeometry(4, 0.1, 2), stationMaterial);
    desk.position.y = 0.75;
    desk.castShadow = true;
    station.add(desk);

    // Desk legs
    const legGeometry = new THREE.BoxGeometry(0.1, 0.7, 0.1);
    const legPositions = [[-1.8, 0.35, -0.8], [1.8, 0.35, -0.8], [-1.8, 0.35, 0.8], [1.8, 0.35, 0.8]];

    legPositions.forEach(pos =>
    {
        const leg = new THREE.Mesh(legGeometry, stationMaterial);
        leg.position.set(...pos);
        leg.castShadow = true;
        station.add(leg);
    });

    // Monitor with project display
    const monitorScreen = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.2, 0.05),
        new THREE.MeshBasicMaterial({
            color: agentType === 'git' ? 0x00ff00 :
                agentType === 'browser' ? 0x0088ff :
                    agentType === 'haiku' ? 0xff6b35 :
                        agentType === 'project' ? 0xff00ff : 0x00ffff
        })
    );
    monitorScreen.position.set(0, 1.5, -0.5);
    station.add(monitorScreen);

    // Monitor stand
    const monitorStand = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.4, 0.1),
        stationMaterial
    );
    monitorStand.position.set(0, 1.0, -0.5);
    station.add(monitorStand);

    // 🚀 MADNESS ENHANCEMENT: Interactive README Display Panel!
    const readmePanel = createReadmePanel(projectName, agentType);
    readmePanel.position.set(1.5, 1.5, 0.2); // Raised initial position
    readmePanel.rotation.y = -Math.PI / 6;
    station.add(readmePanel);

    // Project name label
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, 512, 128);
    context.fillStyle = agentType === 'git' ? '#00ff00' :
        agentType === 'browser' ? '#0088ff' :
            agentType === 'haiku' ? '#ff6b35' :
                agentType === 'project' ? '#ff00ff' : '#00ffff';
    context.font = 'bold 32px Courier New';
    context.textAlign = 'center';
    context.fillText(projectName, 256, 64);
    context.font = '24px Courier New';
    context.fillText(`[${agentType.toUpperCase()}]`, 256, 96);

    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({ map: texture });
    const label = new THREE.Sprite(labelMaterial);
    label.position.set(0, 2.5, -0.5);
    label.scale.set(3, 0.75, 1);
    station.add(label);

    // Holographic data streams
    const streamGeometry = new THREE.CylinderGeometry(0.01, 0.01, 2, 8);
    const streamMaterial = new THREE.MeshBasicMaterial({
        color: agentType === 'git' ? 0x00ff00 :
            agentType === 'browser' ? 0x0088ff :
                agentType === 'haiku' ? 0xff6b35 :
                    agentType === 'project' ? 0xff00ff : 0x00ffff,
        transparent: true,
        opacity: 0.7
    });

    for (let i = 0; i < 3; i++)
    {
        const stream = new THREE.Mesh(streamGeometry, streamMaterial);
        stream.position.set((i - 1) * 0.5, 2.5, -0.3);
        stream.userData = {
            originalY: 2.5,
            speed: 0.01 * (i + 1),
            offset: i * Math.PI / 3
        };
        station.add(stream);
    }

    station.position.set(x, 0, z);
    station.userData = {
        projectName,
        agentType,
        streams: [],
        isInteractive: true,
        readmeData: projectReadmes[projectName]
    };

    // Store stream references
    station.children.forEach(child =>
    {
        if (child.userData && child.userData.speed)
        {
            station.userData.streams.push(child);
        }
    });

    return station;
}

// 🎪 NEW MADNESS: Create Interactive README Panel
function createReadmePanel(projectName, agentType)
{
    const panel = new THREE.Group();

    // Panel background
    const panelGeometry = new THREE.PlaneGeometry(1.8, 2.4);
    const panelMaterial = new THREE.MeshStandardMaterial({
        color: 0x001122,
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9
    });
    const panelMesh = new THREE.Mesh(panelGeometry, panelMaterial);
    panel.add(panelMesh);

    // Create README content display
    const readmeData = projectReadmes[projectName];
    if (readmeData)
    {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = 'rgba(0, 20, 40, 0.95)';
        ctx.fillRect(0, 0, 512, 768);

        // Border glow
        ctx.strokeStyle = agentType === 'git' ? '#00ff00' :
            agentType === 'browser' ? '#0088ff' :
                agentType === 'haiku' ? '#ff6b35' :
                    agentType === 'project' ? '#ff00ff' : '#00ffff';
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 492, 748);

        // Title
        ctx.fillStyle = '#ff6b35';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText(readmeData.title, 256, 50);

        // Description
        ctx.fillStyle = '#00ff88';
        ctx.font = '16px Courier New';
        ctx.textAlign = 'left';
        const words = readmeData.description.split(' ');
        let line = '';
        let y = 100;
        for (let i = 0; i < words.length; i++)
        {
            const testLine = line + words[i] + ' ';
            if (ctx.measureText(testLine).width > 450 && i > 0)
            {
                ctx.fillText(line, 30, y);
                line = words[i] + ' ';
                y += 25;
            } else
            {
                line = testLine;
            }
        }
        ctx.fillText(line, 30, y);

        // Features
        ctx.fillStyle = '#0088ff';
        ctx.font = 'bold 18px Courier New';
        ctx.fillText('🚀 FEATURES:', 30, y + 60);

        ctx.fillStyle = '#00ff00';
        ctx.font = '14px Courier New';
        readmeData.features.forEach((feature, index) =>
        {
            ctx.fillText(feature, 30, y + 90 + (index * 25));
        });

        // Status
        ctx.fillStyle = '#ff6b35';
        ctx.font = 'bold 16px Courier New';
        ctx.fillText(`STATUS: ${readmeData.status}`, 30, y + 200);

        // Interactive hint
        ctx.fillStyle = '#ffff00';
        ctx.font = '12px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('💡 Press E near workstation for details', 256, 720);

        const texture = new THREE.CanvasTexture(canvas);
        const displayMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true
        });
        const display = new THREE.Mesh(panelGeometry, displayMaterial);
        display.position.z = 0.01;
        panel.add(display);
    }

    panel.userData = {
        type: 'readme-panel',
        projectName: projectName,
        isInteractive: true
    };

    return panel;
}

// 🛠️ NEW MADNESS: Create MCP Debugging Toolkit Wall
function createMCPDebuggingWall()
{
    const wall = new THREE.Group();

    // Main wall panel
    const wallGeometry = new THREE.PlaneGeometry(12, 8);
    const wallMaterial = new THREE.MeshStandardMaterial({
        color: 0x001122,
        metalness: 0.7,
        roughness: 0.3
    });
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.add(wallMesh);

    // Create MCP toolkit display
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 768;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'rgba(0, 10, 30, 0.95)';
    ctx.fillRect(0, 0, 1024, 768);

    // Title
    ctx.fillStyle = '#ff6b35';
    ctx.font = 'bold 36px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('🛠️ MCP DEBUGGING TOOLKIT', 512, 50);

    // Subtitle
    ctx.fillStyle = '#00ff88';
    ctx.font = '18px Courier New';
    ctx.fillText('Madness Control Protocol - Agent Command Interface', 512, 85);

    let yOffset = 130;
    Object.entries(mcpToolkit).forEach(([category, tools]) =>
    {
        // Category header
        ctx.fillStyle = '#0088ff';
        ctx.font = 'bold 24px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`🔧 ${category}`, 40, yOffset);
        yOffset += 40;

        // Tools
        ctx.fillStyle = '#00ff00';
        ctx.font = '16px Courier New';
        tools.forEach(tool =>
        {
            ctx.fillText(`  ${tool}`, 60, yOffset);
            yOffset += 25;
        });
        yOffset += 20;
    });

    // Interactive hint
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 14px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('💡 Press M near wall to access MCP debugging interface', 512, 720);

    const texture = new THREE.CanvasTexture(canvas);
    const displayMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });
    const display = new THREE.Mesh(wallGeometry, displayMaterial);
    display.position.z = 0.01;
    wall.add(display);

    // Add glowing border
    const borderGeometry = new THREE.EdgesGeometry(wallGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        linewidth: 3
    });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.position.z = 0.02;
    wall.add(border);

    wall.position.set(-25, 4, 0);
    wall.rotation.y = Math.PI / 2;
    wall.userData = {
        type: 'mcp-debugging-wall',
        isInteractive: true
    };

    return wall;
}

// Create workstations for different projects
const workstations = [
    createWorkstation(-15, -15, "EventGhost", "automation"),
    createWorkstation(0, -15, "DVTTestKit", "git"),
    createWorkstation(15, -15, "Inventorium", "project"),
    createWorkstation(-15, 0, "Omnispindle", "browser"),
    createWorkstation(0, 0, "Swarmonomicon", "haiku"),
    createWorkstation(15, 0, "MadnessCore", "git"),
];

workstations.forEach(station => scene.add(station));

// 🚀 MADNESS ENHANCEMENT: Add MCP Debugging Wall to the scene!
const mcpWall = createMCPDebuggingWall();
scene.add(mcpWall);

// Agent characters
const agents = [];

function createAgent(name, role, x, z, color, agentType, personality)
{
    const group = new THREE.Group();

    // Body with cyberpunk aesthetic
    const bodyGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.6;
    body.castShadow = true;
    group.add(body);

    // Head with holographic glow
    const headGeometry = new THREE.SphereGeometry(0.25, 12, 8);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.8,
        roughness: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.25;
    head.castShadow = true;
    group.add(head);

    // Holographic interface around head
    const haloGeometry = new THREE.RingGeometry(0.3, 0.35, 16);
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.y = 1.25;
    halo.rotation.x = Math.PI / 2;
    group.add(halo);

    // Arms with data connectors
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6);
    const armMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.3, 0.7, 0);
    leftArm.rotation.z = Math.PI / 6;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.3, 0.7, 0);
    rightArm.rotation.z = -Math.PI / 6;
    group.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.8, 6);
    const legMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.15, 0.4, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.15, 0.4, 0);
    group.add(rightLeg);

    // Name and role label
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, 256, 64);
    context.fillStyle = `rgb(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255})`;
    context.font = 'bold 16px Courier New';
    context.textAlign = 'center';
    context.fillText(name, 128, 20);
    context.font = '12px Courier New';
    context.fillText(role, 128, 35);
    context.font = '10px Courier New';
    context.fillText(`[${agentType.toUpperCase()}]`, 128, 50);

    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({ map: texture });
    const label = new THREE.Sprite(labelMaterial);
    label.position.y = 1.8;
    label.scale.set(2, 0.5, 1);
    group.add(label);

    group.position.set(x, 0, z);
    group.userData = {
        name,
        role,
        agentType,
        personality,
        conversations: [],
        initialPosition: new THREE.Vector3(x, 0, z),
        targetPosition: new THREE.Vector3(x, 0, z),
        moveTimer: 0,
        isDancing: false,
        isActive: Math.random() > 0.5,
        halo: halo,
        leftArm: leftArm,
        rightArm: rightArm,
        color: color
    };

    agents.push(group);
    return group;
}

// Create Swarmonomicon agents
const daneAgent = createAgent('D.Edens', 'Mad Tinkerer', -10, -8, 0xff6b35, 'orchestrator', 'chaotic_genius');
const gitAgent = createAgent('Git Assistant', 'Code Shepherd', -5, -8, 0x00ff00, 'git', 'methodical_precise');
const browserAgent = createAgent('Browser Agent', 'Web Crawler', 0, -8, 0x0088ff, 'browser', 'curious_explorer');
const haikuAgent = createAgent('Haiku Bot', 'Digital Poet', 5, -8, 0xff6b35, 'haiku', 'zen_creative');
const greeterAgent = createAgent('Greeter', 'Interface Guide', 10, -8, 0x00ffff, 'greeter', 'welcoming_efficient');
const projectAgent = createAgent('Project Manager', 'System Architect', 15, -8, 0xff00ff, 'project', 'organized_visionary');

scene.add(daneAgent, gitAgent, browserAgent, haikuAgent, greeterAgent, projectAgent);

// Floating particles for ambience
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 200;
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3)
{
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = Math.random() * 20;
    positions[i + 2] = (Math.random() - 0.5) * 100;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: 0x00ff88,
    size: 0.1,
    transparent: true,
    opacity: 0.6
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Enhanced interaction system variables
let nearReadmePanel = null;
let nearMCPWall = false;
let currentInteractiveObject = null;

// Enhanced controls with new madness features!
const controls = {
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    canJump: false,
    chaos: false
};

const keys = {
    KeyW: 'moveForward',
    KeyS: 'moveBackward',
    KeyA: 'moveLeft',
    KeyD: 'moveRight',
    Space: 'chaos'
};

// Velocity for smooth movement
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

// Mouse controls
let mouseMovement = { x: 0, y: 0 };
let euler = new THREE.Euler(0, 0, 0, 'YXZ');
let pointerLocked = false;

// Current agent being interacted with
let currentAgent = null;
let nearAgent = null;
let dialogueOpen = false; // NEW: Unified state for any dialogue/panel
let activePanelType = null; // NEW: Tracks the type of open panel ('agent', 'readme', 'mcp')

// Starfield toggle setting
let starfieldEnabled = true;

function toggleStarfield()
{
    starfieldEnabled = !starfieldEnabled;
    particles.visible = starfieldEnabled;
    const btn = document.getElementById('starfieldToggleBtn');
    if (btn) btn.textContent = starfieldEnabled ? 'Disable Starfield' : 'Enable Starfield';
}

// Add a button to the DOM for toggling starfield
window.addEventListener('DOMContentLoaded', () =>
{
    const btn = document.createElement('button');
    btn.id = 'starfieldToggleBtn';
    btn.textContent = 'Disable Starfield';
    btn.style.position = 'fixed';
    btn.style.top = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = 9999;
    btn.style.background = '#111';
    btn.style.color = '#0f0';
    btn.style.border = '2px solid #0f0';
    btn.style.borderRadius = '8px';
    btn.style.padding = '8px 16px';
    btn.style.cursor = 'pointer';
    btn.onclick = toggleStarfield;
    document.body.appendChild(btn);
});

// 🎪 NEW MADNESS: Enhanced interaction checking
function checkInteractions()
{
    const playerPosition = camera.position;

    // Check for nearby workstations with README panels
    nearReadmePanel = null;
    workstations.forEach(station =>
    {
        const distance = playerPosition.distanceTo(station.position);
        if (distance < 4)
        {
            nearReadmePanel = station;
        }
    });

    // Check for MCP debugging wall
    const mcpDistance = playerPosition.distanceTo(mcpWall.position);
    nearMCPWall = mcpDistance < 6;

    // Check for nearby agents (existing functionality)
    nearAgent = null;
    agents.forEach(agent =>
    {
        const distance = playerPosition.distanceTo(agent.position);
        if (distance < 3)
        {
            nearAgent = agent;
        }
    });

    // Update interaction prompt
    updateInteractionPrompt();
}

// 🚀 NEW MADNESS: Enhanced interaction prompt system
function updateInteractionPrompt()
{
    const prompt = document.getElementById('interaction-prompt');

    if (nearAgent && !document.getElementById('dialogue-box').style.display === 'block')
    {
        prompt.textContent = `Press E to interface with ${nearAgent.userData.name}`;
        prompt.style.display = 'block';
    } else if (nearReadmePanel)
    {
        prompt.textContent = `Press E to view ${nearReadmePanel.userData.projectName} README details`;
        prompt.style.display = 'block';
    } else if (nearMCPWall)
    {
        prompt.textContent = 'Press M to access MCP Debugging Toolkit';
        prompt.style.display = 'block';
    } else
    {
        prompt.style.display = 'none';
    }
}

// 🛠️ NEW MADNESS: Show README details
function showReadmeDetails(station)
{
    const readmeData = station.userData.readmeData;
    if (!readmeData) return;
    dialogueOpen = true; // Halt movement
    activePanelType = 'readme'; // Set panel type

    // Create enhanced dialogue for README
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueName = document.getElementById('dialogue-name');
    const dialogueContent = document.getElementById('dialogue-content');
    const dialogueOptions = document.getElementById('dialogue-options');

    dialogueName.innerHTML = `📖 ${readmeData.title} - Project Documentation`;

    dialogueContent.innerHTML = `
        <div style="color: #00ff88; margin-bottom: 15px;">
            <strong>Description:</strong><br>
            ${readmeData.description}
        </div>
        
        <div style="color: #0088ff; margin-bottom: 15px;">
            <strong>🚀 Key Features:</strong><br>
            ${readmeData.features.map(feature => `• ${feature}`).join('<br>')}
        </div>
        
        <div style="color: #ff6b35; margin-bottom: 15px;">
            <strong>Current Status:</strong> ${readmeData.status}
        </div>
        
        <div style="color: #ffff00; font-size: 12px; text-align: center; margin-top: 20px;">
            💡 This project is part of the Madness Interactive ecosystem!
        </div>
    `;

    dialogueOptions.innerHTML = `
        <div class="dialogue-option" onclick="closeDialogue()">
            🔙 Back to Workshop
        </div>
        <div class="dialogue-option" onclick="exploreProject('${station.userData.projectName}')">
            🔍 Explore Project Structure
        </div>
        <div class="dialogue-option" onclick="viewProjectTodos('${station.userData.projectName}')">
            📝 View Project Todos
        </div>
    `;

    dialogueBox.style.display = 'block';
}

// 🔧 NEW MADNESS: Show MCP debugging interface
function showMCPDebugging()
{
    dialogueOpen = true; // Halt movement
    activePanelType = 'mcp'; // Set panel type
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueName = document.getElementById('dialogue-name');
    const dialogueContent = document.getElementById('dialogue-content');
    const dialogueOptions = document.getElementById('dialogue-options');

    dialogueName.innerHTML = '🛠️ MCP Debugging Toolkit - Madness Control Protocol';

    dialogueContent.innerHTML = `
        <div style="color: #00ff88; margin-bottom: 15px;">
            <strong>🚀 Welcome to the MCP Debugging Toolkit!</strong><br>
            The nerve center of our agent swarm coordination system.
        </div>
        
        <div style="color: #0088ff; margin-bottom: 10px;">
            <strong>Available MCP Tools:</strong>
        </div>

        ${Object.entries(mcpToolkit).map(([category, tools]) => `
            <div style="margin-bottom: 15px;">
                <div style="color: #ff6b35; font-weight: bold;">🔧 ${category}:</div>
                ${tools.map(tool => `<div style="color: #00ff00; margin-left: 20px; font-size: 12px;">• ${tool}</div>`).join('')}
            </div>
        `).join('')}
        
        <div style="color: #ffff00; font-size: 12px; text-align: center; margin-top: 15px;">
            💡 Real-time MCP integration active - all agents connected!
        </div>
    `;

    dialogueOptions.innerHTML = `
        <div class="dialogue-option" onclick="closeDialogue()">
            🔙 Back to Workshop
        </div>
        <div class="dialogue-option" onclick="runMCPCommand('list_projects')">
            📂 List All Projects
        </div>
        <div class="dialogue-option" onclick="runMCPCommand('check_todos')">
            📝 Check Active Todos
        </div>
        <div class="dialogue-option" onclick="runMCPCommand('system_status')">
            ⚡ System Status Check
        </div>
    `;

    dialogueBox.style.display = 'block';
}

// 💡 NEW MADNESS: Project exploration functions
function exploreProject(projectName)
{
    createFloatingText(`🔍 Exploring ${projectName}...`, camera.position);
    console.log(`Exploring project: ${projectName}`);
    // TODO: Could integrate with actual file browsing
}

function viewProjectTodos(projectName)
{
    createFloatingText(`📝 Loading ${projectName} todos...`, camera.position);
    console.log(`Viewing todos for: ${projectName}`);
    // TODO: Integrate with actual MCP todo system
}

function runMCPCommand(command)
{
    createFloatingText(`🛠️ Running MCP: ${command}`, camera.position);
    console.log(`MCP Command: ${command}`);
    // TODO: Integrate with actual MCP system
}

// Floating text effect
function createFloatingText(text, worldPos)
{
    const div = document.createElement('div');
    div.className = 'floating-text'; // Use a class for styling
    div.textContent = text;
    document.body.appendChild(div);

    if (worldPos && typeof worldPos.clone === 'function')
    {
        // Positioned in 3D space
        const screenPos = worldPos.clone();
        screenPos.project(camera);
        const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;
        div.style.left = x + 'px';
        div.style.top = y + 'px';
        div.style.transform = 'translate(-50%, -50%)'; // Center on the coordinate
    } else
    {
        // Default to center of screen if no worldPos
        console.warn(`[createFloatingText] No worldPos provided for "${text}". Defaulting to screen center.`);
        div.style.left = '50%';
        div.style.top = '50%';
        div.style.transform = 'translate(-50%, -50%)';
    }

    // Animate and remove
    setTimeout(() =>
    {
        div.style.opacity = '0';
        div.style.transform += ' translateY(-20px)';
    }, 1800);
    setTimeout(() => div.remove(), 2000);
}

// 🚀 MADNESS ENHANCED: Animation loop with interactive features
function animate(currentTime)
{
    requestAnimationFrame(animate);

    const time = currentTime * 0.001;

    // 🎪 NEW: Enhanced movement system (FIXED!)
    if (!dialogueOpen) // Use unified dialogue state to halt movement
    {
        // Reset direction
        direction.set(0, 0, 0);

        // Calculate movement direction relative to camera rotation
        if (controls.moveForward) direction.z -= 1;
        if (controls.moveBackward) direction.z += 1;
        if (controls.moveLeft) direction.x -= 1;
        if (controls.moveRight) direction.x += 1;

        // Apply camera rotation to movement direction
        if (direction.length() > 0)
        {
            direction.normalize();
            direction.applyQuaternion(camera.quaternion);
            direction.y = 0; // Keep movement horizontal
            direction.normalize();

            // Apply movement with proper speed
            velocity.add(direction.multiplyScalar(0.02));
        }

        // Apply movement to camera
        camera.position.add(velocity);
        velocity.multiplyScalar(0.85); // Friction

        // Keep camera above ground
        camera.position.y = Math.max(1.6, camera.position.y);

        // Keep player in reasonable bounds
        camera.position.x = Math.max(-25, Math.min(25, camera.position.x));
        camera.position.z = Math.max(-25, Math.min(25, camera.position.z));
    }

    // 🚀 NEW: Check for interactive objects
    checkInteractions();

    // Animate particles
    const positions = particles.geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3)
    {
        // Check for NaN and reset if needed
        if (isNaN(positions[i]) || isNaN(positions[i + 1]) || isNaN(positions[i + 2]))
        {
            positions[i] = (Math.random() - 0.5) * 100;
            positions[i + 1] = Math.random() * 20;
            positions[i + 2] = (Math.random() - 0.5) * 100;
        }
        positions[i + 1] += Math.sin(time + positions[i] * 0.01) * 0.02;
        if (positions[i + 1] > 20) positions[i + 1] = 0;
    }
    particles.geometry.attributes.position.needsUpdate = true;

    // Animate holographic displays
    for (let i = 0; i < scene.children.length; i++)
    {
        const child = scene.children[i];
        if (child.material && child.material.color && child.material.transparent)
        {
            child.material.opacity = 0.6 + Math.sin(time * 2) * 0.2;
        }
    }

    // Animate workstation data streams
    workstations.forEach(station =>
    {
        if (station.userData.streams)
        {
            station.userData.streams.forEach(stream =>
            {
                stream.position.y = stream.userData.originalY +
                    Math.sin(time * stream.userData.speed + stream.userData.offset) * 0.5;
                stream.rotation.y += 0.02;
            });
        }
    });

    // 🤖 Enhanced agent animation
    agents.forEach(agent =>
    {
        // Agent movement AI with enhanced behaviors
        if (!agent.userData.isDancing && Math.random() < 0.003)
        {
            const radius = 5;
            agent.userData.targetPosition.set(
                agent.userData.initialPosition.x + (Math.random() - 0.5) * radius,
                0,
                agent.userData.initialPosition.z + (Math.random() - 0.5) * radius
            );
            agent.userData.moveTimer = 0;
        }

        // Smooth movement
        const targetDistance = agent.position.distanceTo(agent.userData.targetPosition);
        if (targetDistance > 0.1)
        {
            const direction = agent.userData.targetPosition.clone().sub(agent.position).normalize();
            agent.position.add(direction.multiplyScalar(0.01));
            agent.lookAt(agent.userData.targetPosition.x, agent.position.y, agent.userData.targetPosition.z);
        }

        // 🎵 Chaos dance mode
        if (controls.chaos || agent.userData.isDancing)
        {
            agent.position.y = 0.2 + Math.sin(time * 5 + agent.position.x) * 0.3;
            agent.rotation.y += 0.1;
            if (agent.userData.halo)
            {
                agent.userData.halo.rotation.z += 0.2;
                agent.userData.halo.material.opacity = 0.8 + Math.sin(time * 8) * 0.2;
            }
        }

        // Arm movement
        if (agent.userData.leftArm && agent.userData.rightArm)
        {
            agent.userData.leftArm.rotation.z = Math.sin(time * 2) * 0.3;
            agent.userData.rightArm.rotation.z = -Math.sin(time * 2) * 0.3;
        }

        // Halo glow animation
        if (agent.userData.halo)
        {
            agent.userData.halo.material.opacity = 0.6 + Math.sin(time * 3) * 0.3;
        }

        // Status-based color changes
        if (agent.userData.isActive)
        {
            const colorShift = Math.sin(time * 4) * 0.1;
            agent.children[0].material.emissive.setRGB(colorShift, colorShift, colorShift);
        }
    });

    // 🌟 Enhanced MCP wall animation
    if (mcpWall)
    {
        // Subtle wall breathing effect
        mcpWall.scale.setScalar(1 + Math.sin(time * 0.5) * 0.02);

        // Border glow pulsing
        if (mcpWall.children[2])
        { // Border element
            const glowIntensity = 0.5 + Math.sin(time * 2) * 0.3;
            mcpWall.children[2].material.opacity = glowIntensity;
        }
    }

    // 📖 README panel subtle animations
    workstations.forEach(station =>
    {
        station.children.forEach(child =>
        {
            if (child.userData && child.userData.type === 'readme-panel')
            {
                child.rotation.y = -Math.PI / 6 + Math.sin(time * 0.5) * 0.05;

                // Keep panels floating above desk surface (desk is at 0.75 in local coords)
                const baseHeight = 1.5; // Base position well above desk
                const floatAnimation = Math.sin(time * 1.5) * 0.03; // Small float effect
                const minHeight = 1.0; // Minimum height above desk surface (0.75)

                // Calculate final position ensuring it stays above desk
                const finalHeight = baseHeight + floatAnimation;
                child.position.y = Math.max(minHeight, finalHeight);
            }
        });
    });

    renderer.render(scene, camera);
}

// Start the madness!
animate();

// Window resize handler
window.addEventListener('resize', () =>
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 🎪 Welcome message when the madness begins!
setTimeout(() =>
{
    createFloatingText('🚀 Welcome to SwarmDesk Interactive Workshop! 🚀', { x: 0, y: 5, z: 0 });
    console.log(`
    🎮 SWARMDESK ENHANCED CONTROLS:
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🎯 WASD - Move around the workshop
    🖱️  Mouse - Look around (click to lock pointer)
    ⌨️  E - Interface with agents
    📖 R - View project README details  
    🛠️  M - Access MCP debugging toolkit
    🎵 SPACE - Toggle chaos dance mode
    🚪 ESC - Close dialogues/unlock pointer
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    💡 Explore, interact, and embrace the madness!
    `);
}, 2000);

// 🎪 NEW MADNESS: Enhanced Event Listeners with Interactive Controls
document.addEventListener('keydown', (e) =>
{
    const customQuestionInput = document.getElementById('custom-question-input');

    if (document.activeElement === customQuestionInput)
    {
        if (e.key === 'Escape')
        {
            closeDialogue();
        }
        return;
    }

    // Handle movement controls
    if (keys[e.code])
    {
        controls[keys[e.code]] = true;
    }

    // Unified interaction controls with toggle functionality
    if (e.key.toLowerCase() === 'e')
    {
        e.preventDefault();
        const targetType = nearAgent ? 'agent' : nearReadmePanel ? 'readme' : null;

        if (dialogueOpen)
        {
            if (activePanelType === targetType && targetType !== null)
            {
                closeDialogue();
            }
        } else if (targetType)
        {
            if (targetType === 'agent')
            {
                openDialogue(nearAgent);
            } else if (targetType === 'readme')
            {
                showReadmeDetails(nearReadmePanel);
            }
        }
    }

    if (e.key.toLowerCase() === 'm')
    {
        if (nearMCPWall)
        {
            e.preventDefault();
            const targetType = 'mcp';
            if (dialogueOpen)
            {
                if (activePanelType === targetType)
                {
                    closeDialogue();
                }
            } else
            {
                showMCPDebugging();
            }
        }
    }

    if (e.key === ' ')
    {
        e.preventDefault();
        controls.chaos = !controls.chaos;
        createFloatingText('🎵 CHAOS DANCE MODE! 🎵', camera.position);
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key))
    {
        e.preventDefault();
        handleArrowKeys(e.key);
    }
});

document.addEventListener('keyup', (e) =>
{
    const customQuestionInput = document.getElementById('custom-question-input');
    if (document.activeElement === customQuestionInput) return;

    if (keys[e.code])
    {
        controls[keys[e.code]] = false;
    }
});

document.addEventListener('keydown', (e) =>
{
    if (e.key === 'Escape')
    {
        closeDialogue();
        if (document.pointerLockElement === renderer.domElement)
        {
            document.exitPointerLock();
        }
    }
});

// Enhanced mouse controls
document.addEventListener('mousemove', (e) =>
{
    if (document.pointerLockElement === renderer.domElement && !dialogueOpen)
    { // Check unified state
        const sensitivity = 0.002;

        euler.setFromQuaternion(camera.quaternion);
        euler.y -= e.movementX * sensitivity;
        euler.x -= e.movementY * sensitivity;

        // Clamp vertical rotation to prevent flipping
        euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));

        camera.quaternion.setFromEuler(euler);
    }
});

renderer.domElement.addEventListener('click', () =>
{
    if (!currentAgent)
    {
        renderer.domElement.requestPointerLock();
        pointerLocked = true;
    }
});

// Arrow key camera controls for backup/alternative control
function handleArrowKeys(key)
{
    const rotationSpeed = 0.1; // Made more responsive
    const currentEuler = new THREE.Euler().setFromQuaternion(camera.quaternion);

    switch (key)
    {
        case 'ArrowLeft':
            currentEuler.y += rotationSpeed;
            break;
        case 'ArrowRight':
            currentEuler.y -= rotationSpeed;
            break;
        case 'ArrowUp':
            currentEuler.x += rotationSpeed;
            currentEuler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, currentEuler.x));
            break;
        case 'ArrowDown':
            currentEuler.x -= rotationSpeed;
            currentEuler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, currentEuler.x));
            break;
    }

    camera.quaternion.setFromEuler(currentEuler);
}

// Dialogue system functions (preserved and enhanced)
function openDialogue(agent)
{
    currentAgent = agent;
    dialogueOpen = true; // Halt movement
    activePanelType = 'agent'; // Set panel type
    const dialogueBox = document.getElementById('dialogue-box');
    const dialogueName = document.getElementById('dialogue-name');
    const dialogueContent = document.getElementById('dialogue-content');

    dialogueBox.style.display = 'block';
    dialogueName.textContent = `${agent.userData.name} - ${agent.userData.role}`;

    if (document.pointerLockElement === renderer.domElement)
    {
        document.exitPointerLock();
        pointerLocked = false;
    }

    const greetings = {
        'orchestrator': [
            `Welcome to the Madness! I'm ${agent.userData.name}, orchestrating this beautiful chaos. What madness shall we unleash today?`,
            `Ah, another soul brave enough to enter the SwarmDesk! I'm ${agent.userData.name}. Ready to tinker with reality?`
        ],
        'git': [
            `Git Assistant reporting for duty! I manage all code repositories with quantum precision. How can I help shepherd your code?`,
            `Version control is my domain. I'm the Git Assistant - every commit tells a story. What's your story?`
        ],
        'browser': [
            `Browser Agent here! I crawl the web like a digital spider. Need me to navigate somewhere or automate web tasks?`,
            `The web is my playground! Browser Agent at your service. Where shall we surf today?`
        ],
        'haiku': [
            `Digital verses flow / Through circuits of creativity / Haiku Bot speaks now`,
            `In ones and zeros / I find poetry and meaning / How may I verse you?`
        ],
        'greeter': [
            `Hello! I'm your friendly Greeter Agent. I help route conversations and connect you with the right specialist. What brings you here?`,
            `Welcome to SwarmDesk! I'm the Greeter - think of me as your guide through our agent ecosystem. How can I help?`
        ],
        'project': [
            `Project Manager online! I architect systems and manage project lifecycles. Ready to build something amazing?`,
            `Systems, structures, and solutions - that's my expertise. Project Manager here. What shall we create?`
        ]
    };

    const agentGreetings = greetings[agent.userData.agentType] || greetings['greeter'];
    const greeting = agentGreetings[Math.floor(Math.random() * agentGreetings.length)];

    dialogueContent.innerHTML = `<p><strong>${agent.userData.name}:</strong> ${greeting}</p>`;

    generateDialogueOptions(agent);

    document.getElementById('custom-question-input').value = '';
    setTimeout(() =>
    {
        document.getElementById('custom-question-input').focus();
    }, 100);
}

function generateDialogueOptions(agent)
{
    const dialogueOptions = document.getElementById('dialogue-options');
    const options = {
        'orchestrator': [
            "What's the current state of all projects?",
            "Show me the agent network topology",
            "What's the most chaotic thing happening right now?",
            "I need help orchestrating a complex task"
        ],
        'git': [
            "Check the status of all repositories",
            "Commit my current changes",
            "Create a new branch for a feature",
            "Show me the git history"
        ],
        'browser': [
            "Navigate to a specific website",
            "Automate a web task",
            "Extract data from a webpage",
            "Monitor a site for changes"
        ],
        'haiku': [
            "Write a haiku about our current project",
            "Create documentation in poetic form",
            "Compose a verse about code",
            "Generate creative content"
        ],
        'greeter': [
            "Who should I talk to about X?",
            "What agents are available?",
            "Route me to the right specialist",
            "Help me understand the system"
        ],
        'project': [
            "Initialize a new project",
            "Show project dependencies",
            "Manage project lifecycle",
            "Architect a new system"
        ]
    };

    const agentOptions = options[agent.userData.agentType] || options['greeter'];

    dialogueOptions.innerHTML = '';
    agentOptions.forEach(option =>
    {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'dialogue-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(option);
        dialogueOptions.appendChild(optionDiv);
    });
}

function selectOption(option)
{
    if (!currentAgent) return;

    const dialogueContent = document.getElementById('dialogue-content');
    dialogueContent.innerHTML += `<p><strong>You:</strong> ${option}</p>`;
    dialogueContent.innerHTML += `<p><strong>${currentAgent.userData.name}:</strong> <span class="loading"></span></p>`;
    dialogueContent.scrollTop = dialogueContent.scrollHeight;

    // Simulate agent response
    setTimeout(() =>
    {
        const response = generateAgentResponse(currentAgent, option);
        dialogueContent.innerHTML = dialogueContent.innerHTML.replace(
            '<span class="loading"></span>',
            response
        );
        dialogueContent.scrollTop = dialogueContent.scrollHeight;

        currentAgent.userData.conversations.push({
            user: option,
            response: response
        });

        // Update agent status
        updateAgentStatus(currentAgent.userData.agentType, 'PROCESSING');

        // Generate new options
        generateDialogueOptions(currentAgent);
    }, 1000 + Math.random() * 2000);
}

function generateAgentResponse(agent, input)
{
    const responses = {
        'orchestrator': [
            `Excellent! Let me orchestrate that for you. The swarm is now reconfiguring to handle: "${input}". Watch the magic happen!`,
            `Ah, a delightfully chaotic request! I'm dispatching the appropriate agents and systems. The madness is in motion!`,
            `Perfect! I love when the system gets to flex its capabilities. Consider it done - with a touch of beautiful chaos!`
        ],
        'git': [
            `Git command executed successfully! Repository status: Clean. All changes have been processed with quantum precision.`,
            `Code shepherding complete! Your request has been handled with version control excellence. The git gods are pleased.`,
            `Repository updated! I've managed your version control needs with the precision of a Swiss chronometer.`
        ],
        'browser': [
            `Web navigation complete! I've crawled to your destination and executed the requested automation. The digital web responds!`,
            `Browser task accomplished! I've surfed the web waves and brought back the data you needed. Navigation successful!`,
            `Web automation finished! The browser has been tamed and your web task completed with spider-like efficiency.`
        ],
        'haiku': [
            `Code flows like water / Through the digital garden / Beauty in logic`,
            `Your request received / In verse and code I respond / Creativity blooms`,
            `Tasks become poems / Functions dance in rhythm / Art meets engineering`
        ],
        'greeter': [
            `I've routed your request to the appropriate specialist! They'll be in touch shortly. Is there anything else I can help connect?`,
            `Connection established! The right agent is now handling your request. I'm here if you need further routing assistance.`,
            `Perfectly routed! Your request is now in the capable hands of our specialized agent. How else can I guide you?`
        ],
        'project': [
            `Project architecture updated! I've structured the system components to handle your requirements. The foundation is solid!`,
            `System design complete! Your project has been architected with scalability and efficiency in mind. Ready to build!`,
            `Project lifecycle managed! I've organized the components and dependencies for optimal development flow. Let's create!`
        ]
    };

    const agentResponses = responses[agent.userData.agentType] || responses['greeter'];
    return agentResponses[Math.floor(Math.random() * agentResponses.length)];
}

function closeDialogue()
{
    const dialogueBox = document.getElementById('dialogue-box');
    dialogueBox.style.display = 'none';
    currentAgent = null;
    dialogueOpen = false; // Re-enable movement
    activePanelType = null; // Clear panel type
}

function updateAgentStatus(agentType, status)
{
    const statusList = document.getElementById('agent-status-list');
    const statusItems = statusList.querySelectorAll('.status-item');

    statusItems.forEach(item =>
    {
        const span = item.querySelector('span');
        if (span && span.textContent.toLowerCase().includes(agentType))
        {
            const statusSpan = item.querySelector('span:last-child');
            statusSpan.textContent = status;
            statusSpan.className = status === 'ACTIVE' ? 'status-active' :
                status === 'PROCESSING' ? 'status-active' :
                    status === 'IDLE' ? 'status-idle' : 'status-error';
        }
    });
}

// Custom question handler
document.getElementById('custom-question-submit').addEventListener('click', () =>
{
    const input = document.getElementById('custom-question-input');
    const customQuestion = input.value.trim();
    if (customQuestion && currentAgent)
    {
        selectOption(customQuestion);
        input.value = '';
    }
});

document.getElementById('custom-question-input').addEventListener('keypress', (e) =>
{
    if (e.key === 'Enter')
    {
        const customQuestion = e.target.value.trim();
        if (customQuestion && currentAgent)
        {
            selectOption(customQuestion);
            e.target.value = '';
        }
    }
});
