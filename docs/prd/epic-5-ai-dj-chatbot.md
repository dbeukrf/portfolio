# Epic 5: AI DJ Chatbot

**Epic Goal:** Build and integrate an intelligent AI-powered chatbot that serves as a "DJ" guide, answering questions about Diego's background using vector database retrieval and natural language processing.

## Story 5.1: Set Up and Populate Vector Database

**As a** developer,  
**I want** to set up Pinecone with Diego's information embedded,  
**so that** the AI can retrieve relevant context to answer questions.

**Acceptance Criteria:**
1. Pinecone account created and API key obtained
2. Pinecone index created with correct dimensions (1536 for OpenAI embeddings)
3. Training data collected and prepared: resume, projects, university info, coursework, skills, interests, hobbies
4. Training data is chunked appropriately (max 500 tokens, 50 token overlap)
5. Knowledge base documents organized by category (education, work, projects, skills, interests)
6. Embeddings generated using OpenAI text-embedding-3-small
7. Embeddings stored in Pinecone with proper metadata (text, source, category, date)
8. Vector similarity search tested and returns relevant documents
9. Ingest script (`ingest_knowledge.py`) created for future updates
10. Documentation added explaining how to update knowledge base

## Story 5.2: Build FastAPI Chatbot Endpoint

**As a** developer,  
**I want** a FastAPI endpoint that processes chat queries,  
**so that** the frontend can communicate with the AI chatbot.

**Acceptance Criteria:**
1. POST endpoint accepts user messages and conversation history
2. Endpoint retrieves relevant context from vector database
3. Endpoint calls LLM (OpenAI/Anthropic) with context and query
4. Response is generated with friendly, casual, fun personality
5. Endpoint returns response with proper error handling
6. API response time is under 2 seconds
7. Rate limiting prevents abuse
8. CORS is configured for frontend access

## Story 5.3: Implement Chatbot Frontend UI

**As a** visitor,  
**I want** a chat interface to talk with the AI DJ,  
**so that** I can ask questions about Diego and get immediate answers.

**Acceptance Criteria:**
1. Chat interface is accessible from all track pages
2. Chat icon/button is prominently displayed
3. Chat window opens with welcoming message
4. User can type messages and send them
5. AI responses appear in conversation thread
6. Chat interface is styled to match portfolio aesthetic
7. Chat is accessible via keyboard
8. Mobile chat interface is optimized
9. Chat conversation history persists during session

## Story 5.4: Implement Two-Tier Response Pattern

**As a** visitor,  
**I want** to receive concise answers first with an option to get more details,  
**so that** I can control the depth of information I receive.

**Acceptance Criteria:**
1. Initial AI responses are concise summaries (2-3 sentences)
2. "Want more details?" or "Tell me more" button appears after each response
3. Clicking for more details provides expanded information
4. Expanded responses include additional context and examples
5. User can continue asking follow-up questions naturally
6. Conversation flow feels natural and not overly structured
7. Details expansion works correctly on mobile

## Story 5.5: Add Conversation Context and Suggested Questions

**As a** visitor,  
**I want** the chatbot to remember our conversation and suggest relevant questions,  
**so that** the experience feels intelligent and helpful.

**Acceptance Criteria:**
1. Chatbot maintains conversation history within session
2. Follow-up questions understand previous context
3. Suggested questions appear based on conversation topic
4. Suggested questions are clickable to auto-send
5. At least 3-5 suggested questions are available
6. Suggestions update based on conversation flow
7. Conversation can be reset/cleared by user

## Story 5.6: Add AI DJ Personality and Prompting

**As a** developer,  
**I want** the AI chatbot to have a consistent friendly, casual, fun personality,  
**so that** interactions feel personal and aligned with the "DJ" theme.

**Acceptance Criteria:**
1. System prompt defines AI DJ personality traits
2. AI uses casual, friendly language consistently
3. AI occasionally uses music/DJ-related metaphors naturally
4. AI avoids overly formal or robotic language
5. AI stays on-topic about Diego and doesn't hallucinate information
6. AI gracefully handles questions it can't answer
7. Personality testing confirms consistent tone across diverse questions

---
