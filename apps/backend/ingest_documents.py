#!/usr/bin/env python3
"""
Manual document ingestion script for Diego Portfolio Chatbot.

This script loads documents from the data directory and ingests them into ChromaDB.
Run this script separately when you need to update the document database.

Usage:
    python ingest_documents.py
    or
    python -m backend.ingest_documents
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add backend directory to path
backend_dir = Path(__file__).parent
project_root = backend_dir.parent.parent

# Add apps directory to path so backend module can be found
apps_dir = project_root / "apps"
if str(apps_dir) not in sys.path:
    sys.path.insert(0, str(apps_dir))

# Also add backend directory
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Load environment variables
backend_env = backend_dir / ".env"
root_env = project_root / ".env"

if backend_env.exists():
    load_dotenv(backend_env)
    print(f"[Ingest] Loaded .env from: {backend_env}")
elif root_env.exists():
    load_dotenv(root_env)
    print(f"[Ingest] Loaded .env from: {root_env}")
else:
    load_dotenv()
    print(f"[Ingest] Warning: No .env file found")

# Import after path setup
import asyncio
from api.services.chatbot_service import (
    DATA_PATH,
    CHROMA_PATH,
    initialize_core_components,
    ingest_documents_async,
    check_documents_exist_sync
)


async def main():
    """Main ingestion function"""
    print("=" * 60)
    print("Diego Portfolio - Document Ingestion Script")
    print("=" * 60)
    print()
    
    # Step 1: Initialize core components
    print("[Ingest] Step 1: Initializing core components...")
    success = initialize_core_components()
    
    if not success:
        print("[Ingest] ERROR: Failed to initialize core components")
        print("[Ingest] Please check your OPENAI_API_KEY in .env file")
        sys.exit(1)
    
    print("[Ingest] Core components initialized successfully!")
    print()
    
    # Step 2: Check if documents already exist
    print("[Ingest] Step 2: Checking for existing documents...")
    print(f"[Ingest] Checking ChromaDB at: {CHROMA_PATH}")
    documents_exist, doc_count = check_documents_exist_sync()
    
    if documents_exist:
        print(f"[Ingest] Found {doc_count} existing documents in ChromaDB")
        response = input("[Ingest] Do you want to re-ingest documents? This will add to existing documents. (y/N): ")
        if response.lower() != 'y':
            print("[Ingest] Ingestion cancelled. Exiting.")
            sys.exit(0)
        print("[Ingest] Proceeding with ingestion (will add to existing documents)...")
    else:
        print("[Ingest] No existing documents found. Starting fresh ingestion...")
    
    print()
    
    # Step 3: Ingest documents
    print("[Ingest] Step 3: Ingesting documents...")
    print(f"[Ingest] Data directory: {DATA_PATH}")
    print(f"[Ingest] ChromaDB path: {CHROMA_PATH}")
    print()
    
    try:
        success = await asyncio.wait_for(
            ingest_documents_async(),
            timeout=900.0  # 15 minute timeout
        )
        
        if success:
            # Verify ingestion
            documents_exist, doc_count = check_documents_exist_sync()
            print()
            print("=" * 60)
            print("[Ingest] SUCCESS: Document ingestion completed!")
            print(f"[Ingest] Total documents in ChromaDB: {doc_count}")
            print("=" * 60)
            sys.exit(0)
        else:
            print()
            print("=" * 60)
            print("[Ingest] ERROR: Document ingestion returned False")
            print("[Ingest] Check the logs above for details")
            print("=" * 60)
            sys.exit(1)
            
    except asyncio.TimeoutError:
        print()
        print("=" * 60)
        print("[Ingest] ERROR: Document ingestion timed out after 15 minutes")
        print("[Ingest] This may indicate too many files or very large documents")
        print("=" * 60)
        sys.exit(1)
    except Exception as e:
        error_str = str(e).encode('ascii', 'replace').decode('ascii')
        print()
        print("=" * 60)
        print(f"[Ingest] ERROR: Document ingestion failed: {error_str}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print()
        print("[Ingest] Ingestion interrupted by user. Exiting.")
        sys.exit(1)

