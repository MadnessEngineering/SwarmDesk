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
    station.userData = { projectName, agentType, streams: [] };

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

// Player controls
const player = {
    position: new THREE.Vector3(0, 1.6, 8),
    velocity: new THREE.Vector3(0, 0, 0),
    speed: 0.15,
    isDancing: false
};

const keys = {};
let mouseX = 0;
let nearbyAgent = null;
let currentAgent = null;

// Event listeners
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

    keys[e.key.toLowerCase()] = true;
    keys[e.key] = true;

    if (e.key.toLowerCase() === 'e' && nearbyAgent && !currentAgent)
    {
        e.preventDefault();
        openDialogue(nearbyAgent);
    }

    if (e.key === ' ')
    {
        e.preventDefault();
        player.isDancing = !player.isDancing;
        createFloatingText('🎵 CHAOS DANCE MODE! 🎵', player.position);
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key))
    {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) =>
{
    const customQuestionInput = document.getElementById('custom-question-input');
    if (document.activeElement === customQuestionInput) return;

    keys[e.key.toLowerCase()] = false;
    keys[e.key] = false;
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

// Mouse controls
document.addEventListener('mousemove', (e) =>
{
    if (document.pointerLockElement === renderer.domElement && !currentAgent)
    {
        mouseX += e.movementX * 0.002;
    }
});

renderer.domElement.addEventListener('click', () =>
{
    if (!currentAgent)
    {
        renderer.domElement.requestPointerLock();
    }
});

// Dialogue system
const dialogueBox = document.getElementById('dialogue-box');
const dialogueName = document.getElementById('dialogue-name');
const dialogueContent = document.getElementById('dialogue-content');
const dialogueOptions = document.getElementById('dialogue-options');
const interactionPrompt = document.getElementById('interaction-prompt');

function openDialogue(agent)
{
    currentAgent = agent;
    dialogueBox.style.display = 'block';
    dialogueName.textContent = `${agent.userData.name} - ${agent.userData.role}`;

    if (document.pointerLockElement === renderer.domElement)
    {
        document.exitPointerLock();
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
    dialogueBox.style.display = 'none';
    currentAgent = null;
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

// Floating text effect
function createFloatingText(text, worldPos)
{
    const screenPos = worldPos.clone();
    screenPos.project(camera);

    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

    const div = document.createElement('div');
    div.className = 'floating-text';
    div.textContent = text;
    div.style.left = x + 'px';
    div.style.top = y + 'px';
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2000);
}

// Animation loop
let lastTime = 0;

function animate(currentTime)
{
    requestAnimationFrame(animate);

    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    // Update player movement
    player.velocity.set(0, 0, 0);

    if (!player.isDancing && !currentAgent)
    {
        if (keys['w']) player.velocity.z = player.speed;
        if (keys['s']) player.velocity.z = -player.speed;
        if (keys['a']) player.velocity.x = -player.speed;
        if (keys['d']) player.velocity.x = player.speed;
    }

    // Arrow key camera controls
    const lookSpeed = 0.05;
    if (!currentAgent)
    {
        if (keys['ArrowLeft']) mouseX += lookSpeed;
        if (keys['ArrowRight']) mouseX -= lookSpeed;
    }

    // Update camera
    if (!player.isDancing && !currentAgent)
    {
        camera.rotation.y = mouseX;
        camera.rotation.x = 0;
    }

    // Apply movement
    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    player.position.add(forward.multiplyScalar(player.velocity.z));
    player.position.add(right.multiplyScalar(player.velocity.x));

    // Keep player in bounds
    player.position.x = Math.max(-25, Math.min(25, player.position.x));
    player.position.z = Math.max(-25, Math.min(25, player.position.z));

    // Dancing animation
    if (player.isDancing && !currentAgent)
    {
        camera.position.y = player.position.y + Math.sin(Date.now() * 0.01) * 0.3;
        camera.rotation.z = Math.sin(Date.now() * 0.015) * 0.1;
        camera.rotation.y = mouseX + Math.sin(Date.now() * 0.008) * 0.2;
    } else
    {
        camera.position.copy(player.position);
        camera.rotation.z = 0;
        if (!currentAgent)
        {
            camera.rotation.y = mouseX;
        }
    }

    // Update agents
    agents.forEach(agent =>
    {
        // Agent movement AI
        if (agent !== currentAgent)
        {
            agent.userData.moveTimer -= deltaTime;

            if (agent.userData.moveTimer <= 0)
            {
                const angle = Math.random() * Math.PI * 2;
                const distance = 2 + Math.random() * 4;
                agent.userData.targetPosition = new THREE.Vector3(
                    agent.userData.initialPosition.x + Math.cos(angle) * distance,
                    0,
                    agent.userData.initialPosition.z + Math.sin(angle) * distance
                );

                agent.userData.targetPosition.x = Math.max(-20, Math.min(20, agent.userData.targetPosition.x));
                agent.userData.targetPosition.z = Math.max(-20, Math.min(20, agent.userData.targetPosition.z));

                agent.userData.moveTimer = 3 + Math.random() * 4;
            }

            // Move towards target
            const direction = new THREE.Vector3().subVectors(agent.userData.targetPosition, agent.position);
            direction.y = 0;
            const distance = direction.length();

            if (distance > 0.1)
            {
                direction.normalize();
                agent.position.add(direction.multiplyScalar(0.02));
                agent.lookAt(agent.userData.targetPosition);
                agent.rotation.x = 0;
                agent.rotation.z = 0;
            }
        }

        // Agent glow animation
        if (agent.userData.halo)
        {
            agent.userData.halo.rotation.z += 0.02;
            agent.userData.halo.material.opacity = 0.4 + Math.sin(Date.now() * 0.003) * 0.2;
        }

        // Random agent activities
        if (Math.random() < 0.001)
        {
            createFloatingText('💡', agent.position);
            updateAgentStatus(agent.userData.agentType, 'ACTIVE');
        }
    });

    // Update workstation data streams
    workstations.forEach(station =>
    {
        station.userData.streams.forEach(stream =>
        {
            stream.position.y = stream.userData.originalY +
                Math.sin(Date.now() * stream.userData.speed + stream.userData.offset) * 0.5;
        });
    });

    // Update particles
    particles.rotation.y += 0.001;

    // Check for nearby agents
    nearbyAgent = null;
    let minDistance = Infinity;

    agents.forEach(agent =>
    {
        const distance = player.position.distanceTo(agent.position);
        if (distance < 3 && distance < minDistance)
        {
            minDistance = distance;
            nearbyAgent = agent;
        }
    });

    // Show/hide interaction prompt
    if (nearbyAgent && !currentAgent)
    {
        interactionPrompt.style.display = 'block';
        interactionPrompt.textContent = `Press E to interface with ${nearbyAgent.userData.name}`;
    } else
    {
        interactionPrompt.style.display = 'none';
    }

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () =>
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start the animation
animate(0);

// Initial status update
setTimeout(() =>
{
    updateAgentStatus('git', 'ACTIVE');
    updateAgentStatus('haiku', 'COMPOSING');
    updateAgentStatus('greeter', 'WELCOMING');
}, 2000);
