#!/usr/bin/env python3
"""
Simple HTTP server to serve the test plan files for download.
Run this script and open http://localhost:8000/test_plan_download.html in your browser.
"""

import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Configuration
PORT = 8000
HOST = 'localhost'

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add headers to allow downloads
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_GET(self):
        # Handle CSV downloads with proper content type
        if self.path.endswith('.csv'):
            self.send_response(200)
            self.send_header('Content-Type', 'text/csv')
            self.send_header('Content-Disposition', 'attachment')
            self.end_headers()
            
            # Read and send the CSV file
            try:
                with open(self.path[1:], 'rb') as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_error(404, "File not found")
            return
        
        # Handle Markdown downloads
        elif self.path.endswith('.md'):
            self.send_response(200)
            self.send_header('Content-Type', 'text/markdown')
            self.send_header('Content-Disposition', 'attachment')
            self.end_headers()
            
            try:
                with open(self.path[1:], 'rb') as f:
                    self.wfile.write(f.read())
            except FileNotFoundError:
                self.send_error(404, "File not found")
            return
        
        # Default behavior for other files
        super().do_GET()

def main():
    # Change to the script directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Check if required files exist
    required_files = ['test_plan.csv', 'TEST_PLAN.md', 'test_plan_download.html']
    missing_files = [f for f in required_files if not os.path.exists(f)]
    
    if missing_files:
        print(f"❌ Missing required files: {', '.join(missing_files)}")
        print("Please ensure all test plan files are in the same directory as this script.")
        return
    
    # Start the server
    with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Test Plan Download Server Started")
        print(f"📁 Serving files from: {script_dir}")
        print(f"🌐 Server running at: http://{HOST}:{PORT}")
        print(f"📋 Download page: http://{HOST}:{PORT}/test_plan_download.html")
        print(f"📊 Direct CSV download: http://{HOST}:{PORT}/test_plan.csv")
        print(f"📄 Direct MD download: http://{HOST}:{PORT}/TEST_PLAN.md")
        print("\n" + "="*60)
        print("Available files for download:")
        for file in required_files:
            if os.path.exists(file):
                size = os.path.getsize(file)
                print(f"  ✅ {file} ({size:,} bytes)")
        print("="*60)
        print(f"\n💡 Open your browser and go to: http://{HOST}:{PORT}/test_plan_download.html")
        print("🛑 Press Ctrl+C to stop the server")
        
        # Try to open the browser automatically
        try:
            webbrowser.open(f'http://{HOST}:{PORT}/test_plan_download.html')
            print("🌐 Browser opened automatically")
        except Exception as e:
            print(f"⚠️  Could not open browser automatically: {e}")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            print("👋 Thank you for using the Test Plan Download Server!")

if __name__ == "__main__":
    main()
