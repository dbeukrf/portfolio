#!/usr/bin/env python3
"""
Startup script for the Diego Portfolio unified backend API server
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    # Change to the project root directory
    project_root = Path(__file__).parent.parent
    os.chdir(project_root)
    
    print("Starting Diego Portfolio Unified Backend API Server...")
    print("Working directory:", os.getcwd())
    print("Note: Server starts immediately. Chatbot initializes in background.")
    print("Check /api/init-status for chatbot initialization progress.")
    print("-" * 60)
    
    # Check if .env file exists
    env_path = project_root / '.env'
    if not env_path.exists():
        print("Warning: .env file not found. Please create one with your API keys.")
        print("Required variables: OPENAI_API_KEY, LANGCHAIN_API_KEY (optional)")
    
    try:
        # Start the FastAPI server
        # Set PYTHONPATH to include apps directory so backend module can be found
        env = os.environ.copy()
        apps_dir = project_root / "apps"
        if "PYTHONPATH" in env:
            env["PYTHONPATH"] = str(apps_dir) + os.pathsep + env["PYTHONPATH"]
        else:
            env["PYTHONPATH"] = str(apps_dir)
        
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "backend.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], check=True, env=env)
    except KeyboardInterrupt:
        print("\nBackend server stopped.")
    except subprocess.CalledProcessError as e:
        print(f"Error starting backend server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
