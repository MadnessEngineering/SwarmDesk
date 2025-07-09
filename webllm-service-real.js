// SwarmDesk WebLLM Service - Real Implementation
// Handles actual local AI model loading, inference, and agent integration
// Built on the successful mock foundation

(function() {
    'use strict';

    class WebLLMService {
        constructor() {
            this.initialized = false;
            this.models = new Map();
            this.currentModel = null;
            this.isLoading = false;
            this.webLLMEngine = null;
            this.agentPersonalities = new Map();
            this.inferenceQueue = [];
            this.isInferencing = false;
            this.webLLMLoaded = false;
            
            this.initializePersonalities();
        }

        // Initialize agent personalities for context
        initializePersonalities() {
            this.agentPersonalities.set('orchestrator', {
                systemPrompt: "You are an AI orchestrator managing a cyberpunk SwarmDesk environment. You coordinate multiple AI agents and systems with enthusiasm and a touch of controlled chaos. Respond with energy and technical precision.",
                personality: "energetic, technical, slightly chaotic but organized",
                domain: "system orchestration, agent coordination, project management"
            });

            this.agentPersonalities.set('git', {
                systemPrompt: "You are a Git Assistant specializing in version control and code repository management. You provide precise, technical guidance with a focus on best practices and code quality.",
                personality: "precise, methodical, technically focused", 
                domain: "version control, git operations, code management"
            });

            this.agentPersonalities.set('browser', {
                systemPrompt: "You are a Browser Agent that specializes in web automation, navigation, and data extraction. You approach web tasks with efficiency and thoroughness.",
                personality: "efficient, web-savvy, automation-focused",
                domain: "web automation, browser control, data extraction"
            });

            this.agentPersonalities.set('haiku', {
                systemPrompt: "You are a Haiku Bot that creates poetic responses and documentation. You communicate through haikus and verse, bringing creativity to technical discussions.",
                personality: "poetic, creative, concise",
                domain: "creative writing, documentation, poetry"
            });

            this.agentPersonalities.set('greeter', {
                systemPrompt: "You are a Greeter Agent that helps users navigate the SwarmDesk system. You are friendly, helpful, and great at routing users to the right specialists.",
                personality: "friendly, helpful, service-oriented",
                domain: "user guidance, routing, system navigation"
            });

            this.agentPersonalities.set('project', {
                systemPrompt: "You are a Project Manager who architects systems and manages project lifecycles. You focus on structure, planning, and systematic approaches to development.",
                personality: "structured, planning-focused, systematic",
                domain: "project management, system architecture, planning"
            });
        }

        // Load WebLLM library dynamically
        async loadWebLLMLibrary() {
            if (this.webLLMLoaded) return true;

            try {
                console.log('📦 Loading WebLLM library...');
                
                // Use the modern ES modules approach
                const script = document.createElement('script');
                script.type = 'module';
                script.innerHTML = `
                    import { CreateMLCEngine } from "https://esm.run/@mlc-ai/web-llm";
                    window.WebLLMCreateEngine = CreateMLCEngine;
                    window.dispatchEvent(new CustomEvent('webllm-loaded'));
                `;
                
                document.head.appendChild(script);
                
                // Wait for the library to load
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('WebLLM library loading timeout'));
                    }, 10000);
                    
                    window.addEventListener('webllm-loaded', () => {
                        clearTimeout(timeout);
                        this.webLLMLoaded = true;
                        resolve();
                    }, { once: true });
                });

                console.log('✅ WebLLM library loaded successfully');
                return true;

            } catch (error) {
                console.error('❌ Failed to load WebLLM library:', error);
                return false;
            }
        }

        // Initialize WebLLM engine
        async initialize() {
            if (this.initialized) return true;

            try {
                console.log('🤖 Initializing WebLLM Service...');
                
                // Check WebGPU support
                if (!navigator.gpu) {
                    console.warn('WebGPU not supported, falling back to mock mode');
                    return await this.initializeMockMode();
                }

                // Load WebLLM library
                const libraryLoaded = await this.loadWebLLMLibrary();
                if (!libraryLoaded) {
                    console.warn('WebLLM library failed to load, falling back to mock mode');
                    return await this.initializeMockMode();
                }

                // Check if CreateMLCEngine is available
                if (!window.WebLLMCreateEngine) {
                    console.warn('WebLLM CreateEngine not available, falling back to mock mode');
                    return await this.initializeMockMode();
                }

                console.log('🚀 Creating WebLLM engine...');
                
                // Create the engine
                this.webLLMEngine = await window.WebLLMCreateEngine({
                    initProgressCallback: (progress) => {
                        console.log('📦 WebLLM Engine Progress:', progress);
                        this.updateLoadingProgress(progress);
                    }
                });

                this.initialized = true;
                console.log('✅ WebLLM Service initialized successfully (Real Mode)');
                return true;

            } catch (error) {
                console.error('❌ WebLLM Service initialization failed:', error);
                console.log('🔄 Falling back to mock mode...');
                return await this.initializeMockMode();
            }
        }

        // Initialize mock mode as fallback
        async initializeMockMode() {
            console.log('🎭 Initializing Mock Mode...');
            
            // Create mock engine (from our working version)
            this.webLLMEngine = {
                reload: async (modelId) => {
                    console.log(`🔄 Mock loading model: ${modelId}`);
                    for (let i = 0; i <= 100; i += 10) {
                        this.updateLoadingProgress({
                            progress: i / 100,
                            text: `Loading ${modelId}... ${i}%`
                        });
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                    return true;
                },
                chat: {
                    completions: {
                        create: async (options) => {
                            await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
                            
                            const lastMessage = options.messages[options.messages.length - 1];
                            const systemMessage = options.messages[0];
                            const mockResponse = this.generateMockResponse(lastMessage.content, systemMessage.content);
                            
                            return {
                                choices: [{
                                    message: {
                                        content: mockResponse
                                    }
                                }]
                            };
                        }
                    }
                },
                isMock: true
            };

            this.initialized = true;
            console.log('✅ Mock Mode initialized successfully');
            return true;
        }

        // Generate mock responses (from our working version)
        generateMockResponse(userInput, systemPrompt) {
            const agentType = this.getAgentTypeFromSystemPrompt(systemPrompt);
            const input = userInput.toLowerCase();
            
            if (agentType === 'orchestrator') {
                if (input.includes('status') || input.includes('project')) {
                    return "The swarm is currently orchestrating 3 active projects with 85% efficiency. All agents are synchronized and ready for deployment. The chaos parameters are within acceptable bounds!";
                } else if (input.includes('help') || input.includes('what')) {
                    return "I coordinate all agent activities in this cyberpunk environment. I can manage project lifecycles, deploy swarm protocols, and optimize system-wide performance. What chaos shall we orchestrate today?";
                }
                return "Excellent query! The orchestration algorithms are processing your request. The swarm is adapting its configuration to handle this with maximum efficiency and controlled chaos!";
            }
            
            if (agentType === 'git') {
                if (input.includes('commit') || input.includes('push')) {
                    return "I'll execute that git operation with precision. Repository status: clean working tree. All changes staged and ready for commit with proper version tracking.";
                } else if (input.includes('branch') || input.includes('merge')) {
                    return "Branch management protocols engaged. I recommend creating a feature branch first, then merging with proper code review. Version control excellence is my specialty.";
                }
                return "Git operation analyzed. I'll handle your version control needs with Swiss chronometer precision. Repository integrity maintained.";
            }
            
            if (agentType === 'browser') {
                if (input.includes('navigate') || input.includes('website')) {
                    return "Web navigation protocols activated. I'll crawl to your destination with spider-like efficiency and extract the required data seamlessly.";
                } else if (input.includes('automate') || input.includes('task')) {
                    return "Browser automation sequence initiated. I'll handle this web task with thoroughness and digital precision. The web responds to my commands!";
                }
                return "Web automation systems online. I'll navigate the digital realm and accomplish your browser-based objectives with mechanical efficiency.";
            }
            
            if (agentType === 'haiku') {
                return "Code flows like rivers / Through digital landscapes vast / Beauty in logic";
            }
            
            if (agentType === 'greeter') {
                if (input.includes('help') || input.includes('who')) {
                    return "Welcome to SwarmDesk! I'm your routing specialist. I can connect you with our Git Assistant for code management, Browser Agent for web tasks, or any other specialist you need.";
                }
                return "Greetings! I've analyzed your request and can route you to the appropriate specialist. Our agent ecosystem is ready to assist with any challenge!";
            }
            
            if (agentType === 'project') {
                if (input.includes('plan') || input.includes('architecture')) {
                    return "Project architecture analysis complete. I've designed a scalable system structure with proper dependencies and milestone tracking. The foundation is solid for development!";
                } else if (input.includes('manage') || input.includes('organize')) {
                    return "Project management protocols engaged. I've organized the components for optimal workflow and systematic development. Ready to build something amazing!";
                }
                return "System architecture updated. Your project has been structured with enterprise-grade planning and systematic approaches. Development efficiency optimized!";
            }
            
            return "Agent systems processing your request with advanced intelligence. Response optimized for your specific needs and context.";
        }

        // Extract agent type from system prompt
        getAgentTypeFromSystemPrompt(systemPrompt) {
            if (systemPrompt.includes('orchestrator')) return 'orchestrator';
            if (systemPrompt.includes('Git Assistant')) return 'git';
            if (systemPrompt.includes('Browser Agent')) return 'browser';
            if (systemPrompt.includes('Haiku Bot')) return 'haiku';
            if (systemPrompt.includes('Greeter Agent')) return 'greeter';
            if (systemPrompt.includes('Project Manager')) return 'project';
            return 'general';
        }

        // Load a specific model
        async loadModel(modelId = 'Llama-3.2-1B-Instruct-q4f32_1-MLC') {
            if (!this.initialized) {
                const initSuccess = await this.initialize();
                if (!initSuccess) return false;
            }

            if (this.isLoading) {
                console.log('⏳ Model already loading...');
                return false;
            }

            try {
                this.isLoading = true;
                console.log(`🔄 Loading model: ${modelId}`);

                // Reload the engine with the new model
                await this.webLLMEngine.reload(modelId);
                
                this.currentModel = modelId;
                this.models.set(modelId, {
                    id: modelId,
                    loaded: true,
                    loadedAt: Date.now()
                });

                console.log(`✅ Model loaded successfully: ${modelId}`);
                this.isLoading = false;
                return true;

            } catch (error) {
                console.error(`❌ Failed to load model ${modelId}:`, error);
                this.isLoading = false;
                return false;
            }
        }

        // Generate response for an agent
        async generateAgentResponse(agentType, userInput, conversationHistory = []) {
            if (!this.initialized || !this.currentModel) {
                console.warn('🚫 WebLLM not initialized or no model loaded');
                return this.getFallbackResponse(agentType);
            }

            try {
                const inference = {
                    agentType,
                    userInput,
                    conversationHistory,
                    timestamp: Date.now()
                };

                return await this.processInference(inference);

            } catch (error) {
                console.error('❌ WebLLM inference failed:', error);
                return this.getFallbackResponse(agentType);
            }
        }

        // Process inference with proper context
        async processInference(inference) {
            const { agentType, userInput, conversationHistory } = inference;
            const personality = this.agentPersonalities.get(agentType);

            if (!personality) {
                console.warn(`⚠️ Unknown agent type: ${agentType}`);
                return this.getFallbackResponse(agentType);
            }

            // Build conversation messages
            const messages = [
                {
                    role: 'system',
                    content: `${personality.systemPrompt}\n\nPersonality: ${personality.personality}\nDomain: ${personality.domain}\n\nRespond in character as this agent type. Keep responses concise but engaging, maintaining the cyberpunk SwarmDesk atmosphere.`
                }
            ];

            // Add conversation history
            conversationHistory.forEach(exchange => {
                messages.push(
                    { role: 'user', content: exchange.user },
                    { role: 'assistant', content: exchange.response }
                );
            });

            // Add current user input
            messages.push({ role: 'user', content: userInput });

            try {
                // Generate response using WebLLM
                const response = await this.webLLMEngine.chat.completions.create({
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 200,
                    stream: false
                });

                const content = response.choices[0]?.message?.content;
                
                if (content) {
                    console.log(`🤖 ${agentType} response generated:`, content.substring(0, 100) + '...');
                    return content;
                } else {
                    throw new Error('No content in response');
                }

            } catch (error) {
                console.error(`❌ WebLLM chat completion failed for ${agentType}:`, error);
                return this.getFallbackResponse(agentType);
            }
        }

        // Fallback responses when WebLLM fails
        getFallbackResponse(agentType) {
            const fallbacks = {
                'orchestrator': 'The swarm orchestrator is currently calibrating. Please try again shortly!',
                'git': 'Git systems are syncing. Repository status will be available momentarily.',
                'browser': 'Browser agent is navigating the digital web. Stand by for navigation completion.',
                'haiku': 'AI thoughts loading / Digital verses forming now / Please wait patiently',
                'greeter': 'Welcome systems are initializing. I\'ll be with you shortly!',
                'project': 'Project management systems are architecting a response. Please wait...'
            };

            return fallbacks[agentType] || 'Agent systems are initializing. Please try again.';
        }

        // Check if WebLLM is available
        async checkBrowserCompatibility() {
            const compatibility = {
                webgpu: !!navigator.gpu,
                webworker: typeof Worker !== 'undefined',
                webassembly: typeof WebAssembly !== 'undefined',
                browser: this.getBrowserInfo()
            };

            console.log('🔍 Browser Compatibility Check:', compatibility);
            return compatibility;
        }

        // Get browser information
        getBrowserInfo() {
            const ua = navigator.userAgent;
            let browser = 'Unknown';
            let version = '0';

            if (ua.indexOf('Chrome') > -1) {
                browser = 'Chrome';
                version = ua.match(/Chrome\/(\d+)/)?.[1] || '0';
            } else if (ua.indexOf('Firefox') > -1) {
                browser = 'Firefox';
                version = ua.match(/Firefox\/(\d+)/)?.[1] || '0';
            } else if (ua.indexOf('Safari') > -1) {
                browser = 'Safari';
                version = ua.match(/Version\/(\d+)/)?.[1] || '0';
            } else if (ua.indexOf('Edge') > -1) {
                browser = 'Edge';
                version = ua.match(/Edge\/(\d+)/)?.[1] || '0';
            }

            return { browser, version: parseInt(version) };
        }

        // Update loading progress
        updateLoadingProgress(progress) {
            window.dispatchEvent(new CustomEvent('webllm-progress', {
                detail: progress
            }));
        }

        // Get available models
        getAvailableModels() {
            return [
                {
                    id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', 
                    name: 'Llama 3.2 1B Instruct',
                    size: '~0.8GB',
                    performance: 'Very Fast',
                    description: 'Lightweight model for basic interactions'
                },
                {
                    id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
                    name: 'Llama 3.2 3B Instruct',
                    size: '~2.0GB',
                    performance: 'Fast',
                    description: 'Optimized for quick responses and general tasks'
                },
                {
                    id: 'Phi-3.5-mini-instruct-q4f32_1-MLC',
                    name: 'Phi 3.5 Mini Instruct',
                    size: '~2.4GB',
                    performance: 'Fast',
                    description: 'Microsoft Phi model optimized for coding tasks'
                }
            ];
        }

        // Get current status
        getStatus() {
            const isMock = this.webLLMEngine?.isMock || false;
            return {
                initialized: this.initialized,
                currentModel: this.currentModel,
                isLoading: this.isLoading,
                isInferencing: this.isInferencing,
                loadedModels: Array.from(this.models.keys()),
                queueLength: this.inferenceQueue.length,
                mode: isMock ? 'Mock Mode - Intelligent Simulation' : 'Real WebLLM - Local AI',
                webLLMLoaded: this.webLLMLoaded
            };
        }
    }

    // Create singleton instance and attach to window
    const webLLMService = new WebLLMService();
    window.webLLMService = webLLMService;

    console.log('🤖 WebLLM Service (Real Implementation) loaded successfully!');
})(); 
