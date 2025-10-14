# Components

## Frontend Component Architecture

The frontend is organized into a clear component hierarchy with separation of concerns.

### Component: App

**Responsibility:** Root component, routing setup, global providers

**Key Interfaces:**
- Routes configuration
- Global state providers (Zustand, Theme)
- Error boundaries

**Dependencies:** React Router, Zustand stores

**Technology Stack:** React 18, TypeScript, React Router v6

---

### Component: AudioPlayer

**Responsibility:** Global audio playback controls and state management

**Key Interfaces:**
- `play(): void` - Start playback
- `pause(): void` - Pause playback
- `seek(time: number): void` - Jump to specific time
- `setVolume(volume: number): void` - Adjust volume (0-1)
- `toggleMute(): void` - Mute/unmute
- `loadTrack(trackId: TrackId): void` - Load new track audio

**Dependencies:** 
- Zustand audio store
- Web Audio API
- Browser HTMLAudioElement

**Technology Stack:** React, Web Audio API, Zustand

**Implementation Note:** Uses Web Audio API AudioContext for analysis while playing audio through HTMLAudioElement for reliability.

---

### Component: Visualization

**Responsibility:** Real-time audio-reactive visual display using Canvas

**Key Interfaces:**
- Props: `frequencyData: Uint8Array`, `style: 'bars' | 'waveform' | 'radial'`
- Renders to Canvas element
- Updates at 60fps using requestAnimationFrame

**Dependencies:**
- Audio state from Zustand (frequency/time domain data)
- Canvas 2D rendering context

**Technology Stack:** React, Canvas API, requestAnimationFrame

**Performance:** Optimized rendering, only updates when audio playing, uses offscreen canvas if needed

---

### Component: TrackView

**Responsibility:** Display individual track content with layout and navigation

**Key Interfaces:**
- Props: `trackId: TrackId`
- Renders track header, content, audio controls
- Handles track navigation

**Dependencies:**
- Track data (from TRACKS constant)
- AudioPlayer component
- Visualization component
- Navigation components

**Technology Stack:** React, React Router, TailwindCSS

---

### Component: ChatInterface

**Responsibility:** AI DJ chat UI, message display, user input

**Key Interfaces:**
- `sendMessage(message: string): Promise<void>`
- Displays conversation history
- Handles message submission
- Shows typing indicator

**Dependencies:**
- Axios for API calls
- Chat state (local or Zustand)

**Technology Stack:** React, Axios, React Hook Form

---

### Component: ProjectCard & ProjectDetailModal

**Responsibility:** Display project information, handle detail view

**Key Interfaces:**
- ProjectCard Props: `project: Project`, `onClick: () => void`
- Modal Props: `project: Project`, `isOpen: boolean`, `onClose: () => void`

**Dependencies:**
- Headless UI for modal
- Project data

**Technology Stack:** React, Headless UI, TailwindCSS

---

## Backend Component Architecture

### Component: ChatRouter (FastAPI Router)

**Responsibility:** Handle chat API endpoints

**Key Interfaces:**
- POST `/api/chat` endpoint
- Request validation (Pydantic models)
- Response formatting

**Dependencies:**
- ChatService
- Rate limiting middleware

**Technology Stack:** FastAPI, Pydantic

---

### Component: ChatService

**Responsibility:** Business logic for AI chat interactions

**Key Interfaces:**
- `async process_message(message: str, history: List[Message]) -> ChatResponse`
- Orchestrates RAG pipeline
- Formats responses

**Dependencies:**
- VectorStoreService
- LLMService

**Technology Stack:** LangChain, Python async

---

### Component: VectorStoreService

**Responsibility:** Vector database operations (embed, store, query)

**Key Interfaces:**
- `async query(text: str, k: int) -> List[Document]`
- Retrieves relevant context from knowledge base

**Dependencies:**
- Pinecone client
- OpenAI embeddings

**Technology Stack:** LangChain, Pinecone, OpenAI

---

### Component: LLMService

**Responsibility:** LLM API calls and response generation

**Key Interfaces:**
- `async generate_response(query: str, context: str, history: List[Message]) -> str`
- Constructs prompts with system instructions
- Handles streaming responses (if needed)

**Dependencies:**
- OpenAI API client
- Prompt templates

**Technology Stack:** LangChain, OpenAI GPT-4 Turbo

---
