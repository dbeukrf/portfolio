# Development Workflow

## Local Development Setup

### Prerequisites
```bash
# Required software
- Node.js 18+ (with npm/npx)
- pnpm 8+ (npm install -g pnpm)
- Python 3.11+
- Git
```

### Initial Setup
```bash
# Clone repository
git clone https://github.com/diego/portfolio.git
cd diego-portfolio

# Install frontend dependencies
pnpm install

# Set up backend
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy environment files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Configure environment variables (see below)
# Edit .env.local and .env with your values
```

### Environment Configuration

**Frontend (.env.local):**
```bash
# API endpoint (local development)
VITE_API_URL=http://localhost:8000/api

# Analytics (optional for local)
VITE_VERCEL_ANALYTICS_ID=
```

**Backend (.env):**
```bash
# OpenAI API
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=diego-portfolio-knowledge

# Application
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_PER_MINUTE=10
```

### Development Commands

**Start Frontend (from root):**
```bash
pnpm --filter web dev
# Runs on http://localhost:5173
```

**Start Backend (from apps/api):**
```bash
source venv/bin/activate
uvicorn chat:app --reload --port 8000
# Runs on http://localhost:8000
```

**Run All Tests:**
```bash
# Frontend tests
pnpm --filter web test

# Backend tests
cd apps/api && pytest

# E2E tests
pnpm --filter web test:e2e
```

**Lint and Format:**
```bash
# Lint all code
pnpm lint

# Format all code
pnpm format
```

---
