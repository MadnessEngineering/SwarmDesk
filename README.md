# 🚀 SwarmDesk - Madness Interactive Agent Command Center

**A gamified 3D interface for controlling AI agent swarms through an immersive cyberpunk office environment.**

![SwarmDesk Banner](https://img.shields.io/badge/Status-Mad%20Science%20In%20Progress-orange?style=for-the-badge&logo=experiment)

## 🎮 What is SwarmDesk?

SwarmDesk transforms the complex task of AI agent orchestration into an engaging, game-like experience. Navigate through a cyberpunk office environment where each agent is represented as a unique character, and each project appears as an interactive workstation with real-time data streams.

### 🤖 Meet the Swarm

**Agents in the SwarmDesk Universe:**

- **D.Edens** (Mad Tinkerer) - The orchestrator of beautiful chaos
- **Git Assistant** (Code Shepherd) - Manages repositories with quantum precision  
- **Browser Agent** (Web Crawler) - Automates web tasks like a digital spider
- **Haiku Bot** (Digital Poet) - Creates documentation in verse form
- **Greeter** (Interface Guide) - Routes conversations and connects specialists
- **Project Manager** (System Architect) - Orchestrates project lifecycles

### 💻 Project Workstations

Each desk computer represents a different Madness Interactive project:

- **EventGhost** - Automation and macro system
- **DVTTestKit** - Testing and validation tools
- **Inventorium** - Main project management hub
- **Omnispindle** - CLI bridge and utilities
- **Swarmonomicon** - The agent framework core
- **MadnessCore** - System architecture foundation

## 🎯 Features

### 🎪 Immersive Environment

- **3D Cyberpunk Office** with neon lighting and holographic displays
- **Real-time Particles** and data stream animations
- **Agent Movement AI** with unique personalities and behaviors
- **Dynamic Status Display** showing real-time agent states

### 🎮 Game-like Controls

- **WASD Movement** - Navigate the office like a first-person game
- **Mouse/Arrow Keys** - Look around the environment
- **🚀 E to Interact** - Interface directly with agents OR open Project Navigator (when not near agents)
- **🎮 Standardized Controls** - Consistent mouse sensitivity (0.002) and movement physics across all environments
- **Space for Chaos Dance** - Enter dance mode for fun
- **ESC to Disconnect** - Exit interactions or release pointer lock
- **🔧 Smart Fallbacks** - Legacy controls automatically engage if standardized system unavailable

### 💬 Intelligent Dialogue System

- **Context-Aware Conversations** - Each agent has unique personality and responses
- **Custom Commands** - Type direct instructions to agents
- **Pre-built Options** - Quick access to common agent functions
- **Real-time Status Updates** - Watch agent status change as they work

### 🌐 Agent Specializations

#### 🔧 Git Assistant

- Check repository status
- Commit changes with AI-generated messages
- Create and manage branches
- View git history and logs

#### 🕷️ Browser Agent  

- Navigate to websites
- Automate web tasks
- Extract data from pages
- Monitor sites for changes

#### 🎨 Haiku Bot

- Generate creative documentation
- Write code-related poetry
- Create artistic content
- Compose technical haikus

#### 🎯 Project Manager

- Initialize new projects
- Show dependencies
- Manage lifecycles
- Architect systems

## 🚀 Getting Started

### Prerequisites

- Modern web browser with WebGL support
- Internet connection (for Three.js CDN)

### Installation

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd projects/common/Inventorium/SwarmDesk
   ```

2. **Serve the Files**

   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using any local web server
   ```

3. **Open in Browser**
   Navigate to `http://localhost:8000` and enter the madness!

### 🌐 Live Demo

Visit: `http://madnessinteractive.cc/SwarmDesk` (coming soon!)

## 🎮 How to Play

### Navigation

1. **Click to Enter** - Click on the screen to enable mouse controls
2. **Move Around** - Use WASD keys to walk through the office
3. **Look Around** - Move mouse or use arrow keys to rotate camera
4. **Find Agents** - Walk near any glowing agent character

### Interacting with Agents

1. **Approach an Agent** - Walk within 3 units of any agent
2. **See the Prompt** - "Press E to interface with [Agent Name]" will appear
3. **Press E** - Opens the dialogue interface
4. **Choose Options** - Click pre-built options or type custom commands
5. **Watch Magic Happen** - See real-time status updates and responses

### Command Examples

- **To Git Assistant**: "commit current changes" or "create branch feature/new-ui"
- **To Browser Agent**: "navigate to github.com" or "extract all links from this page"
- **To Haiku Bot**: "write a haiku about our project" or "create poetic documentation"
- **To Project Manager**: "initialize new project" or "show dependencies"

## 🔧 Technical Architecture

### Frontend Stack

- **Three.js** - 3D rendering and scene management
- **Vanilla JavaScript** - Core logic and interactions  
- **CSS3** - Cyberpunk styling and animations
- **HTML5** - Structure and layout

### 3D Environment

- **Procedural Office Layout** - Dynamically generated workstations
- **Real-time Lighting** - Neon and ambient lighting systems
- **Particle Systems** - Floating data particles and effects
- **Animation Systems** - Agent movement and interaction animations

### Agent Integration

- **Modular Agent System** - Each agent type has unique responses
- **Conversation Memory** - Agents remember previous interactions
- **Status Synchronization** - Real-time updates across the interface
- **Command Routing** - Intelligent delegation based on agent specializations

## 🎨 Customization

### Adding New Agents

```javascript
const newAgent = createAgent(
    'Agent Name', 
    'Agent Role', 
    x, z,           // Position
    0xff6600,       // Color
    'agent_type',   // Type
    'personality'   // Personality trait
);
```

### Adding New Projects

```javascript
const newStation = createWorkstation(
    x, z,              // Position  
    "Project Name",    // Display name
    "agent_type"       // Associated agent type
);
```

### Modifying Responses

Edit the `responses` object in `generateAgentResponse()` to customize agent personalities and capabilities.

## 🎪 The Latest Madness: Recent SwarmDesk Updates

### 🎮 Standardized Control System (4d0b898)
Because muscle memory shouldn't be a luxury, we've unified controls across the entire SwarmDesk universe:

- **SwarmDeskControls** - One control system to rule them all (with graceful fallbacks for the old-school crowd)
- **Consistent Physics** - Mouse sensitivity 0.002, movement speed 0.02 with 0.85 friction (no more "why does this feel different?")
- **Smart Camera Bounds** - Won't let you fly off into the digital void anymore
- **Memory Management** - Proper cleanup because memory leaks are the enemy of smooth experiences
- **5x More Consistent** - Between main SwarmDesk and project environments

### 🚀 Enhanced E Key Functionality (49df557)  
Your Swiss Army knife of interaction just got sharper:

- **Agent Priority** - Still talks to agents when you're close (because that's what you expect)
- **Project Navigator** - Opens project portal when no agents are nearby (context-aware intelligence)
- **Seamless Transitions** - Jump from 3D environment to project selection without cognitive whiplash

### 🔧 Panel System Improvements (da257f5 + earlier)
Toggle panels like a boss with improved hotkey handling:

- **Robust Toggle System** - F-key shortcuts that actually work consistently
- **MCP Server Connection** - Better integration with the broader Madness ecosystem
- **Visual Feedback** - Know what's happening when you press things

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch** (`git checkout -b feature/amazing-feature`)
3. **Commit Changes** (`git commit -m 'Add amazing feature'`)
4. **Push to Branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### 🎯 Future Enhancements

- [ ] **Real API Integration** - Connect to actual Swarmonomicon agents
- [ ] **Multiplayer Support** - Multiple users in the same office
- [ ] **VR/AR Support** - Immersive reality interfaces
- [ ] **Voice Commands** - Speak to agents naturally
- [ ] **Analytics Dashboard** - Visual project metrics and insights
- [ ] **Custom Office Layouts** - User-configurable environments

## 📜 License

This project is part of the Madness Interactive ecosystem. See the main repository for license details.

## 🎭 The Philosophy

> "In the beautiful chaos of creation, every line of code is a brushstroke, every agent a character in our digital story, and every interaction a moment of pure, wonderful madness."

*- D.Edens, Mad Tinkerer*

---

**Embrace the Madness. Control the Swarm. Create the Future.** 🚀🤖🎨
# Git hook permissions fixed - auto-deployment enabled! 🚀
