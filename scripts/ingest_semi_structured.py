#!/usr/bin/env python
"""
Script to ingest semi-structured data into Neo4j.
"""
import sys
import os

# Add the backend directory to the path so we can import the app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.fir_records_service import ingest_fir_records
from app.services.case_metadata_service import ingest_case_metadata
from app.services.social_media_service import ingest_social_media
from app.services.email_service import ingest_email_records

def main():
    print("Starting semi-structured data ingestion...")

    ingest_fir_records()
    ingest_case_metadata()
    ingest_social_media()
    ingest_email_records()

    print("Semi-structured data ingestion completed.")

if __name__ == "__main__":
    main()