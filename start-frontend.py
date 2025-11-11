#!/usr/bin/env python3
"""
Start script for the frontend server only.
"""

import os
import sys
import subprocess
import platform
from pathlib import Path

# Project paths
ROOT_DIR = Path(__file__).parent
FRONTEND_DIR = ROOT_DIR / "apps" / "web"

def start_frontend():
    """Start the Vite frontend development server."""
    print("="*60)
    print("Starting Diego Portfolio Frontend")
    print("="*60)
    
    if not (FRONTEND_DIR / "package.json").exists():
        print(f"\nError: package.json not found in {FRONTEND_DIR}")
        print("   Run 'python setup.py' first to install dependencies.")
        sys.exit(1)
    
    # Check if node_modules exists
    if not (FRONTEND_DIR / "node_modules").exists():
        print(f"\nWarning: node_modules not found!")
        print("   Installing dependencies...")
        # Use shell=True on Windows for better PATH resolution
        if platform.system() == "Windows":
            result = subprocess.run("pnpm install", shell=True, cwd=FRONTEND_DIR)
        else:
            result = subprocess.run(["pnpm", "install"], cwd=FRONTEND_DIR)
        if result.returncode != 0:
            print("Failed to install dependencies.")
            sys.exit(1)
    
    # Change to frontend directory
    os.chdir(FRONTEND_DIR)
    
    # Start the dev server
    print(f"\nStarting frontend dev server...")
    print(f"Frontend will be available at http://localhost:5173")
    print(f"Press Ctrl+C to stop the server\n")
    
    try:
        # Use shell=True on Windows for better PATH resolution
        if platform.system() == "Windows":
            subprocess.run("pnpm dev", shell=True, check=True)
        else:
            subprocess.run(["pnpm", "dev"], check=True)
    except KeyboardInterrupt:
        print("\n\nServer stopped by user.")
    except subprocess.CalledProcessError as e:
        print(f"\nServer failed to start: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("\nError: pnpm not found. Please install pnpm:")
        print("   npm install -g pnpm")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_frontend()

