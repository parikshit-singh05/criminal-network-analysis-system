#!/usr/bin/env python
"""
Script to ingest unstructured data into Neo4j.
"""
import sys
import os

# Add the backend directory to the path so we can import the app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.fir_narrative_service import ingest_fir_narratives
# TODO: Import other unstructured services

def main():
    print("Starting unstructured data ingestion...")

    ingest_fir_narratives()
    # TODO: Call other unstructured ingestion services

    print("Unstructured data ingestion completed.")

if __name__ == "__main__":
    main()