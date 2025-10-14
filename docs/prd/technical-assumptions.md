# Technical Assumptions

## Repository Structure

**Type:** Monorepo (recommended) or Polyrepo

**Rationale:** Monorepo allows shared TypeScript types between frontend and backend, easier local development, and coordinated deployments. However, polyrepo is acceptable if preferred for separation of concerns.

## Service Architecture

**Architecture:** Serverless functions for backend (API) + Static hosting for frontend

**Components:**
- **Frontend:** React SPA hosted on Firebase Hosting, Vercel, or S3+CloudFront
- **Backend API:** FastAPI deployed as serverless functions (Cloud Functions, Lambda, or Vercel Serverless)
- **Vector Database:** Managed Chroma DB or hosted solution
- **Storage:** Cloud storage for audio files and assets

**Rationale:** Serverless architecture provides cost-effectiveness for a portfolio site with variable traffic, automatic scaling, and simplified deployment.

## Testing Requirements

**Required Testing:**
- Unit tests for critical components and utilities
- Integration tests for AI chatbot functionality
- End-to-end tests for primary user flows
- Manual testing for audio/visual experience

**Testing Tools:**
- Frontend: Vitest or Jest + React Testing Library
- Backend: pytest for FastAPI
- E2E: Playwright or Cypress

**Coverage Goals:**
- Minimum 70% code coverage for critical paths
- 100% coverage for AI chatbot logic

## Additional Technical Assumptions and Requests

**Frontend:**
- React 18+ with TypeScript
- Vite for build tooling and dev server
- Web Audio API for audio analysis
- Canvas or WebGL for visualizations (Three.js optional)
- State management: Context API or Zustand (lightweight)
- Styling: TailwindCSS or styled-components (TBD)

**Backend:**
- Python 3.11+
- FastAPI for API endpoints
- LangChain for AI orchestration
- Chroma DB for vector storage
- OpenAI or similar for embeddings and chat completion

**Infrastructure:**
- Docker for local development and deployment
- GitHub Actions or similar for CI/CD
- Environment-based configuration
- Secrets management (env variables, cloud secrets manager)

**Performance:**
- Code splitting for optimal load times
- Lazy loading for track content
- Optimized audio file formats (compressed, streaming-ready)
- CDN for static assets
- Image optimization

**Security:**
- HTTPS only
- API rate limiting
- Input validation and sanitization
- CORS configuration
- Secure secrets management
