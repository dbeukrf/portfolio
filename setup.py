#!/usr/bin/env python3
"""
Setup script for Diego Portfolio project.
Installs both backend (Python) and frontend (Node.js) dependencies.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

# Project paths
ROOT_DIR = Path(__file__).parent
BACKEND_DIR = ROOT_DIR / "apps" / "backend"
FRONTEND_DIR = ROOT_DIR / "apps" / "web"
REQUIREMENTS_FILE = ROOT_DIR / "requirements.txt"

def run_command(cmd, cwd=None, check=True):
    """Run a shell command and handle errors."""
    print(f"\n{'='*60}")
    print(f"Running: {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    print(f"{'='*60}\n")
    
    try:
        if isinstance(cmd, str):
            result = subprocess.run(cmd, shell=True, cwd=cwd, check=check)
        else:
            result = subprocess.run(cmd, cwd=cwd, check=check)
        return result.returncode == 0
    except subprocess.CalledProcessError as e:
        print(f"Error: Command failed with exit code {e.returncode}")
        return False
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def check_python():
    """Check if Python is installed."""
    try:
        version = subprocess.run([sys.executable, "--version"], 
                                capture_output=True, text=True)
        print(f"Python found: {version.stdout.strip()}")
        return True
    except Exception:
        print("Python not found. Please install Python 3.8+")
        return False

def check_node():
    """Check if Node.js is installed."""
    try:
        version = subprocess.run(["node", "--version"], 
                                capture_output=True, text=True)
        print(f"Node.js found: {version.stdout.strip()}")
        return True
    except Exception:
        print("Node.js not found. Please install Node.js 18+")
        return False

def check_pnpm():
    """Check if pnpm is installed."""
    # Try multiple methods to find pnpm
    methods = [
        # Method 1: Direct command
        (["pnpm", "--version"], False),
        # Method 2: With shell=True (Windows compatibility)
        ("pnpm --version", True),
        # Method 3: Via npm exec
        (["npm", "exec", "--", "pnpm", "--version"], False),
    ]
    
    for cmd, use_shell in methods:
        try:
            if use_shell:
                result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=5)
            else:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            
            if result.returncode == 0 and result.stdout.strip():
                version = result.stdout.strip()
                print(f"pnpm found: {version}")
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError, Exception):
            continue
    
    # If not found, check if pnpm file exists in common locations (Windows)
    if platform.system() == "Windows":
        npm_path = os.path.expanduser("~\\AppData\\Roaming\\npm")
        pnpm_paths = [
            Path(npm_path) / "pnpm.cmd",
            Path(npm_path) / "pnpm.ps1",
            Path(npm_path) / "pnpm",
        ]
        
        for pnpm_path in pnpm_paths:
            if pnpm_path.exists():
                print(f"pnpm found at: {pnpm_path}")
                print("Note: pnpm is installed but may not be in PATH.")
                print("The script will attempt to use it anyway.")
                return True
    
    # Last resort: try to install
    print("pnpm not found in PATH. Attempting to install...")
    try:
        # Use --force to overwrite if it exists
        result = subprocess.run(
            ["npm", "install", "-g", "pnpm", "--force"],
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode == 0:
            print("pnpm installed successfully")
            # Verify it works now
            verify = subprocess.run(["pnpm", "--version"], capture_output=True, text=True, timeout=5)
            if verify.returncode == 0:
                print(f"pnpm verified: {verify.stdout.strip()}")
                return True
    except Exception as e:
        pass
    
    print("Warning: Could not verify pnpm installation.")
    print("pnpm may be installed but not accessible. Continuing anyway...")
    print("If frontend setup fails, try: npm install -g pnpm --force")
    return True  # Continue anyway, let setup_frontend handle the actual error

def setup_backend():
    """Install Python backend dependencies."""
    print("\n" + "="*60)
    print("Setting up Backend (Python)")
    print("="*60)
    
    if not REQUIREMENTS_FILE.exists():
        print(f"Requirements file not found: {REQUIREMENTS_FILE}")
        return False
    
    # Check if virtual environment exists
    venv_path = BACKEND_DIR / "venv"
    python_cmd = sys.executable
    
    if venv_path.exists():
        print(f"Virtual environment found at {venv_path}")
        if platform.system() == "Windows":
            python_cmd = str(venv_path / "Scripts" / "python.exe")
        else:
            python_cmd = str(venv_path / "bin" / "python")
    else:
        print("Creating virtual environment...")
        if not run_command([sys.executable, "-m", "venv", str(venv_path)], 
                          cwd=BACKEND_DIR):
            return False
    
    # Install requirements
    print("\nInstalling Python packages...")
    if not run_command([python_cmd, "-m", "pip", "install", "--upgrade", "pip"], 
                      cwd=BACKEND_DIR):
        return False
    
    if not run_command([python_cmd, "-m", "pip", "install", "-r", str(REQUIREMENTS_FILE)], 
                      cwd=BACKEND_DIR):
        return False
    
    print("\nBackend setup complete!")
    return True

def setup_frontend():
    """Install Node.js frontend dependencies."""
    print("\n" + "="*60)
    print("Setting up Frontend (Node.js)")
    print("="*60)
    
    if not (FRONTEND_DIR / "package.json").exists():
        print(f"package.json not found in {FRONTEND_DIR}")
        return False
    
    # Install dependencies using pnpm
    print("\nInstalling Node.js packages...")
    # Use shell=True on Windows for better PATH resolution
    if platform.system() == "Windows":
        if not run_command("pnpm install", cwd=FRONTEND_DIR):
            return False
    else:
        if not run_command(["pnpm", "install"], cwd=FRONTEND_DIR):
            return False
    
    print("\nFrontend setup complete!")
    return True

def main():
    """Main setup function."""
    print("="*60)
    print("Diego Portfolio - Project Setup")
    print("="*60)
    
    # Check prerequisites
    print("\nChecking prerequisites...")
    if not check_python():
        sys.exit(1)
    
    if not check_node():
        sys.exit(1)
    
    if not check_pnpm():
        sys.exit(1)
    
    # Setup backend
    if not setup_backend():
        print("\nBackend setup failed!")
        sys.exit(1)
    
    # Setup frontend
    if not setup_frontend():
        print("\nFrontend setup failed!")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("Setup complete! All dependencies installed.")
    print("="*60)
    print("\nNext steps:")
    print("  1. Copy apps/backend/env.example to apps/backend/.env and configure it")
    print("  2. Run 'python start-backend.py' to start the backend")
    print("  3. Run 'python start-frontend.py' to start the frontend")
    print("  4. Or run 'python start-app.py' to start both servers")
    print("="*60)

if __name__ == "__main__":
    main()

