# Test Strategy and Standards

## Testing Philosophy

**Approach:** Test-after development (not strict TDD) with focus on critical paths

**Coverage Goals:** 70% overall, 90% for chat/audio logic

**Test Pyramid:**
- Unit tests: 70%
- Integration tests: 20%
- E2E tests: 10%

## Test Types and Organization

### Unit Tests

**Framework:** Vitest + React Testing Library (frontend), pytest (backend)

**File Convention:** 
- Frontend: `ComponentName.test.tsx` colocated with component
- Backend: `tests/unit/test_service_name.py`

**Location:**
- Frontend: Colocated with source files
- Backend: `apps/api/tests/unit/`

**Coverage Requirement:** 70% minimum

**AI Agent Requirements:**
- Generate tests for all public functions
- Test happy path + error cases
- Mock all external dependencies (API calls, vector DB)
- Use AAA pattern (Arrange, Act, Assert)

**Example Frontend Test:**
```typescript
// AudioPlayer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import AudioPlayer from './AudioPlayer';

describe('AudioPlayer', () => {
  it('plays audio when play button clicked', () => {
    render(<AudioPlayer />);
    const playButton = screen.getByRole('button', { name: /play/i });
    
    fireEvent.click(playButton);
    
    expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument();
  });
});
```

**Example Backend Test:**
```python
# tests/unit/test_chat_service.py
import pytest
from services.chat_service import ChatService

@pytest.mark.asyncio
async def test_process_message_returns_response():
    service = ChatService()
    
    response = await service.process_message("What are Diego's skills?", [])
    
    assert response.message.role == "assistant"
    assert len(response.message.content) > 0
    assert len(response.suggested_questions) >= 3
```

### Integration Tests

**Scope:** Test interactions between components/services

**Location:**
- Frontend: `apps/web/tests/integration/`
- Backend: `apps/api/tests/integration/`

**Test Infrastructure:**
- **Frontend:** Mock Service Worker (MSW) for API mocking
- **Backend:** Test Pinecone index, mock OpenAI

**Example:**
```typescript
// tests/integration/chat-flow.test.tsx
it('sends message to API and displays response', async () => {
  render(<ChatInterface />);
  
  const input = screen.getByPlaceholderText(/type your question/i);
  fireEvent.change(input, { target: { value: 'What projects?' } });
  fireEvent.click(screen.getByText(/send/i));
  
  await waitFor(() => {
    expect(screen.getByText(/Diego has built/i)).toBeInTheDocument();
  });
});
```

### E2E Tests

**Framework:** Playwright

**Scope:** Critical user journeys

**Location:** `apps/web/tests/e2e/`

**Test Data:** Seed data or test environment

**Key Scenarios:**
1. Navigate between tracks
2. Play audio and see visualizations
3. Send chat message and receive response
4. Click project and view details
5. Use shuffle mode

**Example:**
```typescript
// tests/e2e/navigation.spec.ts
import { test, expect } from '@playwright/test';

test('user can navigate between tracks', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  await page.click('text=Track 2: Work Experience');
  await expect(page).toHaveURL(/\/track\/work/);
  await expect(page.locator('h1')).toContainText('Work Experience');
  
  await page.click('text=Next');
  await expect(page).toHaveURL(/\/track\/projects/);
});
```

## Test Data Management

**Strategy:** 
- Unit tests: Mock data in test files
- Integration: Shared fixtures in `tests/fixtures/`
- E2E: Seeded test data or mock API

**Fixtures:**
```typescript
// tests/fixtures/tracks.ts
export const mockTracks: Track[] = [
  {
    id: 'university',
    number: 1,
    title: 'University Years',
    // ... rest of mock data
  },
];
```

## Continuous Testing

**CI Integration:** GitHub Actions runs all tests on PR

**Performance Tests:** Not critical for portfolio, monitor via Vercel Analytics

**Security Tests:** Dependency scanning via Dependabot

---
