# Diego Portfolio - Frontend

This is the frontend React application for Diego's music-themed portfolio website.

## Project Description

The Portfolio is a unique, music-themed portfolio website that showcases technical skills through an innovative experience. The frontend is built with React, TypeScript, and Vite, featuring:

- Spotify-style album view with 5 tracks
- Audio-reactive visualisations
- AI-powered chatbot interface
- Responsive design for all devices

## Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
pnpm dev
```

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:run` - Run tests once
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

## Technology Stack

- **Frontend Framework:** React 18.2.x
- **Language:** TypeScript 5.3.x
- **Build Tool:** Vite 5.0.x
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint + Prettier
- **Package Manager:** pnpm

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components/routes
├── hooks/         # Custom React hooks
├── stores/        # Zustand state stores
├── services/      # API client services
├── utils/         # Utility functions
├── styles/        # Global styles
├── data/          # Static data
└── test/          # Test setup and utilities
```
