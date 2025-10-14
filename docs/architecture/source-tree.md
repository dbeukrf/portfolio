# Source Tree

## Unified Project Structure

```
diego-portfolio/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Run tests on PR
│       └── deploy.yml                # Deploy to Vercel on merge
│
├── apps/
│   ├── web/                          # Frontend React application
│   │   ├── public/
│   │   │   ├── audio/                # Audio files for each track
│   │   │   │   ├── track-1-university.mp3
│   │   │   │   ├── track-2-work.mp3
│   │   │   │   ├── track-3-projects.mp3
│   │   │   │   ├── track-4-skills.mp3
│   │   │   │   └── track-5-hobbies.mp3
│   │   │   ├── images/               # Static images
│   │   │   └── favicon.ico
│   │   │
│   │   ├── src/
│   │   │   ├── components/           # Reusable UI components
│   │   │   │   ├── audio/
│   │   │   │   │   ├── AudioPlayer.tsx
│   │   │   │   │   ├── AudioControls.tsx
│   │   │   │   │   └── Visualization.tsx
│   │   │   │   ├── chat/
│   │   │   │   │   ├── ChatInterface.tsx
│   │   │   │   │   ├── ChatMessage.tsx
│   │   │   │   │   └── ChatInput.tsx
│   │   │   │   ├── navigation/
│   │   │   │   │   ├── TrackList.tsx
│   │   │   │   │   ├── TrackNavigation.tsx
│   │   │   │   │   └── ShuffleButton.tsx
│   │   │   │   ├── projects/
│   │   │   │   │   ├── ProjectCard.tsx
│   │   │   │   │   ├── ProjectGrid.tsx
│   │   │   │   │   └── ProjectDetailModal.tsx
│   │   │   │   ├── tracks/
│   │   │   │   │   ├── TrackCard.tsx
│   │   │   │   │   └── TrackHeader.tsx
│   │   │   │   └── ui/               # Shared UI primitives
│   │   │   │       ├── Button.tsx
│   │   │   │       ├── Modal.tsx
│   │   │   │       └── Card.tsx
│   │   │   │
│   │   │   ├── pages/                # Page components/routes
│   │   │   │   ├── AlbumView.tsx     # Landing page
│   │   │   │   ├── TrackView.tsx     # Individual track pages
│   │   │   │   └── NotFound.tsx      # 404 page
│   │   │   │
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   │   ├── useAudioPlayer.ts
│   │   │   │   ├── useVisualization.ts
│   │   │   │   ├── useChat.ts
│   │   │   │   └── useKeyboardShortcuts.ts
│   │   │   │
│   │   │   ├── stores/               # Zustand state stores
│   │   │   │   ├── audioStore.ts     # Audio playback state
│   │   │   │   └── chatStore.ts      # Chat conversation state
│   │   │   │
│   │   │   ├── services/             # API client services
│   │   │   │   └── chatService.ts    # Axios API calls
│   │   │   │
│   │   │   ├── utils/                # Utility functions
│   │   │   │   ├── audioUtils.ts     # Audio processing helpers
│   │   │   │   ├── visualizationUtils.ts
│   │   │   │   └── formatters.ts     # Date, time formatting
│   │   │   │
│   │   │   ├── styles/               # Global styles
│   │   │   │   └── globals.css       # Tailwind imports, custom CSS
│   │   │   │
│   │   │   ├── data/                 # Static data
│   │   │   │   ├── tracks.ts         # TRACKS constant
│   │   │   │   ├── projects.ts       # PROJECTS constant
│   │   │   │   └── skills.ts         # SKILLS constant
│   │   │   │
│   │   │   ├── App.tsx               # Root component
│   │   │   ├── main.tsx              # Entry point
│   │   │   └── vite-env.d.ts         # Vite type declarations
│   │   │
│   │   ├── tests/                    # Frontend tests
│   │   │   ├── unit/                 # Component unit tests
│   │   │   ├── integration/          # Integration tests
│   │   │   └── e2e/                  # Playwright E2E tests
│   │   │
│   │   ├── .env.example              # Environment variables template
│   │   ├── .env.local                # Local env (gitignored)
│   │   ├── index.html                # HTML entry point
│   │   ├── package.json
│   │   ├── tsconfig.json             # TypeScript config
│   │   ├── tsconfig.node.json
│   │   ├── vite.config.ts            # Vite configuration
│   │   ├── tailwind.config.js        # Tailwind configuration
│   │   ├── postcss.config.js
│   │   └── README.md
│   │
│   └── api/                          # Backend Python serverless functions
│       ├── chat.py                   # POST /api/chat endpoint
│       ├── health.py                 # GET /api/health endpoint
│       │
│       ├── services/
│       │   ├── chat_service.py       # Chat business logic
│       │   ├── vector_store_service.py # Pinecone operations
│       │   └── llm_service.py        # OpenAI LLM calls
│       │
│       ├── models/
│       │   └── schemas.py            # Pydantic models
│       │
│       ├── utils/
│       │   ├── prompts.py            # System prompt templates
│       │   └── rate_limit.py         # Rate limiting logic
│       │
│       ├── scripts/
│       │   ├── ingest_knowledge.py   # Script to populate vector DB
│       │   └── test_embeddings.py    # Test vector search
│       │
│       ├── data/
│       │   ├── resume.txt            # Source data for embeddings
│       │   ├── projects.txt
│       │   ├── skills.txt
│       │   └── interests.txt
│       │
│       ├── requirements.txt          # Python dependencies
│       ├── .env.example
│       ├── .env                      # Local env (gitignored)
│       └── README.md
│
├── packages/
│   └── shared/                       # Shared TypeScript types
│       ├── src/
│       │   └── types/
│       │       ├── Track.ts
│       │       ├── Project.ts
│       │       ├── Chat.ts
│       │       └── Audio.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── docs/                             # Project documentation
│   ├── prd.md                        # Product Requirements Document
│   ├── front-end-spec.md             # UI/UX Specification
│   ├── architecture.md               # This document
│   └── brainstorming-session-results.md
│
├── scripts/                          # Build/utility scripts
│   └── setup-local.sh                # Local development setup
│
├── .gitignore
├── .prettierrc                       # Prettier configuration
├── .eslintrc.json                    # ESLint configuration
├── pnpm-workspace.yaml               # pnpm workspace config
├── package.json                      # Root package.json
├── vercel.json                       # Vercel deployment config
└── README.md                         # Project overview
```

---
