# Data Models

## Shared TypeScript Interfaces

These interfaces are defined in `packages/shared/src/types/` and shared between frontend and backend (FastAPI Pydantic models mirror these).

### Track Model

```typescript
// packages/shared/src/types/Track.ts

export type TrackId = 'university' | 'work' | 'projects' | 'skills' | 'hobbies';

export interface Track {
  id: TrackId;
  number: number;
  title: string;
  description: string;
  audioUrl: string;
  duration: number; // in seconds
  mood: string; // e.g., "Foundation & Learning", "Professional Growth"
  backgroundColor?: string; // Optional custom background color
}

export const TRACKS: Track[] = [
  {
    id: 'university',
    number: 1,
    title: 'University Years',
    description: 'Foundation & Learning',
    audioUrl: '/audio/track-1-university.mp3',
    duration: 180,
    mood: 'foundation',
  },
  // ... other tracks
];
```

**Purpose:** Represents each of the 5 portfolio tracks/sections

**Relationships:**
- Has associated content (rendered by track-specific components)
- Has audio file (played via AudioPlayer)
- Referenced in navigation and playback state

---

### Project Model

```typescript
// packages/shared/src/types/Project.ts

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  techStack: string[]; // e.g., ['React', 'TypeScript', 'FastAPI']
  tags: string[]; // e.g., ['Web', 'AI', 'Full-Stack']
  imageUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  caseStudyUrl?: string;
  featured: boolean;
  completedDate: string; // ISO date string
}
```

**Purpose:** Represents Diego's projects showcased in Track 3

**Relationships:**
- Displayed as ProjectCards in Track 3
- Clicked projects open ProjectDetailModal
- Filterable by techStack or tags

---

### ChatMessage Model

```typescript
// packages/shared/src/types/Chat.ts

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number; // Unix timestamp
  isExpanded?: boolean; // For two-tier responses
  detailedContent?: string; // Extended response content
  suggestedQuestions?: string[]; // Follow-up suggestions
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

export interface ChatResponse {
  message: ChatMessage;
  suggestedQuestions: string[];
}
```

**Purpose:** Represents AI DJ chat messages and conversations

**Relationships:**
- ChatConversation contains array of ChatMessages
- ChatRequest sent to backend API
- ChatResponse received from backend, appended to conversation

---

### AudioState Model

```typescript
// packages/shared/src/types/Audio.ts

export type PlaybackState = 'playing' | 'paused' | 'loading' | 'error';

export interface AudioState {
  currentTrack: TrackId | null;
  playbackState: PlaybackState;
  currentTime: number; // seconds
  duration: number; // seconds
  volume: number; // 0-1
  isMuted: boolean;
  isShuffleOn: boolean;
  visualizationData: {
    frequencyData: Uint8Array;
    timeDomainData: Uint8Array;
  } | null;
}
```

**Purpose:** Global audio playback state managed by Zustand

**Relationships:**
- Consumed by AudioPlayer component
- Consumed by Visualization components
- Updated by audio event handlers

---
