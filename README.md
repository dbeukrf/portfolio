# Diego Portfolio

A music-themed portfolio that blends a Spotify-inspired experience with AI-powered storytelling. The project ships with a React/Vite frontend and a FastAPI backend, plus helper scripts to set everything up quickly.

## Features
- Spotify-style album view with Diego’s original tracks
- Real-time audio visualisations and playful UI flourishes
- Geo-aware welcome experience (IPStack + Open-Meteo)
- AI DJ chatbot powered by FastAPI foundation

## Requirements
- Python 3.8+
- Node.js 18+
- pnpm (the setup script can install or detect it)

## Getting Started

### 1. Clone the repo
```bash
git clone <repository-url>
cd portfolio
```

### 2. Automated setup (recommended)
```bash
python setup.py
```
This script will:
- Ensure Python, Node.js, and pnpm exist (installs pnpm if missing)
- Create the backend virtual environment (`apps/backend/venv`)
- Install all Python requirements from the root `requirements.txt`
- Install all frontend dependencies with `pnpm install`

### 3. Manual setup (optional)
If you prefer to install things yourself:
- **Backend**
  ```bash
  cd apps/backend
  python -m venv venv
  venv\Scripts\activate  # macOS/Linux: source venv/bin/activate
  pip install -r ../../requirements.txt
  cp env.example .env  # configure IPSTACK_KEY etc.
  ```
- **Frontend**
  ```bash
  cd apps/web
  pnpm install
  cp .env.example .env.local  # adjust VITE_API_BASE_URL if needed
  ```

## Running the project

Scripts live at the repo root for convenience:

- `python start-app.py` – runs both servers concurrently
- `python start-backend.py` – starts FastAPI (`http://127.0.0.1:8000`)
- `python start-frontend.py` – starts Vite dev server (`http://localhost:5173`)
- Windows: `start-app.bat`, `start-backend.bat`, `start-frontend.bat`

## Useful paths & structure
```
portfolio/
├── apps/
│   ├── backend/              # FastAPI service
│   │   ├── main.py
│   │   ├── api/routes/geo.py
│   │   ├── env.example
│   │   └── venv/
│   └── web/                  # React + Vite frontend
│       ├── src/
│       ├── package.json
│       └── pnpm-lock.yaml
├── packages/
│   └── shared/               # Shared TS utilities
├── docs/                     # Architecture, PRDs, UX specs
├── requirements.txt          # Consolidated Python deps
├── setup.py                  # Installs backend + frontend deps
├── start-app.py              # Launch backend + frontend concurrently
├── start-backend.py          # Backend launcher
└── start-frontend.py         # Frontend launcher
```

## Testing
- **Backend**: `cd apps/backend && pytest`
- **Frontend**: `cd apps/web && pnpm test`

## Environment variables
- Backend uses `apps/backend/.env` (copy from `env.example`). Requires `IPSTACK_KEY` when geo lookup is enabled.
- Frontend honours Vite env vars (`apps/web/.env.local`). The API base defaults to `http://localhost:8000/api`.

## Documentation
- Product & UX specs live under `docs/`
- Architecture overview lives in `docs/architecture/`

## License
This project is provided for personal portfolio purposes.
