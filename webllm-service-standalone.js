// SwarmDesk WebLLM Service - Standalone Version
// Handles local AI model loading, inference, and agent integration
// No ES6 modules - works with regular script tags

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

        // Initialize WebLLM engine
        async initialize() {
            if (this.initialized) return true;

            try {
                console.log('🤖 Initializing WebLLM Service...');
                
                // Check WebGPU support
                if (!navigator.gpu) {
                    throw new Error('WebGPU not supported in this browser');
                }

                // Load WebLLM from CDN using script tag approach
                if (!window.webllm) {
                    console.log('📦 Loading WebLLM library...');
                    await this.loadWebLLMScript();
                }

                // Check if WebLLM is available
                if (!window.webllm || !window.webllm.CreateWebWorkerEngine) {
                    throw new Error('WebLLM library not loaded correctly');
                }
                
                // Create the engine with web worker for better performance
                this.webLLMEngine = await window.webllm.CreateWebWorkerEngine(
                    new window.webllm.AppConfig({ model_list: this.getModelList() }),
                    {
                        initProgressCallback: (progress) => {
                            console.log('📦 WebLLM Loading:', progress);
                            this.updateLoadingProgress(progress);
                        }
                    }
                );

                this.initialized = true;
                console.log('✅ WebLLM Service initialized successfully');
                return true;

            } catch (error) {
                console.error('❌ WebLLM Service initialization failed:', error);
                this.initialized = false;
                return false;
            }
        }

        // Load WebLLM script dynamically
        async loadWebLLMScript() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.type = 'module';
                script.innerHTML = `
                    import * as webllm from "https://esm.run/@mlc-ai/web-llm";
                    window.webllm = webllm;
                `;
                script.onload = () => {
                    // Wait a bit for the module to be available
                    setTimeout(() => {
                        if (window.webllm) {
                            resolve();
                        } else {
                            reject(new Error('WebLLM module not loaded'));
                        }
                    }, 1000);
                };
                script.onerror = (error) => reject(error);
                document.head.appendChild(script);
            });
        }

        // Get model list configuration
        getModelList() {
            return [
                {
                    "model": "https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC",
                    "model_id": "Llama-3.2-1B-Instruct-q4f32_1-MLC",
                    "model_lib": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_46/Llama-3.2-1B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm"
                },
                {
                    "model": "https://huggingface.co/mlc-ai/Llama-3.2-3B-Instruct-q4f32_1-MLC",
                    "model_id": "Llama-3.2-3B-Instruct-q4f32_1-MLC", 
                    "model_lib": "https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_46/Llama-3.2-3B-Instruct-q4f32_1-ctx4k_cs1k-webgpu.wasm"
                }
            ];
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
                // Add to inference queue
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

        // Update loading progress (for UI integration)
        updateLoadingProgress(progress) {
            // Emit custom event for UI components to listen to
            window.dispatchEvent(new CustomEvent('webllm-progress', {
                detail: progress
            }));
        }

        // Get available models
        getAvailableModels() {
            return [
                {
                    id: 'Llama-3.2-3B-Instruct-q4f32_1-MLC',
                    name: 'Llama 3.2 3B Instruct',
                    size: '~2.0GB',
                    performance: 'Fast',
                    description: 'Optimized for quick responses and general tasks'
                },
                {
                    id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', 
                    name: 'Llama 3.2 1B Instruct',
                    size: '~0.8GB',
                    performance: 'Very Fast',
                    description: 'Lightweight model for basic interactions'
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
            return {
                initialized: this.initialized,
                currentModel: this.currentModel,
                isLoading: this.isLoading,
                isInferencing: this.isInferencing,
                loadedModels: Array.from(this.models.keys()),
                queueLength: this.inferenceQueue.length
            };
        }
    }

    // Create singleton instance and attach to window
    const webLLMService = new WebLLMService();
    window.webLLMService = webLLMService;

    console.log('🤖 WebLLM Service (Standalone) loaded successfully!');
})(); 
