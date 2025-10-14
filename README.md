# Diego Portfolio

A unique, music-themed portfolio website that showcases technical skills through an innovative experience featuring Spotify-style navigation, audio-reactive visualizations, and an AI-powered chatbot.

## Project Overview

Diego Portfolio is a fullstack application that combines:
- **Frontend**: React + TypeScript + Vite with audio visualizations
- **Backend**: FastAPI + LangChain + Pinecone for AI chatbot
- **Deployment**: Vercel (frontend + serverless functions)

## Features

- 🎵 **5-Track Music Player**: Spotify-style album view with Diego's original music
- 🎨 **Audio Visualizations**: Real-time Canvas-based visualizations synced to music
- 🤖 **AI DJ Chatbot**: Intelligent assistant answering questions about Diego's background
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile
- ♿ **Accessibility**: WCAG 2.1 AA compliant

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.11+ (for backend)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd diego-portfolio
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local

# Backend (when implemented)
cp apps/api/.env.example apps/api/.env
```

4. Start development:
```bash
# Frontend
pnpm --filter web dev

# Backend (when implemented)
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Project Structure

```
diego-portfolio/
├── apps/
│   ├── web/                 # React frontend
│   └── api/                 # Python serverless functions
├── packages/
│   └── shared/              # Shared TypeScript types
├── docs/                    # Project documentation
└── scripts/                 # Build/utility scripts
```

## Technology Stack

### Frontend
- React 18.2.x + TypeScript 5.3.x
- Vite 5.0.x (build tool)
- TailwindCSS 3.4.x (styling)
- Zustand 4.4.x (state management)
- Web Audio API (audio processing)
- Canvas API (visualizations)

### Backend
- Python 3.11.x + FastAPI 0.108.x
- LangChain 0.1.x (AI orchestration)
- Pinecone (vector database)
- OpenAI API (LLM + embeddings)

### Development
- pnpm (package manager)
- ESLint + Prettier (code quality)
- Vitest + React Testing Library (testing)
- Playwright (E2E testing)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start frontend development server
pnpm --filter web dev

# Run tests
pnpm --filter web test

# Build for production
pnpm --filter web build

# Lint and format
pnpm --filter web lint
pnpm --filter web format
```

## Documentation

- [Product Requirements Document](docs/prd/)
- [Architecture Document](docs/architecture/)
- [UI/UX Specification](docs/diego-portfolio-ux-spec.md)

## License

This project is for portfolio purposes.
