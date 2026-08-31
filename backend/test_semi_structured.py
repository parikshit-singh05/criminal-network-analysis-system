#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.case_metadata_service import ingest_case_metadata
from app.services.fir_records_service import ingest_fir_records
from app.services.social_media_service import ingest_social_media
from app.services.email_service import ingest_email_records

def main():
    print("Testing semi-structured ingestion services...")
    try:
        print("\n1. Ingesting case metadata...")
        ingest_case_metadata()
    except Exception as e:
        print(f"Error in case metadata ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n2. Ingesting FIR records...")
        ingest_fir_records()
    except Exception as e:
        print(f"Error in FIR records ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n3. Ingesting social media...")
        ingest_social_media()
    except Exception as e:
        print(f"Error in social media ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n4. Ingesting email records...")
        ingest_email_records()
    except Exception as e:
        print(f"Error in email records ingestion: {e}")
        import traceback
        traceback.print_exc()

    print("\nSemi-structured ingestion test completed.")

if __name__ == "__main__":
    main()