#!/usr/bin/env python3
"""
Start script for the backend server only.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

# Project paths
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / "apps" / "backend"

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

def start_backend():
    """Start the FastAPI backend server."""
    print("="*60)
    print("Starting Diego Portfolio Backend")
    print("="*60)
    
    # Check if .env file exists
    env_file = BACKEND_DIR / ".env"
    env_example = BACKEND_DIR / "env.example"
    
    if not env_file.exists() and env_example.exists():
        print(f"\nWarning: .env file not found!")
        print(f"   Copy {env_example} to {env_file} and configure it.")
        print(f"   Continuing anyway...\n")
    
    # Determine Python executable
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
    
    # Change to backend directory
    os.chdir(BACKEND_DIR)
    
    # Start the server
    print(f"\nStarting backend server on http://127.0.0.1:8000")
    print(f"API docs available at http://127.0.0.1:8000/docs")
    print(f"Press Ctrl+C to stop the server\n")
    
    try:
        subprocess.run([python_cmd, "main.py"], check=True)
    except KeyboardInterrupt:
        print("\n\nServer stopped by user.")
    except subprocess.CalledProcessError as e:
        print(f"\nServer failed to start: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_backend()

