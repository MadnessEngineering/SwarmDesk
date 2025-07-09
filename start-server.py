#!/usr/bin/env python3

"""
SwarmDesk WebLLM Test Server
Quick server to run the WebLLM integration test locally.
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Configuration
PORT = 8000
HOST = 'localhost'

class SwarmDeskHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=Path(__file__).parent, **kwargs)
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    print("🤖 SwarmDesk WebLLM Test Server")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path('webllm-test.html').exists():
        print("❌ Error: webllm-test.html not found!")
        print("Please run this script from the SwarmDesk directory.")
        sys.exit(1)
    
    # Start server
    try:
        with socketserver.TCPServer((HOST, PORT), SwarmDeskHandler) as httpd:
            print(f"🚀 Server running at http://{HOST}:{PORT}")
            print()
            print("Available endpoints:")
            print(f"  🧪 WebLLM Test: http://{HOST}:{PORT}/webllm-test.html")
            print(f"  🎪 SwarmDesk: http://{HOST}:{PORT}/index.html")
            print()
            print("Press Ctrl+C to stop the server")
            
            # Open browser automatically
            try:
                webbrowser.open(f'http://{HOST}:{PORT}/webllm-test.html')
                print("🌐 Opening WebLLM test in browser...")
            except Exception as e:
                print(f"⚠️ Could not open browser automatically: {e}")
                print(f"Please manually open: http://{HOST}:{PORT}/webllm-test.html")
            
            # Start serving
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Port {PORT} is already in use!")
            print("Try a different port or stop the other server.")
        else:
            print(f"❌ Error starting server: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == '__main__':
    main() 
