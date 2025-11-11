"""
Test suite for Geo Location API endpoint.

This module contains tests for the /api/geo endpoint that retrieves
visitor location information using the ipstack API.
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from fastapi.testclient import TestClient
from main import app

# Create test client
client = TestClient(app)


@pytest.fixture
def mock_ipstack_response():
    """Mock successful ipstack API response."""
    return {
        "city": "Sydney",
        "country_name": "Australia"
    }


@pytest.fixture
def mock_ipstack_response_partial():
    """Mock ipstack API response with only city."""
    return {
        "city": "Sydney",
        "country_name": None
    }


@pytest.fixture
def mock_ipstack_response_no_data():
    """Mock ipstack API response with no location data."""
    return {
        "city": None,
        "country_name": None
    }


def create_mock_httpx_client(mock_response_data, should_fail=False, exception=None):
    """Helper to create a mock httpx AsyncClient."""
    mock_response = MagicMock()
    mock_response.is_success = not should_fail
    mock_response.json.return_value = mock_response_data
    
    mock_client_instance = MagicMock()
    if exception:
        mock_client_instance.get = AsyncMock(side_effect=exception)
    else:
        mock_client_instance.get = AsyncMock(return_value=mock_response)
    mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
    mock_client_instance.__aexit__ = AsyncMock(return_value=None)
    
    return mock_client_instance


@patch("api.routes.geo.IPSTACK_KEY", "test_api_key_123")
@patch("api.routes.geo.httpx.AsyncClient")
def test_geo_endpoint_success(mock_client_class, mock_ipstack_response):
    """Test successful location retrieval."""
    mock_client_instance = create_mock_httpx_client(mock_ipstack_response)
    mock_client_class.return_value = mock_client_instance
    
    response = client.get("/api/geo")
    
    assert response.status_code == 200
    data = response.json()
    assert "city" in data
    assert "country" in data
    assert data["city"] == "Sydney"
    assert data["country"] == "Australia"


@patch("api.routes.geo.IPSTACK_KEY", "test_api_key_123")
@patch("api.routes.geo.httpx.AsyncClient")
def test_geo_endpoint_partial_data(mock_client_class, mock_ipstack_response_partial):
    """Test location retrieval with partial data (only city)."""
    mock_client_instance = create_mock_httpx_client(mock_ipstack_response_partial)
    mock_client_class.return_value = mock_client_instance
    
    response = client.get("/api/geo")
    
    assert response.status_code == 200
    data = response.json()
    assert data["city"] == "Sydney"
    assert data["country"] is None


@patch("api.routes.geo.IPSTACK_KEY", "test_api_key_123")
@patch("api.routes.geo.httpx.AsyncClient")
def test_geo_endpoint_no_data(mock_client_class, mock_ipstack_response_no_data):
    """Test location retrieval with no location data."""
    mock_client_instance = create_mock_httpx_client(mock_ipstack_response_no_data)
    mock_client_class.return_value = mock_client_instance
    
    response = client.get("/api/geo")
    
    assert response.status_code == 200
    data = response.json()
    assert data["city"] is None
    assert data["country"] is None


@patch("api.routes.geo.IPSTACK_KEY", None)
def test_geo_endpoint_missing_api_key():
    """Test endpoint returns error when IPSTACK_KEY is not configured."""
    response = client.get("/api/geo")
    
    assert response.status_code == 500
    data = response.json()
    assert "detail" in data
    assert "IPSTACK_KEY not configured" in data["detail"]


@patch("api.routes.geo.IPSTACK_KEY", "test_api_key_123")
@patch("api.routes.geo.httpx.AsyncClient")
def test_geo_endpoint_ipstack_error(mock_client_class):
    """Test endpoint handles ipstack API error response."""
    # Create a mock response that fails
    # The code checks is_success before calling json(), so we need to make sure
    # is_success returns False
    mock_response = MagicMock()
    # Use property to make is_success return False
    type(mock_response).is_success = False
    
    mock_client_instance = MagicMock()
    mock_client_instance.get = AsyncMock(return_value=mock_response)
    mock_client_instance.__aenter__ = AsyncMock(return_value=mock_client_instance)
    mock_client_instance.__aexit__ = AsyncMock(return_value=None)
    mock_client_class.return_value = mock_client_instance
    
    response = client.get("/api/geo")
    
    assert response.status_code == 502
    data = response.json()
    assert "detail" in data
    assert "ipstack API returned an error" in data["detail"]


@patch("api.routes.geo.IPSTACK_KEY", "test_api_key_123")
@patch("api.routes.geo.httpx.AsyncClient")
def test_geo_endpoint_timeout(mock_client_class):
    """Test endpoint handles timeout from ipstack API."""
    import httpx
    
    mock_client_instance = create_mock_httpx_client({}, exception=httpx.TimeoutException("Request timeout"))
    mock_client_class.return_value = mock_client_instance
    
    response = client.get("/api/geo")
    
    assert response.status_code == 504
    data = response.json()
    assert "detail" in data
    assert "timeout" in data["detail"].lower()


@patch("api.routes.geo.IPSTACK_KEY", "test_api_key_123")
@patch("api.routes.geo.httpx.AsyncClient")
def test_geo_endpoint_network_error(mock_client_class):
    """Test endpoint handles network errors from ipstack API."""
    import httpx
    
    mock_client_instance = create_mock_httpx_client({}, exception=httpx.RequestError("Network error"))
    mock_client_class.return_value = mock_client_instance
    
    response = client.get("/api/geo")
    
    assert response.status_code == 502
    data = response.json()
    assert "detail" in data
    assert "Failed to reach ipstack API" in data["detail"]


@patch("api.routes.geo.IPSTACK_KEY", "test_api_key_123")
@patch("api.routes.geo.httpx.AsyncClient")
def test_geo_endpoint_response_structure(mock_client_class, mock_ipstack_response):
    """Test that the response has the correct structure."""
    mock_client_instance = create_mock_httpx_client(mock_ipstack_response)
    mock_client_class.return_value = mock_client_instance
    
    response = client.get("/api/geo")
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify response structure
    assert isinstance(data, dict)
    assert "city" in data
    assert "country" in data
    assert isinstance(data["city"], (str, type(None)))
    assert isinstance(data["country"], (str, type(None)))


@patch("api.routes.geo.IPSTACK_KEY", "test_api_key_123")
@patch("api.routes.geo.httpx.AsyncClient")
def test_geo_endpoint_uses_correct_url(mock_client_class, mock_ipstack_response):
    """Test that the endpoint calls ipstack with correct URL and parameters."""
    mock_client_instance = create_mock_httpx_client(mock_ipstack_response)
    mock_client_class.return_value = mock_client_instance
    
    response = client.get("/api/geo")
    
    assert response.status_code == 200
    
    # Verify the URL was called correctly
    mock_client_instance.get.assert_called_once()
    call_args = mock_client_instance.get.call_args
    assert call_args is not None
    url = call_args[0][0] if call_args[0] else call_args.kwargs.get("url", "")
    assert "api.ipstack.com/check" in url
    assert "access_key=test_api_key_123" in url
    assert "fields=city,country_name" in url


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
