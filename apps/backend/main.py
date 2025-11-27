"""
FastAPI application entry point for Diego Portfolio Backend.

This module initializes the FastAPI application with optimized startup:
- Server starts immediately (~1 second)
- Chatbot initializes in background
- Core components load fast, documents load asynchronously
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import asyncio
import sys
from typing import Dict, Any
from contextlib import asynccontextmanager
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from backend.api.routes import geo, chat
from backend.api.services.chatbot_service import initialize_chatbot_async

# Load environment variables
project_root = backend_dir.parent.parent
backend_env = backend_dir / ".env"
root_env = project_root / ".env"

if backend_env.exists():
    load_dotenv(backend_env)
    print(f"[Main] Loaded .env from: {backend_env}", flush=True)
elif root_env.exists():
    load_dotenv(root_env)
    print(f"[Main] Loaded .env from: {root_env}", flush=True)
else:
    load_dotenv()
    print(f"[Main] Warning: No .env file found in {backend_env} or {root_env}", flush=True)


# Lifespan event handler - optimized for fast startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events with fast startup"""
    # Startup
    print("=" * 60, flush=True)
    print("Diego Portfolio API - Starting up...", flush=True)
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}", flush=True)
    print("=" * 60, flush=True)
    
    # Start chatbot initialization in background task
    # This allows the server to start immediately
    init_task = asyncio.create_task(initialize_chatbot_async())
    
    print("[Main] Server is ready to accept connections immediately!", flush=True)
    print("[Main] Chatbot is initializing in the background...", flush=True)
    print("[Main] Note: Documents must be ingested manually using 'python ingest_documents.py'", flush=True)
    print("[Main] Check /api/init-status for chatbot initialization progress", flush=True)
    print("=" * 60, flush=True)
    sys.stdout.flush()
    
    yield
    
    # Shutdown
    print("=" * 60, flush=True)
    print("Diego Portfolio API - Shutting down...", flush=True)
    
    # Cancel initialization task if still running
    if not init_task.done():
        init_task.cancel()
        try:
            await init_task
        except asyncio.CancelledError:
            pass
    
    print("Shutdown complete.", flush=True)
    print("=" * 60, flush=True)


# Initialize FastAPI app
app = FastAPI(
    title="Diego Portfolio API",
    description="Backend API for Diego's Portfolio with AI DJ Chatbot functionality",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://diegobeuk.com",  # Production domain
        "http://localhost:5173",  # Vite dev server
        "http://127.0.0.1:5173",  # Vite dev server (127.0.0.1)
        "http://localhost:3000",  # Alternative dev server
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
    max_age=3600,
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint to verify API status.
    
    Returns:
        Dict containing API status, version, and environment information
    """
    return {
        "status": "healthy",
        "message": "Diego Portfolio API is running",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "debug": os.getenv("DEBUG", "false").lower() == "true",
    }

# Include routers
app.include_router(geo.router)
app.include_router(chat.router)

# Root endpoint
@app.get("/", tags=["Root"])
async def root() -> Dict[str, Any]:
    """
    Root endpoint providing basic API information.
    
    Returns:
        Dict with welcome message and documentation links
    """
    return {
        "message": "Welcome to Diego Portfolio API",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "endpoints": {
            "geo": "/api/geo",
            "chat": "/api/chat",
            "chat_status": "/api/status",
            "chat_init_status": "/api/init-status",
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment variables
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if not debug else "debug",
    )
