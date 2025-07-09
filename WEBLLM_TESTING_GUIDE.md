# WebLLM Integration Testing Guide

## 🚨 IMPORTANT: CORS Issue Fix

The errors you encountered are due to **Cross-Origin Resource Sharing (CORS)** restrictions. Modern browsers block ES6 module imports when files are accessed via the `file://` protocol for security reasons.

## 🛠️ Quick Fix - Run Local Server

To test the WebLLM integration, you **must** serve the files from a local HTTP server:

### Option 1: Use Our Python Server (Recommended)
```bash
# Run the provided server script
python3 start-server.py

# Or make it executable and run directly
chmod +x start-server.py
./start-server.py
```

This will:
- Start a local server on http://localhost:8000
- Automatically open the WebLLM test in your browser
- Serve files with proper CORS headers

### Option 2: Manual Server Setup

**Python 3:**
```bash
python3 -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

**Node.js (if you have http-server):**
```bash
npx http-server -p 8000
```

**PHP (if installed):**
```bash
php -S localhost:8000
```

Then open: http://localhost:8000/webllm-test.html

## 🧪 Testing the WebLLM Integration

### 1. Browser Compatibility Test
- **Requirements**: Chrome 113+, Firefox 121+, Safari 16.4+
- **Check**: WebGPU, Web Workers, WebAssembly support
- **Expected**: All green checkmarks for supported browsers

### 2. WebLLM Service Initialization
- **Click**: "Initialize WebLLM" button
- **Expected**: Service initializes successfully
- **Note**: First run may take 10-30 seconds

### 3. Model Loading Test
- **Models Available**:
  - Llama 3.2 1B (Fast, ~0.8GB) - Recommended for testing
  - Llama 3.2 3B (Balanced, ~2.0GB) - Good balance
  - Phi 3.5 Mini (Coding, ~2.4GB) - Best for code tasks
- **Expected**: Progress bar shows download progress
- **Time**: 30-120 seconds depending on model size and internet speed

### 4. Agent Response Test
- **Agents Available**:
  - 🎪 Orchestrator - System coordination
  - 📋 Git Assistant - Version control
  - 🌐 Browser Agent - Web automation
  - 🎋 Haiku Bot - Creative content
  - 👋 Greeter - User guidance
  - 📊 Project Manager - Project management
- **Test**: Send messages to different agents
- **Expected**: Personalized responses based on agent type

### 5. Performance Metrics
- **Monitor**: Response times, memory usage
- **Expected**: 50-500ms response times depending on model

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. "WebGPU not supported"
**Problem**: Your browser doesn't support WebGPU
**Solution**: 
- Use Chrome 113+ or Firefox 121+
- Enable WebGPU in browser settings
- The system will fall back to hardcoded responses

#### 2. "Model loading failed"
**Problem**: Network issues or model unavailable
**Solution**:
- Check internet connection
- Try a smaller model (1B instead of 3B)
- Refresh page and try again

#### 3. "WebLLM service not loaded"
**Problem**: CORS restrictions or server not running
**Solution**:
- **DO NOT** open `webllm-test.html` directly in browser
- **DO** run from local HTTP server as described above

#### 4. Slow performance
**Problem**: Inference taking too long
**Solution**:
- Use smaller model (1B)
- Close other browser tabs
- Ensure WebGPU is enabled

#### 5. Out of memory errors
**Problem**: Browser running out of memory
**Solution**:
- Close other tabs/applications
- Use smaller model
- Restart browser

## 📊 Expected Performance

### Model Performance Comparison
| Model | Size | Load Time | Response Time | Memory Usage |
|-------|------|-----------|---------------|--------------|
| Llama 1B | ~0.8GB | 30-60s | 50-200ms | ~1GB RAM |
| Llama 3B | ~2.0GB | 60-120s | 100-500ms | ~2.5GB RAM |
| Phi 3.5 | ~2.4GB | 60-120s | 100-400ms | ~3GB RAM |

*Performance varies based on hardware and browser optimization*

## 🎪 Testing SwarmDesk Integration

After testing the standalone WebLLM interface, you can test the full SwarmDesk integration:

1. **Start Server**: `python3 start-server.py`
2. **Open SwarmDesk**: http://localhost:8000/index.html
3. **Initialize WebLLM**: Press F7 to open WebLLM Manager panel
4. **Load Model**: Use the Models tab to load a model
5. **Test Agents**: Navigate to agents in the 3D environment and interact

### SwarmDesk WebLLM Features
- **F7**: Open WebLLM Manager panel
- **Model Management**: Load/unload models via floating panel
- **Agent Dialogue**: AI-powered responses in agent conversations
- **Graceful Fallbacks**: Automatic fallback to hardcoded responses

## 🐛 Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('webllm-debug', 'true');
console.log(webLLMService.getStatus());
```

## 🔒 Security Notes

- **Privacy**: All AI processing happens locally in your browser
- **No Data Transmission**: Conversations never leave your device
- **Model Security**: Models loaded from trusted MLC-AI CDN

## 🚀 Next Steps

Once testing is complete, the WebLLM integration is ready for:
1. **Production Deployment**: Serve from web server
2. **Model Customization**: Add domain-specific models
3. **Performance Optimization**: Implement model caching
4. **Advanced Features**: Streaming responses, multi-agent coordination

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify you're using a supported browser
3. Ensure you're running from HTTP server (not file://)
4. Try different models if one fails to load

The WebLLM integration is designed to be robust with comprehensive error handling and fallback mechanisms. Even if WebLLM fails, the system gracefully degrades to the original SwarmDesk experience. 
