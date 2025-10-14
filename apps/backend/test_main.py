"""
Test suite for Diego Portfolio Backend API.

This module contains tests for the FastAPI application endpoints and functionality.
"""

import pytest
from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)

def test_root_endpoint():
    """Test the root endpoint returns correct response."""
    response = client.get("/")
    assert response.status_code == 200
    
    data = response.json()
    assert "message" in data
    assert "docs" in data
    assert "redoc" in data
    assert "health" in data
    assert data["message"] == "Welcome to Diego Portfolio API"

def test_health_endpoint():
    """Test the health check endpoint returns correct response."""
    response = client.get("/health")
    assert response.status_code == 200
    
    data = response.json()
    assert "status" in data
    assert "message" in data
    assert "version" in data
    assert "environment" in data
    assert "debug" in data
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"

def test_docs_endpoint():
    """Test the documentation endpoint is accessible."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_redoc_endpoint():
    """Test the ReDoc documentation endpoint is accessible."""
    response = client.get("/redoc")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]

def test_cors_headers():
    """Test that CORS headers are properly set."""
    # Test CORS with a GET request instead of OPTIONS
    response = client.get("/", headers={"Origin": "http://localhost:5173"})
    assert response.status_code == 200
    
    # Check CORS headers are present
    assert "access-control-allow-origin" in response.headers
    assert "access-control-allow-credentials" in response.headers

def test_health_endpoint_content():
    """Test the health endpoint returns expected content structure."""
    response = client.get("/health")
    data = response.json()
    
    # Verify all expected fields are present
    expected_fields = ["status", "message", "version", "environment", "debug"]
    for field in expected_fields:
        assert field in data, f"Field '{field}' missing from health response"
    
    # Verify field types
    assert isinstance(data["status"], str)
    assert isinstance(data["message"], str)
    assert isinstance(data["version"], str)
    assert isinstance(data["environment"], str)
    assert isinstance(data["debug"], bool)

def test_application_metadata():
    """Test that application metadata is correctly configured."""
    # Test that the app has correct title and version
    assert app.title == "Diego Portfolio API"
    assert app.version == "1.0.0"
    assert app.description == "Backend API for Diego's Portfolio with AI DJ Chatbot functionality"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
