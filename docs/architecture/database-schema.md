# Database Schema

## Vector Database (Pinecone)

**Index Name:** `diego-portfolio-knowledge`

**Dimensions:** 1536 (OpenAI text-embedding-3-small)

**Metric:** Cosine similarity

**Document Structure:**
```python
{
  "id": "doc_123",          # Unique document ID
  "values": [0.1, 0.2, ...], # 1536-dim embedding vector
  "metadata": {
    "text": str,            # Original text chunk
    "source": str,          # e.g., "resume", "project_xyz"
    "category": str,        # e.g., "education", "work", "skills"
    "date": str,            # ISO date if applicable
  }
}
```

**Knowledge Base Categories:**
- **resume:** Career summary, work history
- **education:** University, degrees, coursework
- **projects:** Project descriptions, technologies, outcomes
- **skills:** Technical skills with proficiency levels
- **interests:** Hobbies, music, personal interests

**Chunking Strategy:**
- Max chunk size: 500 tokens
- Overlap: 50 tokens
- Preserve semantic boundaries (don't split mid-sentence)

**Query Process:**
1. User question embedded with OpenAI
2. Vector similarity search (top-k=5)
3. Retrieved chunks passed as context to LLM
4. LLM generates grounded response

---
