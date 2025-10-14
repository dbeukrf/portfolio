# API Specification

## REST API Endpoints

Base URL: `https://diego-portfolio.vercel.app/api`

### POST /api/chat

**Purpose:** Send a message to the AI DJ chatbot

**Request:**
```typescript
{
  message: string;           // User's question
  conversationHistory: ChatMessage[];  // Previous messages for context
}
```

**Response (200 OK):**
```typescript
{
  message: {
    id: string;
    role: 'assistant';
    content: string;         // AI DJ's response (summary)
    timestamp: number;
    detailedContent?: string; // Expanded response (if applicable)
    suggestedQuestions: string[];
  };
  suggestedQuestions: string[];  // Array of 3-5 follow-up questions
}
```

**Response (429 Too Many Requests):**
```typescript
{
  error: "Rate limit exceeded. Please wait before sending another message.";
}
```

**Response (500 Internal Server Error):**
```typescript
{
  error: "AI DJ is temporarily unavailable. Please try again later.";
}
```

**Authentication:** None (public endpoint with rate limiting)

**Rate Limiting:** 10 requests per minute per IP address

**Example Request:**
```bash
curl -X POST https://diego-portfolio.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What programming languages does Diego know?",
    "conversationHistory": []
  }'
```

---

### GET /api/health

**Purpose:** Health check endpoint for monitoring

**Response (200 OK):**
```typescript
{
  status: 'healthy';
  timestamp: number;
  version: string;
}
```

---
