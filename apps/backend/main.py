"""
FastAPI application entry point for Diego Portfolio Backend.

This module initializes the FastAPI application with all necessary middleware,
routes, and configuration for the AI DJ chatbot API.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from typing import Dict, Any
from contextlib import asynccontextmanager
from api.routes import geo

# Load environment variables
load_dotenv()


# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events."""
    # Startup
    print("Diego Portfolio API is starting up...")
    print(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    print(f"Debug mode: {os.getenv('DEBUG', 'false')}")
    
    yield
    
    # Shutdown
    print("Diego Portfolio API is shutting down...")


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
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative dev server
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
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

# Root endpoint
@app.get("/", tags=["Root"])
async def root() -> Dict[str, str]:
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
