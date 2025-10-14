# Error Handling Strategy

## General Approach

**Error Model:** Structured error responses with user-friendly messages

**Exception Hierarchy:**
- **Validation Errors:** 400 Bad Request (Pydantic handles this)
- **Rate Limit Errors:** 429 Too Many Requests
- **Server Errors:** 500 Internal Server Error (catch-all)

**Error Propagation:** Backend returns consistent error JSON, frontend displays user-friendly messages

## Logging Standards

**Library:** 
- Frontend: console (dev), Sentry (production)
- Backend: Python logging module + Sentry

**Log Format:**
```python
# Backend
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
```

**Levels:**
- **DEBUG:** Detailed technical info (only in development)
- **INFO:** General flow, successful operations
- **WARNING:** Potential issues, degraded performance
- **ERROR:** Errors that don't stop the service
- **CRITICAL:** Service-breaking errors

**Required Context:**
- Request ID (for tracing)
- User IP (for rate limiting debugging)
- Endpoint path
- Error stack traces (in production, sent to Sentry)

## Error Handling Patterns

### External API Errors (OpenAI, Pinecone)

**Retry Policy:**
```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def call_openai_api(prompt: str):
    # OpenAI API call
    ...
```

**Circuit Breaker:** Not needed initially (managed by Vercel timeouts)

**Timeout Configuration:** 30 seconds for LLM calls, 10 seconds for vector search

**Error Translation:**
```python
try:
    response = await openai_client.chat.completions.create(...)
except openai.RateLimitError:
    raise HTTPException(429, "AI DJ is busy, please wait a moment")
except openai.APIError as e:
    logger.error(f"OpenAI API error: {e}")
    raise HTTPException(500, "AI DJ is temporarily unavailable")
```

### Business Logic Errors

**Custom Exceptions:**
```python
class VectorSearchError(Exception):
    """Raised when vector search fails"""
    pass

class LLMGenerationError(Exception):
    """Raised when LLM generation fails"""
    pass
```

**User-Facing Errors:**
- Friendly messages, no technical jargon
- Suggest actions ("Please try again" vs "Vector DB timeout")

**Error Codes:** HTTP status codes sufficient, no custom error codes

### Data Consistency

**Transaction Strategy:** Not needed (stateless API, no database writes)

**Idempotency:** Chat requests are not idempotent (each generates new response)

---
