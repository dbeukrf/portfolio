# Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel
- **Build Command:** `pnpm --filter web build`
- **Output Directory:** `apps/web/dist`
- **CDN/Edge:** Vercel Edge Network (global)

**Backend Deployment:**
- **Platform:** Vercel Serverless Functions
- **Runtime:** Python 3.11
- **Function Location:** `apps/api/*.py`
- **Deployment Method:** Automatic via Vercel CLI or Git integration

**Deployment Triggers:**
- Push to `main` branch → Production deployment
- Pull requests → Preview deployments
- Manual deploys via Vercel CLI

## CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter web test
      - run: pnpm --filter web build

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: cd apps/api && pip install -r requirements.txt
      - run: cd apps/api && pytest

  e2e:
    runs-on: ubuntu-latest
    needs: [test-frontend, test-backend]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm --filter web test:e2e
```

**Vercel Deployment:**
```json
// vercel.json
{
  "buildCommand": "pnpm install && pnpm --filter web build",
  "devCommand": "pnpm --filter web dev",
  "installCommand": "pnpm install",
  "framework": "vite",
  "outputDirectory": "apps/web/dist",
  "functions": {
    "apps/api/*.py": {
      "runtime": "python3.11"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/apps/api/:path*"
    }
  ]
}
```

## Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|-------------|-------------|---------|
| **Development** | http://localhost:5173 | http://localhost:8000 | Local development |
| **Preview** | https://diego-portfolio-*-preview.vercel.app | Same (serverless) | PR previews, testing |
| **Production** | https://diego-portfolio.vercel.app | Same (serverless) | Live environment |

---
