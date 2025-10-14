# Security and Performance

## Security Requirements

**Frontend Security:**
- **Content Security Policy (CSP):** Configure in Vercel headers
  ```
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https://diego-portfolio.vercel.app;
  ```
- **HTTPS Only:** Enforced by Vercel
- **XSS Prevention:** React's built-in escaping, avoid dangerouslySetInnerHTML
- **CORS Configuration:** Backend only accepts requests from production domain

**Backend Security:**
- **API Rate Limiting:** 10 requests/minute per IP (configurable)
  ```python
  from fastapi import Request
  from slowapi import Limiter
  from slowapi.util import get_remote_address
  
  limiter = Limiter(key_func=get_remote_address)
  
  @app.post("/api/chat")
  @limiter.limit("10/minute")
  async def chat_endpoint(request: Request, ...):
      ...
  ```
- **Input Validation:** Pydantic models validate all inputs
- **Secrets Management:** Environment variables, never in code
- **CORS Policy:** Whitelist production domains only
  ```python
  app.add_middleware(
      CORSMiddleware,
      allow_origins=["https://diego-portfolio.vercel.app"],
      allow_methods=["POST", "GET"],
      allow_headers=["Content-Type"],
  )
  ```

**Data Protection:**
- **No Sensitive Data:** Portfolio is public, no user auth or PII
- **API Keys:** Stored as Vercel environment variables
- **Logs:** No sensitive information logged

## Performance Optimization

**Frontend Performance:**

**Bundle Size Target:** < 200KB initial JS (gzipped)

**Techniques:**
- **Code Splitting:** Route-based splitting with React.lazy
  ```typescript
  const TrackView = lazy(() => import('./pages/TrackView'));
  const ChatInterface = lazy(() => import('./components/chat/ChatInterface'));
  ```
- **Tree Shaking:** Vite automatically removes unused code
- **Asset Optimization:**
  - Images: WebP format, lazy loading, responsive srcset
  - Audio: MP3 compressed to 128-192kbps, progressive streaming
- **Caching:** Static assets cached with long TTL (Vercel CDN)

**Runtime Performance:**
- **Visualization Optimization:**
  ```typescript
  // Use RAF for smooth 60fps
  const animate = () => {
    if (!isPlaying) return;
    
    analyser.getByteFrequencyData(frequencyData);
    drawVisualization(frequencyData);
    
    requestAnimationFrame(animate);
  };
  ```
- **Memoization:** React.memo for expensive components
- **Virtual Scrolling:** Not needed (content fits on screen)

**Backend Performance:**
- **Response Time Target:** < 2 seconds for chat API
- **Vector Search:** Pinecone optimized for < 50ms queries
- **LLM Streaming:** Consider streaming responses for < 1s perceived latency
- **Caching:** Cache common questions (Redis if needed in future)

**Monitoring:**
- **Vercel Analytics:** Core Web Vitals tracked automatically
- **Sentry:** Error tracking for frontend + backend
- **Custom Metrics:**
  - API response times
  - Chat satisfaction (implicit via conversation length)
  - Track navigation patterns

---
