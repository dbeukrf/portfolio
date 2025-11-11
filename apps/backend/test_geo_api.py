"""
Simple script to test the geo location API endpoint.
This makes an actual request to the /api/geo endpoint.
"""

import requests
import sys
import json

# Default to localhost:8000, but allow override
base_url = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

def test_geo_api():
    """Test the geo location API endpoint."""
    url = f"{base_url}/api/geo"
    
    print(f"Testing geo location API at: {url}")
    print("-" * 50)
    
    try:
        response = requests.get(url, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print("-" * 50)
        
        if response.status_code == 200:
            data = response.json()
            print("Success!")
            print("\n" + "=" * 50)
            print("Full JSON Response:")
            print("=" * 50)
            print(json.dumps(data, indent=2, ensure_ascii=False))
            print("=" * 50)
            
            print("\nExtracted Data:")
            print(f"City: {data.get('city', 'N/A')}")
            print(f"Country: {data.get('country_name', data.get('country', 'N/A'))}")
            
            # Format the location string
            city = data.get('city')
            country = data.get('country_name') or data.get('country')
            if city and country:
                location = f"{city}, {country}"
            elif city:
                location = city
            elif country:
                location = country
            else:
                location = "Unknown location"
            
            print(f"\nLocation: {location}")
        else:
            print("Error!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the server.")
        print(f"Make sure the backend server is running on {base_url}")
        print("\nTo start the server, run:")
        print("  python main.py")
        print("  or")
        print("  uvicorn main:app --reload")
    except requests.exceptions.Timeout:
        print("Error: Request timed out")
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    test_geo_api()

