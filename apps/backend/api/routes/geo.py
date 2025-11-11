"""
Geo location API routes.

This module provides endpoints for retrieving visitor location information
using the ipstack API.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api", tags=["Geo"])

IPSTACK_KEY = os.getenv("IPSTACK_KEY")
ENABLE_GEOLOCATION = os.getenv("ENABLE_GEOLOCATION", "true").lower() == "true"


@router.get("/geo")
async def get_visitor_location() -> Dict[str, Any]:
    """
    Get visitor location information using ipstack API.
    
    The ipstack API automatically detects the requester's IP when using /check endpoint.
    
    Returns:
        Full response from ipstack API containing location, timezone, currency, connection, and security information
        
    Raises:
        HTTPException: If ipstack API call fails or API key is missing
    """
    # Check if geolocation feature is enabled
    if not ENABLE_GEOLOCATION:
        raise HTTPException(
            status_code=503,
            detail="Geolocation feature is disabled"
        )
    
    if not IPSTACK_KEY:
        raise HTTPException(
            status_code=500,
            detail="IPSTACK_KEY not configured"
        )
    
    try:
        # ipstack automatically detects the requester's IP when using /check
        # Get full response without field restrictions
        url = f"https://api.ipstack.com/check?access_key={IPSTACK_KEY}"
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            
            if not response.is_success:
                raise HTTPException(
                    status_code=502,
                    detail="ipstack API returned an error"
                )
            
            body = response.json()
            
            # Return the full response from ipstack
            return body
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="ipstack API request timeout"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to reach ipstack API: {str(e)}"
        )
    except HTTPException:
        # Re-raise HTTPExceptions (they should propagate)
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Server error: {str(e)}"
        )

