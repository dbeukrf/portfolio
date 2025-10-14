# Diego Portfolio Backend

FastAPI backend for Diego's Portfolio with AI DJ Chatbot functionality.

## Quick Start

### Prerequisites

- Python 3.11+
- pip (Python package manager)

### Setup

1. **Navigate to backend directory:**
   ```bash
   cd apps/backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env file with your configuration
   ```

5. **Run the development server:**
   ```bash
   python main.py
   ```

The API will be available at:
- **API:** http://localhost:8000
- **Documentation:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health

## Project Structure

```
apps/backend/
├── api/
│   ├── routes/          # API endpoint definitions
│   ├── services/        # Business logic layer
│   ├── models/          # Data models and schemas
│   └── utils/           # Utility functions
├── main.py              # FastAPI application entry point
├── requirements.txt     # Python dependencies
├── env.example          # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## API Endpoints

### Health Check
- `GET /health` - Returns API status and version information

### Documentation
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ENVIRONMENT` | Application environment | `development` |
| `DEBUG` | Enable debug mode | `true` |
| `HOST` | Server host | `127.0.0.1` |
| `PORT` | Server port | `8000` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:5173,http://localhost:3000` |

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Quality
```bash
# Install linting tools
pip install black flake8 mypy

# Format code
black .

# Lint code
flake8 .

# Type checking
mypy .
```

## CORS Configuration

The API is configured to allow requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative dev server)

## Future Features

This backend is designed to support:
- AI DJ Chatbot API endpoints
- Track metadata management
- User interaction tracking
- Audio file serving
- Real-time chat functionality

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Write tests for new features
4. Update documentation as needed
