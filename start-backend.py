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
main_backend_process = None
chatbot_backend_process = None

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
    
    if main_backend_process:
        print("Stopping main backend server...")
        main_backend_process.terminate()
        try:
            main_backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            main_backend_process.kill()
    
    if chatbot_backend_process:
        print("Stopping chatbot backend server...")
        chatbot_backend_process.terminate()
        try:
            chatbot_backend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            chatbot_backend_process.kill()
    
    print("\nAll backend servers stopped.")
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

def start_main_backend():
    """Start the main FastAPI backend server."""
    global main_backend_process
    
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
    
    print("\n[Main Backend] Starting server on http://127.0.0.1:8000")
    print("[Main Backend] API docs: http://127.0.0.1:8000/docs")
    
    try:
        if platform.system() == "Windows":
            main_backend_process = subprocess.Popen(
                [python_cmd, "main.py"],
                cwd=BACKEND_DIR,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
        else:
            main_backend_process = subprocess.Popen(
                [python_cmd, "main.py"],
                cwd=BACKEND_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1
            )
        
        # Print backend output in a separate thread
        def print_backend_output():
            if main_backend_process.stdout:
                for line in main_backend_process.stdout:
                    print(f"[Main Backend] {line.rstrip()}")
        
        output_thread = Thread(target=print_backend_output, daemon=True)
        output_thread.start()
        
    except Exception as e:
        print(f"\n[Main Backend] Error: {e}")

def start_chatbot_backend():
    """Start the chatbot backend API server."""
    global chatbot_backend_process
    
    python_cmd = get_python_cmd()
    
    # Check if .env file exists
    env_path = ROOT_DIR / '.env'
    if not env_path.exists():
        print("\n[Chatbot Backend] Warning: .env file not found. Please create one with your API keys.")
        print("[Chatbot Backend] Required variables: OPENAI_API_KEY, LANGCHAIN_API_KEY")
    
    print("\n[Chatbot Backend] Starting server on http://127.0.0.1:8001")
    
    # Add apps directory to Python path
    env = os.environ.copy()
    pythonpath = str(ROOT_DIR / "apps")
    if "PYTHONPATH" in env:
        env["PYTHONPATH"] = f"{pythonpath}{os.pathsep}{env['PYTHONPATH']}"
    else:
        env["PYTHONPATH"] = pythonpath
    
    try:
        if platform.system() == "Windows":
            chatbot_backend_process = subprocess.Popen(
                [
                    python_cmd, "-m", "uvicorn", 
                    "backend.api_server:app", 
                    "--host", "0.0.0.0", 
                    "--port", "8001", 
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
            chatbot_backend_process = subprocess.Popen(
                [
                    python_cmd, "-m", "uvicorn", 
                    "backend.api_server:app", 
                    "--host", "0.0.0.0", 
                    "--port", "8001", 
                    "--reload"
                ],
                cwd=ROOT_DIR,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env=env
            )
        
        # Print chatbot backend output in a separate thread
        def print_chatbot_output():
            if chatbot_backend_process.stdout:
                for line in chatbot_backend_process.stdout:
                    print(f"[Chatbot Backend] {line.rstrip()}")
        
        output_thread = Thread(target=print_chatbot_output, daemon=True)
        output_thread.start()
        
    except Exception as e:
        print(f"\n[Chatbot Backend] Error: {e}")

def start_backend():
    """Start both backend servers."""
    print("="*60)
    print("Starting Diego Portfolio Backends")
    print("="*60)
    
    # Check if .env file exists
    env_file = BACKEND_DIR / ".env"
    env_example = BACKEND_DIR / "env.example"
    
    if not env_file.exists() and env_example.exists():
        print(f"\nWarning: .env file not found!")
        print(f"   Copy {env_example} to {env_file} and configure it.")
        print(f"   Continuing anyway...\n")
    
    # Register signal handler
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start main backend in a thread
    main_backend_thread = Thread(target=start_main_backend, daemon=True)
    main_backend_thread.start()
    
    # Give main backend a moment to start
    time.sleep(2)
    
    # Start chatbot backend in a thread
    chatbot_backend_thread = Thread(target=start_chatbot_backend, daemon=True)
    chatbot_backend_thread.start()
    
    print("\n" + "="*60)
    print("Backend servers are starting...")
    print("="*60)
    print("\nMain Backend:  http://127.0.0.1:8000")
    print("Chatbot Backend: http://127.0.0.1:8001")
    print("\nPress Ctrl+C to stop the servers")
    print("="*60 + "\n")
    
    # Keep main thread alive
    try:
        while True:
            time.sleep(1)
            # Check if processes are still running
            if main_backend_process and main_backend_process.poll() is not None:
                print("\n[Main Backend] Server stopped unexpectedly")
            if chatbot_backend_process and chatbot_backend_process.poll() is not None:
                print("\n[Chatbot Backend] Server stopped unexpectedly")
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    start_backend()

