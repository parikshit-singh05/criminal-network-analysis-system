#!/usr/bin/env python
"""
Script to ingest all data into Neo4j.
"""
import sys
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)
sys.path.insert(0, os.path.join(ROOT, "backend"))

from scripts.ingest_structured import main as ingest_structured
from scripts.ingest_semi_structured import main as ingest_semi_structured
from scripts.ingest_unstructured import main as ingest_unstructured
from app.entity_resolution.resolver import resolve_entities

def main():
    print("Starting full data ingestion...")

    ingest_structured()
    ingest_semi_structured()
    ingest_unstructured()

    print("Running entity resolution...")
    resolve_entities()
    print("Entity resolution completed.")

    print("Full data ingestion completed.")

if __name__ == "__main__":
    main()