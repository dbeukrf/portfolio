"""
Chatbot service module with optimized initialization for fast startup.

This module handles all chatbot-related operations including:
- Fast initialization of core components (LLM, embeddings, vector store)
- Background document loading
- Document retrieval and RAG operations
"""

import os
import asyncio
import sys
from pathlib import Path
from typing import Optional, List, Tuple, Any
from datetime import datetime, timedelta
from collections import defaultdict
import tiktoken
from uuid import uuid4
import threading
import time

from langchain_openai import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from langchain_chroma import Chroma
import chromadb
from langchain_community.document_loaders import (
    PyPDFDirectoryLoader,
    DirectoryLoader,
    TextLoader
)
from langchain_text_splitters import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter

# Path configuration
backend_dir = Path(__file__).parent.parent.parent
project_root = backend_dir.parent.parent
DATA_PATH = project_root / "data"
CHROMA_PATH = backend_dir / "chroma_db"

# RAG Configuration - optimized for performance
RAG_CONFIG = {
    "chunk_size": 1000,
    "chunk_overlap": 175,
    "embedding_model": "text-embedding-3-small",
    "retrieval_k": 4,
    "mmr_enabled": False,
    "mmr_lambda": 0.5,
    "temperature": {
        "factual": 0.0,
        "conversational": 0.3,
        "creative": 0.5,
    },
}

# Global components
llm: Optional[ChatOpenAI] = None
vector_store: Optional[Chroma] = None
retriever: Optional[Any] = None
embeddings_model: Optional[OpenAIEmbeddings] = None
_chroma_client: Optional[chromadb.PersistentClient] = None
_client_lock = threading.Lock()

def get_chroma_client() -> chromadb.PersistentClient:
    """Get or create singleton ChromaDB client with thread safety"""
    global _chroma_client
    with _client_lock:
        if _chroma_client is None:
            print("[Chatbot] Creating new ChromaDB client...", flush=True)
            _chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
        return _chroma_client

# State tracking
class ChatbotState:
    """Track chatbot initialization and readiness state"""
    
    def __init__(self):
        self.status = "not_started"  # not_started, initializing, ready, failed
        self.error_message: Optional[str] = None
        self.core_ready = False  # LLM, embeddings, vector_store initialized
        self.documents_ready = False  # Documents loaded/verified
        self.initialization_started = False
        self.initialization_completed = False
    
    def set_core_ready(self):
        """Mark core components as ready"""
        self.core_ready = True
        if self.documents_ready:
            self.status = "ready"
            self.initialization_completed = True
    
    def set_documents_ready(self):
        """Mark documents as ready"""
        self.documents_ready = True
        if self.core_ready:
            self.status = "ready"
            self.initialization_completed = True
    
    def set_failed(self, error_message: str):
        """Mark initialization as failed"""
        self.status = "failed"
        self.error_message = error_message
        self.initialization_completed = True
    
    def is_ready(self) -> bool:
        """Check if chatbot is fully ready"""
        return self.status == "ready" and self.core_ready and self.documents_ready
    
    def get_status(self) -> dict:
        """Get current status as dictionary"""
        return {
            "status": self.status,
            "core_ready": self.core_ready,
            "documents_ready": self.documents_ready,
            "initialization_started": self.initialization_started,
            "initialization_completed": self.initialization_completed,
            "error_message": self.error_message
        }

chatbot_state = ChatbotState()


# Token Management
class TokenManager:
    """Manage token usage and enforce limits"""
    
    def __init__(self, model: str = "gpt-4o-mini"):
        try:
            self.encoder = tiktoken.encoding_for_model(model)
        except Exception:
            # Fallback for unknown models
            self.encoder = tiktoken.get_encoding("cl100k_base")
        self.max_input_tokens = 1500
        self.max_output_tokens = 500
        self.max_context_tokens = 3000
    
    def count_tokens(self, text: str) -> int:
        """Count tokens in text"""
        return len(self.encoder.encode(text))
    
    def validate_input(self, text: str) -> Tuple[bool, str]:
        """Validate input doesn't exceed token limits"""
        token_count = self.count_tokens(text)
        if token_count > self.max_input_tokens:
            return False, f"Input exceeds {self.max_input_tokens} tokens ({token_count} tokens)"
        return True, ""
    
    def truncate_context(self, context: str) -> str:
        """Truncate context to fit within limits"""
        tokens = self.encoder.encode(context)
        if len(tokens) > self.max_context_tokens:
            truncated_tokens = tokens[:self.max_context_tokens]
            return self.encoder.decode(truncated_tokens)
        return context

token_manager = TokenManager()


# Rate Limiting
class RateLimiter:
    """Rate limit requests per IP"""
    
    def __init__(self):
        self.requests = defaultdict(list)
        self.blocked_ips = {}
    
    def check_rate_limit(self, identifier: str, max_requests: int = 20, window_minutes: int = 1) -> Tuple[bool, str]:
        """Check if request is within rate limits"""
        now = datetime.now()
        
        # Check if IP is blocked
        if identifier in self.blocked_ips:
            blocked_until = self.blocked_ips[identifier]
            if now < blocked_until:
                return False, f"Blocked until {blocked_until.strftime('%H:%M:%S')}"
            else:
                del self.blocked_ips[identifier]
        
        # Clean old requests
        cutoff = now - timedelta(minutes=window_minutes)
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if req_time > cutoff
        ]
        
        # Check rate limit
        if len(self.requests[identifier]) >= max_requests:
            self.blocked_ips[identifier] = now + timedelta(minutes=5)
            return False, f"Rate limit exceeded: {max_requests} requests per {window_minutes} minute(s)"
        
        # Log request
        self.requests[identifier].append(now)
        return True, ""

rate_limiter = RateLimiter()


def initialize_core_components() -> bool:
    """
    Initialize core chatbot components (LLM, embeddings, vector store).
    This is fast (~1-2 seconds) and should be done synchronously.
    """
    global llm, vector_store, retriever, embeddings_model
    
    try:
        print("[Chatbot] Initializing core components...", flush=True)
        
        # Validate API key
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key or openai_api_key == "your_openai_api_key_here":
            error_msg = "OPENAI_API_KEY environment variable is not set or is using placeholder value."
            print(f"[Chatbot] ERROR: {error_msg}", flush=True)
            raise ValueError(error_msg)
        
        os.environ["OPENAI_API_KEY"] = openai_api_key
        
        # Optional LangChain tracing
        langchain_api_key = os.getenv("LANGCHAIN_API_KEY")
        if langchain_api_key and langchain_api_key != "your_langchain_api_key_here":
            os.environ["LANGCHAIN_API_KEY"] = langchain_api_key
            os.environ["LANGCHAIN_TRACING_V2"] = "true"
            import warnings
            warnings.filterwarnings("ignore", message=".*LangSmith now uses UUID v7.*")
        
        # Initialize LLM
        llm = ChatOpenAI(
            temperature=RAG_CONFIG["temperature"]["conversational"],
            model='gpt-4o-mini',
            max_tokens=500,
            top_p=0.9,
            frequency_penalty=0.3,
        )
        print("[Chatbot] LLM initialized", flush=True)
        
        # Initialize embeddings
        embeddings_model = OpenAIEmbeddings(model=RAG_CONFIG["embedding_model"])
        print("[Chatbot] Embeddings model initialized", flush=True)
        
        # Initialize vector store with explicit client
        # This avoids issues with the default LangChain Chroma wrapper
        try:
            client = get_chroma_client()
            vector_store = Chroma(
                client=client,
                collection_name="diego_portfolio",
                embedding_function=embeddings_model,
                collection_metadata={"hnsw:space": "cosine"}
            )
            print("[Chatbot] Vector store initialized with explicit client", flush=True)
        except Exception as e:
            print(f"[Chatbot] Failed to init Chroma with client, falling back: {e}", flush=True)
            # Fallback to creating a new client if singleton fails for some reason
            vector_store = Chroma(
                collection_name="diego_portfolio",
                embedding_function=embeddings_model,
                persist_directory=str(CHROMA_PATH),
                collection_metadata={"hnsw:space": "cosine"}
            )
            print("[Chatbot] Vector store initialized (fallback)", flush=True)
        
        # Set up retriever
        if RAG_CONFIG["mmr_enabled"]:
            retriever = vector_store.as_retriever(
                search_type="mmr",
                search_kwargs={
                    'k': RAG_CONFIG["retrieval_k"],
                    'lambda_mult': RAG_CONFIG["mmr_lambda"],
                }
            )
        else:
            retriever = vector_store.as_retriever(
                search_kwargs={'k': RAG_CONFIG["retrieval_k"]}
            )
        print("[Chatbot] Retriever configured", flush=True)
        
        chatbot_state.set_core_ready()
        print("[Chatbot] Core components ready!", flush=True)
        return True
        
    except Exception as e:
        error_str = str(e).encode('ascii', 'replace').decode('ascii')
        print(f"[Chatbot] ERROR initializing core components: {error_str}", flush=True)
        chatbot_state.set_failed(f"Core initialization failed: {error_str}")
        return False


def check_documents_exist_sync() -> Tuple[bool, int]:
    """
    Robust check for existing documents in ChromaDB.
    Uses file system check first to avoid blocking on DB locks.
    """
    try:
        # 1. Check if directory exists
        if not CHROMA_PATH.exists():
            print(f"[Chatbot] ChromaDB directory not found at {CHROMA_PATH}", flush=True)
            return False, 0
            
        # 2. Check for sqlite3 file (fastest and safest check)
        sqlite_path = CHROMA_PATH / "chroma.sqlite3"
        if not sqlite_path.exists():
            print(f"[Chatbot] chroma.sqlite3 not found at {sqlite_path}", flush=True)
            return False, 0
            
        # If the file exists and has size > 0, we assume documents exist
        # This avoids connecting to the DB which might be locked
        if sqlite_path.stat().st_size > 0:
            # We return 1 as a placeholder count to indicate existence
            # The exact count isn't strictly necessary for initialization
            return True, 1
            
        return False, 0

    except Exception as e:
        print(f"[Chatbot] Document check failed: {str(e)}", flush=True)
        return False, 0


async def check_documents_exist_fast() -> Tuple[bool, int]:
    """
    Async wrapper for document check with timeout.
    This prevents hanging if the vector store is slow.
    """
    try:
        loop = asyncio.get_running_loop()
        result = await asyncio.wait_for(
            loop.run_in_executor(None, check_documents_exist_sync),
            timeout=3.0  # 3 second timeout - if it takes longer, assume no documents
        )
        return result
    except asyncio.TimeoutError:
        print("[Chatbot] Document check timed out (assuming no documents)", flush=True)
        return False, 0
    except Exception as e:
        print(f"[Chatbot] Document check error: {str(e)[:100]}", flush=True)
        return False, 0


def split_markdown_documents(documents):
    """Split markdown documents using header-based splitting with progress tracking"""
    if not documents:
        return []

    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    
    markdown_splitter = MarkdownHeaderTextSplitter(
        headers_to_split_on=headers_to_split_on,
        strip_headers=False
    )
    
    all_splits = []
    total_docs = len(documents)
    
    for idx, doc in enumerate(documents, 1):
        try:
            # Show progress every 5 documents
            if idx % 5 == 0 or idx == total_docs:
                print(f"[Chatbot] Splitting markdown document {idx}/{total_docs}...", flush=True)
            
            header_splits = markdown_splitter.split_text(doc.page_content)
            
            # Ensure we have Document objects
            from langchain_core.documents import Document
            processed_splits = []
            for split in header_splits:
                if isinstance(split, str):
                    split = Document(page_content=split, metadata=doc.metadata.copy())
                else:
                    split.metadata.update(doc.metadata)
                processed_splits.append(split)
            
            header_splits = processed_splits
            
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=RAG_CONFIG["chunk_size"],
                chunk_overlap=RAG_CONFIG["chunk_overlap"],
                length_function=len,
                separators=["\n\n", "\n", ". ", " ", ""],
            )
            
            final_splits = text_splitter.split_documents(header_splits)
            all_splits.extend(final_splits)
        except Exception as e:
            # Fallback to recursive splitting if header splitting fails
            print(f"[Chatbot] Header splitting failed for document {idx}, using fallback: {str(e)[:100]}", flush=True)
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=RAG_CONFIG["chunk_size"],
                chunk_overlap=RAG_CONFIG["chunk_overlap"]
            )
            all_splits.extend(text_splitter.split_documents([doc]))
    
    print(f"[Chatbot] Split {total_docs} markdown documents into {len(all_splits)} chunks", flush=True)
    return all_splits


def add_metadata(chunks, source_file):
    """Add rich metadata to chunks for better filtering and retrieval"""
    category_map = {
        'professional_summary': 'summary',
        'work_experience': 'work',
        'projects': 'projects',
        'education_awards': 'education',
        'goals_vision': 'goals',
        'challenges': 'challenges',
        'hobbies': 'hobbies',
    }
    
    category = 'general'
    for key, value in category_map.items():
        if key in source_file.lower():
            category = value
            break
    
    for chunk in chunks:
        chunk.metadata['source_file'] = source_file
        chunk.metadata['category'] = category
        
        content_lower = chunk.page_content.lower()
        topics = []
        
        if any(word in content_lower for word in ['python', 'javascript', 'java', 'react', 'fastapi']):
            topics.append('technical_skills')
        if any(word in content_lower for word in ['ai', 'agent', 'llm', 'langchain', 'rag']):
            topics.append('ai_ml')
        if any(word in content_lower for word in ['project', 'built', 'developed', 'created']):
            topics.append('projects')
        if any(word in content_lower for word in ['music', 'film', 'creative', 'artistic']):
            topics.append('creative')
        
        chunk.metadata['topics'] = ','.join(topics) if topics else 'general'
    
    return chunks


def load_pdf_documents_sync() -> List:
    """Load PDF documents (synchronous, to be called with timeout)"""
    import pypdf
    pdf_loader = PyPDFDirectoryLoader(str(DATA_PATH))
    return pdf_loader.load()


def load_text_documents_sync() -> List:
    """Load text documents (synchronous, to be called with timeout)"""
    txt_loader = DirectoryLoader(
        str(DATA_PATH),
        glob="**/*.txt",
        loader_cls=TextLoader
    )
    return txt_loader.load()


def load_markdown_documents_sync() -> List:
    """Load markdown documents (synchronous, to be called with timeout)"""
    md_loader = DirectoryLoader(
        str(DATA_PATH),
        glob="**/*.md",
        loader_cls=lambda path: TextLoader(path, encoding="utf-8")
    )
    return md_loader.load()


async def load_documents_with_timeout(loader_func, doc_type: str, timeout: float = 60.0) -> List:
    """Load documents with timeout protection"""
    try:
        print(f"[Chatbot] Loading {doc_type} documents...", flush=True)
        loop = asyncio.get_running_loop()
        docs = await asyncio.wait_for(
            loop.run_in_executor(None, loader_func),
            timeout=timeout
        )
        print(f"[Chatbot] Loaded {len(docs)} {doc_type} documents", flush=True)
        return docs
    except asyncio.TimeoutError:
        print(f"[Chatbot] {doc_type} document loading timed out after {timeout}s - skipping", flush=True)
        return []
    except ImportError as e:
        if "pypdf" in str(e):
            print("[Chatbot] pypdf package not found. Install it with: pip install pypdf", flush=True)
            print("[Chatbot] Skipping PDF documents.", flush=True)
        return []
    except Exception as e:
        error_msg = str(e).encode('ascii', 'replace').decode('ascii')
        print(f"[Chatbot] Could not load {doc_type} documents: {error_msg[:200]}", flush=True)
        return []


async def ingest_documents_async() -> bool:
    """Asynchronously ingest documents into vector store with timeout protection"""
    global vector_store
    
    try:
        # Check if data directory exists
        if not DATA_PATH.exists():
            print(f"[Chatbot] Data directory not found at {DATA_PATH}", flush=True)
            return False
        
        if not DATA_PATH.is_dir():
            print(f"[Chatbot] Data path exists but is not a directory: {DATA_PATH}", flush=True)
            return False
        
        print(f"[Chatbot] Loading documents from {DATA_PATH}...", flush=True)
        print("[Chatbot] This may take a moment if there are many files...", flush=True)
        
        raw_documents = []
        markdown_docs = []
        
        # Load documents with individual timeouts (60 seconds each)
        # Each loader runs independently so one failure doesn't block others
        
        # Load PDF documents
        pdf_docs = await load_documents_with_timeout(
            load_pdf_documents_sync, 
            "PDF", 
            timeout=60.0
        )
        raw_documents.extend(pdf_docs)
        
        # Load text documents
        txt_docs = await load_documents_with_timeout(
            load_text_documents_sync,
            "text",
            timeout=60.0
        )
        raw_documents.extend(txt_docs)
        
        # Load markdown documents separately
        markdown_docs = await load_documents_with_timeout(
            load_markdown_documents_sync,
            "markdown",
            timeout=60.0
        )
        
        # Check if we have any documents at all
        total_docs = len(raw_documents) + len(markdown_docs)
        if total_docs == 0:
            print("[Chatbot] No documents found in data directory", flush=True)
            return False
        
        print(f"[Chatbot] Total documents to process: {total_docs} ({len(markdown_docs)} markdown, {len(raw_documents)} other)", flush=True)
        
        # Split documents with progress tracking
        all_chunks = []
        
        # Process markdown documents separately (they need special handling)
        other_docs = raw_documents  # PDF and text documents
        
        if markdown_docs:
            print(f"[Chatbot] Splitting {len(markdown_docs)} markdown documents...", flush=True)
            md_chunks = split_markdown_documents(markdown_docs)
            print(f"[Chatbot] Processing {len(md_chunks)} markdown chunks...", flush=True)
            for idx, chunk in enumerate(md_chunks, 1):
                if idx % 50 == 0:
                    print(f"[Chatbot] Processing markdown chunk {idx}/{len(md_chunks)}...", flush=True)
                source = chunk.metadata.get('source', 'unknown')
                chunk_with_meta = add_metadata([chunk], source)
                all_chunks.extend(chunk_with_meta)
            print(f"[Chatbot] Completed processing {len(md_chunks)} markdown chunks", flush=True)
        
        # Split other documents (PDF, text)
        if other_docs:
            print(f"[Chatbot] Splitting {len(other_docs)} PDF/text documents...", flush=True)
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=RAG_CONFIG["chunk_size"],
                chunk_overlap=RAG_CONFIG["chunk_overlap"],
                length_function=len,
                separators=["\n\n", "\n", ". ", " ", ""],
            )
            other_chunks = text_splitter.split_documents(other_docs)
            print(f"[Chatbot] Processing {len(other_chunks)} PDF/text chunks...", flush=True)
            for idx, chunk in enumerate(other_chunks, 1):
                if idx % 50 == 0:
                    print(f"[Chatbot] Processing PDF/text chunk {idx}/{len(other_chunks)}...", flush=True)
                source = chunk.metadata.get('source', 'unknown')
                chunk_with_meta = add_metadata([chunk], source)
                all_chunks.extend(chunk_with_meta)
            print(f"[Chatbot] Completed processing {len(other_chunks)} PDF/text chunks", flush=True)
        
        print(f"[Chatbot] Adding {len(all_chunks)} document chunks to vector store...", flush=True)
        print("[Chatbot] This may take several minutes as embeddings are generated...", flush=True)
        
        # Generate UUIDs
        uuids = [str(uuid4()) for _ in range(len(all_chunks))]
        
        # Add documents in batches to show progress (if many chunks)
        # Add documents in batches to show progress (if many chunks)
        loop = asyncio.get_running_loop()
        
        def _add_batch(batch_docs, batch_ids):
            vector_store.add_documents(documents=batch_docs, ids=batch_ids)
            
        if len(all_chunks) > 40:
            batch_size = 40
            for i in range(0, len(all_chunks), batch_size):
                batch = all_chunks[i:i + batch_size]
                batch_ids = uuids[i:i + batch_size]
                await loop.run_in_executor(None, _add_batch, batch, batch_ids)
                print(f"[Chatbot] Added batch {i//batch_size + 1}/{(len(all_chunks) + batch_size - 1)//batch_size} ({len(batch)} chunks)...", flush=True)
                # Small delay to let SQLite catch up and prevent locking/corruption
                await asyncio.sleep(0.2)
        else:
            await loop.run_in_executor(None, _add_batch, all_chunks, uuids)

        # Persist if needed (some Chroma versions auto-persist, but explicit is safer)
        # Run in executor to avoid blocking
        if hasattr(vector_store, 'persist'):
             await loop.run_in_executor(None, vector_store.persist)
        
        print(f"[Chatbot] Successfully ingested {len(all_chunks)} document chunks", flush=True)
        
        return True
        
    except Exception as e:
        error_str = str(e).encode('ascii', 'replace').decode('ascii')
        print(f"[Chatbot] Error ingesting documents: {error_str}", flush=True)
        return False


async def initialize_chatbot_async():
    """
    Async initialization: Initialize core components and verify ChromaDB exists.
    No automatic ingestion - documents must be ingested manually using ingest_documents.py
    This allows the server to start immediately.
    """
    chatbot_state.initialization_started = True
    chatbot_state.status = "initializing"
    
    # Step 1: Initialize core components
    # Run in executor to avoid blocking the event loop
    print("[Chatbot] Step 1: Initializing core components...", flush=True)
    loop = asyncio.get_running_loop()
    core_success = await loop.run_in_executor(None, initialize_core_components)
    
    if not core_success:
        print("[Chatbot] Core initialization failed, server will start but chatbot won't work", flush=True)
        return
    
    # Step 2: Check if documents exist in ChromaDB (async with timeout, max 3 seconds)
    print("[Chatbot] Step 2: Checking for existing documents in ChromaDB...", flush=True)
    documents_exist, doc_count = await check_documents_exist_fast()
    
    if documents_exist:
        print(f"[Chatbot] Found documents in ChromaDB. Chatbot is ready!", flush=True)
        chatbot_state.set_documents_ready()
        return
    else:
        # No documents found - inform user they need to run ingestion script
        error_msg = (
            "No documents found in ChromaDB. "
            "Please run 'python ingest_documents.py' to ingest documents first. "
            "The chatbot will not work until documents are ingested."
        )
        chatbot_state.set_failed(error_msg)
        print(f"[Chatbot] WARNING: {error_msg}", flush=True)
        print("[Chatbot] Server is ready, but chatbot endpoints will return errors until documents are ingested.", flush=True)


def classify_query_type(message: str) -> str:
    """Classify query into factual, conversational, or creative"""
    message_lower = message.lower()
    
    factual_keywords = [
        'what', 'where', 'when', 'which', 'how many', 'list',
        'experience', 'education', 'skills', 'technologies', 'projects',
        'work', 'role', 'position', 'degree', 'gpa', 'company'
    ]
    
    creative_keywords = [
        'hobbies', 'interests', 'music', 'film', 'personality',
        'creative', 'artistic', 'passion', 'enjoy', 'like'
    ]
    
    if any(keyword in message_lower for keyword in factual_keywords):
        return 'factual'
    if any(keyword in message_lower for keyword in creative_keywords):
        return 'creative'
    return 'conversational'


def get_relevant_categories(query_type: str) -> List[str]:
    """Map query type to relevant document categories"""
    if query_type == "factual":
        return ["work", "education", "projects", "summary"]
    elif query_type == "creative":
        return ["hobbies", "creative"]
    else:
        return ["general", "summary", "goals", "challenges"]
