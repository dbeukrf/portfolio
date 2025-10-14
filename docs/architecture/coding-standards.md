# Coding Standards

These standards are **MANDATORY** for AI agents. Focus on project-specific conventions and gotchas.

## Core Standards

**Languages & Runtimes:**
- **Frontend:** TypeScript 5.3.x (strict mode enabled)
- **Backend:** Python 3.11.x (type hints required)

**Style & Linting:**
- **Frontend:** ESLint + Prettier (config in repo)
- **Backend:** Black formatter, flake8 linter

**Test Organization:**
- **Frontend:** `.test.tsx` files colocated with components
- **Backend:** `tests/` directory, mirror source structure

## Critical Rules

**Rule 1: No localStorage or sessionStorage**
- **Why:** Not needed for this portfolio
- **Alternative:** Zustand persists to memory only during session

**Rule 2: All API responses must use consistent error format**
```typescript
interface ApiError {
  error: string;
  details?: Record<string, any>;
}
```

**Rule 3: Audio visualizations must use requestAnimationFrame**
- **Why:** Ensures smooth 60fps, doesn't block main thread
- **Never:** Use setInterval or setTimeout for animations

**Rule 4: Never call LLM without context from vector DB**
- **Why:** Prevents hallucinations, grounds responses in facts
- **Always:** Retrieve context first, then pass to LLM

**Rule 5: All imports from shared package must use @shared alias**
```typescript
// Correct
import { Track } from '@shared/types/Track';

// Incorrect
import { Track } from '../../packages/shared/src/types/Track';
```

**Rule 6: Component files must export default the main component**
```typescript
// TrackView.tsx
export default function TrackView() { ... }
```

**Rule 7: Environment variables must be validated at startup**
```python
# Backend
from pydantic import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str
    pinecone_api_key: str
    
    class Config:
        env_file = ".env"

settings = Settings()  # Raises error if vars missing
```

## Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| **Components** | PascalCase | - | `AudioPlayer.tsx` |
| **Hooks** | camelCase, prefix "use" | - | `useAudioPlayer.ts` |
| **API Routes** | - | snake_case | `apps/api/chat.py` |
| **Functions** | camelCase | snake_case | `loadTrack()`, `process_message()` |
| **Constants** | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `TRACKS`, `MAX_RETRIES` |
| **Types/Interfaces** | PascalCase | PascalCase | `AudioState`, `ChatMessage` |

---
