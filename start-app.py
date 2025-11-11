#!/usr/bin/env python3
"""
Start script for the full Diego Portfolio app (backend + frontend).
Runs both servers concurrently.
"""

import os
import sys
import subprocess
import platform
import signal
import time
from pathlib import Path
from threading import Thread

# Project paths
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / "apps" / "backend"
FRONTEND_DIR = ROOT_DIR / "apps" / "web"

# Global process references
backend_process = None
frontend_process = None

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully."""
    print("\n\n" + "="*60)
    print("Shutting down app servers...")
    print("="*60)
    
    if backend_process:
        print("Stopping backend server...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
    
    if frontend_process:
        print("Stopping frontend server...")
        frontend_process.terminate()
        try:
            frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            frontend_process.kill()
    
    print("\nAll servers stopped.")
    sys.exit(0)

def start_backend():
    """Start the backend server in a separate thread."""
    global backend_process
    
    # Check if .env file exists
    env_file = BACKEND_DIR / ".env"
    env_example = BACKEND_DIR / "env.example"
    
    if not env_file.exists() and env_example.exists():
        print(f"\nWarning: .env file not found!")
        print(f"   Copy {env_example} to {env_file} and configure it.")
    
    # Determine Python executable
    venv_path = BACKEND_DIR / "venv"
    python_cmd = sys.executable
    
    if venv_path.exists():
        if platform.system() == "Windows":
            python_cmd = str(venv_path / "Scripts" / "python.exe")
        else:
            python_cmd = str(venv_path / "bin" / "python")
    
    print("\n[Backend] Starting server on http://127.0.0.1:8000")
    print("[Backend] API docs: http://127.0.0.1:8000/docs")
    
    try:
        if platform.system() == "Windows":
            # On Windows, use shell=True for better compatibility
            backend_process = subprocess.Popen(
                [python_cmd, "main.py"],
                cwd=BACKEND_DIR,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
        else:
            backend_process = subprocess.Popen(
                [python_cmd, "main.py"],
                cwd=BACKEND_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
        
        # Print backend output in a separate thread
        def print_backend_output():
            if backend_process.stdout:
                for line in backend_process.stdout:
                    print(f"[Backend] {line.rstrip()}")
        
        output_thread = Thread(target=print_backend_output, daemon=True)
        output_thread.start()
        
    except Exception as e:
        print(f"\n[Backend] Error: {e}")

def start_frontend():
    """Start the frontend server in a separate thread."""
    global frontend_process
    
    # Check if node_modules exists
    if not (FRONTEND_DIR / "node_modules").exists():
        print("\n[Frontend] Installing dependencies...")
        result = subprocess.run(["pnpm", "install"], cwd=FRONTEND_DIR)
        if result.returncode != 0:
            print("[Frontend] Failed to install dependencies.")
            return
    
    print("\n[Frontend] Starting dev server on http://localhost:5173")
    
    try:
        if platform.system() == "Windows":
            # On Windows, use shell=True for better compatibility
            frontend_process = subprocess.Popen(
                ["pnpm", "dev"],
                cwd=FRONTEND_DIR,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
        else:
            frontend_process = subprocess.Popen(
                ["pnpm", "dev"],
                cwd=FRONTEND_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
        
        # Print frontend output in a separate thread
        def print_frontend_output():
            if frontend_process.stdout:
                for line in frontend_process.stdout:
                    print(f"[Frontend] {line.rstrip()}")
        
        output_thread = Thread(target=print_frontend_output, daemon=True)
        output_thread.start()
            
    except FileNotFoundError:
        print("\n[Frontend] Error: pnpm not found. Please install pnpm:")
        print("   npm install -g pnpm")
    except Exception as e:
        print(f"\n[Frontend] Error: {e}")

def main():
    """Main function to start the full app."""
    print("="*60)
    print("Diego Portfolio - Starting App (Backend + Frontend)")
    print("="*60)
    
    # Register signal handler
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start backend in a thread
    backend_thread = Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Give backend a moment to start
    time.sleep(2)
    
    # Start frontend in a thread
    frontend_thread = Thread(target=start_frontend, daemon=True)
    frontend_thread.start()
    
    print("\n" + "="*60)
    print("App servers are starting...")
    print("="*60)
    print("\nBackend:  http://127.0.0.1:8000")
    print("Frontend: http://localhost:5173")
    print("\nPress Ctrl+C to stop the app")
    print("="*60 + "\n")
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
            # Check if processes are still running
            if backend_process and backend_process.poll() is not None:
                print("\n[Backend] Server stopped unexpectedly")
            if frontend_process and frontend_process.poll() is not None:
                print("\n[Frontend] Server stopped unexpectedly")
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()
