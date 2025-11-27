#!/usr/bin/env python3
"""
Start script for the backend server only.
Starts both the main backend and the chatbot backend.
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

# Global process references
backend_process = None

def check_dependencies(python_cmd):
    """Check if required dependencies are installed."""
    try:
        result = subprocess.run(
            [python_cmd, "-c", "import fastapi"],
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0
    except Exception:
        return False

def install_dependencies(python_cmd):
    """Install backend dependencies."""
    requirements_file = ROOT_DIR / "requirements.txt"
    if not requirements_file.exists():
        print(f"\nError: requirements.txt not found at {requirements_file}")
        return False
    
    print("\nInstalling dependencies...")
    print("This may take a few minutes...\n")
    
    try:
        # Upgrade pip first
        subprocess.run(
            [python_cmd, "-m", "pip", "install", "--upgrade", "pip"],
            cwd=BACKEND_DIR,
            check=True
        )
        
        # Install requirements
        result = subprocess.run(
            [python_cmd, "-m", "pip", "install", "-r", str(requirements_file)],
            cwd=BACKEND_DIR,
            check=True
        )
        
        print("\nDependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\nError: Failed to install dependencies. Exit code: {e.returncode}")
        return False
    except Exception as e:
        print(f"\nError: {str(e)}")
        return False

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully."""
    print("\n\n" + "="*60)
    print("Shutting down backend servers...")
    print("="*60)
    
    if backend_process:
        print("Stopping backend server...")
        backend_process.terminate()
        try:
            backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            backend_process.kill()
    
    print("\nBackend server stopped.")
    sys.exit(0)

def get_python_cmd():
    """Get the Python executable path."""
    venv_path = BACKEND_DIR / "venv"
    python_cmd = sys.executable
    
    if venv_path.exists():
        if platform.system() == "Windows":
            python_cmd = str(venv_path / "Scripts" / "python.exe")
        else:
            python_cmd = str(venv_path / "bin" / "python")
    else:
        print("\nWarning: Virtual environment not found!")
        print("Creating virtual environment...")
        try:
            subprocess.run([sys.executable, "-m", "venv", str(venv_path)], 
                          cwd=BACKEND_DIR, check=True)
            if platform.system() == "Windows":
                python_cmd = str(venv_path / "Scripts" / "python.exe")
            else:
                python_cmd = str(venv_path / "bin" / "python")
            print("Virtual environment created.")
        except Exception as e:
            print(f"Error creating virtual environment: {e}")
            sys.exit(1)
    
    return python_cmd

def start_backend():
    """Start the unified backend server."""
    global backend_process
    
    python_cmd = get_python_cmd()
    
    # Check if dependencies are installed
    if not check_dependencies(python_cmd):
        print("\nWarning: Dependencies not found in virtual environment!")
        print("FastAPI and other required packages need to be installed.")
        response = input("Would you like to install them now? (y/n): ").strip().lower()
        
        if response in ['y', 'yes']:
            if not install_dependencies(python_cmd):
                print("\nFailed to install dependencies. Please run 'python setup.py' first.")
                sys.exit(1)
        else:
            print("\nPlease run 'python setup.py' to install dependencies first.")
            sys.exit(1)
    
    # Check if .env file exists
    root_env_path = ROOT_DIR / '.env'
    backend_env_path = BACKEND_DIR / '.env'
    
    if not root_env_path.exists() and not backend_env_path.exists():
        print("\n[Backend] Warning: .env file not found in project root or backend directory.")
        print("[Backend] Please create one with your API keys.")
        print("[Backend] Required variables: OPENAI_API_KEY, LANGCHAIN_API_KEY (optional)")
    elif root_env_path.exists():
        print(f"\n[Backend] Found .env file at: {root_env_path}")
    elif backend_env_path.exists():
        print(f"\n[Backend] Found .env file at: {backend_env_path}")
    
    print("\n[Backend] Starting unified backend server on http://127.0.0.1:8000")
    print("[Backend] API docs: http://127.0.0.1:8000/docs")
    print("[Backend] Chatbot API: http://127.0.0.1:8000/api/chat")
    
    # Add apps directory to Python path
    env = os.environ.copy()
    pythonpath = str(ROOT_DIR / "apps")
    if "PYTHONPATH" in env:
        env["PYTHONPATH"] = f"{pythonpath}{os.pathsep}{env['PYTHONPATH']}"
    else:
        env["PYTHONPATH"] = pythonpath
    
    try:
        if platform.system() == "Windows":
            backend_process = subprocess.Popen(
                [
                    python_cmd, "-m", "uvicorn", 
                    "backend.main:app", 
                    "--host", "0.0.0.0", 
                    "--port", "8000", 
                    "--reload"
                ],
                cwd=ROOT_DIR,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env=env
            )
        else:
            backend_process = subprocess.Popen(
                [
                    python_cmd, "-m", "uvicorn", 
                    "backend.main:app", 
                    "--host", "0.0.0.0", 
                    "--port", "8000", 
                    "--reload"
                ],
                cwd=ROOT_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env=env
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
        sys.exit(1)
    
    print("\n" + "="*60)
    print("Backend server is starting...")
    print("="*60)
    print("\nUnified Backend:  http://127.0.0.1:8000")
    print("  - API Docs: http://127.0.0.1:8000/docs")
    print("  - Chatbot API: http://127.0.0.1:8000/api/chat")
    print("\nPress Ctrl+C to stop the server")
    print("="*60 + "\n")
    
    # Register signal handler
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
            # Check if process is still running
            if backend_process and backend_process.poll() is not None:
                print("\n[Backend] Server stopped unexpectedly")
                break
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    print("="*60)
    print("Starting Diego Portfolio Unified Backend")
    print("="*60)
    start_backend()

