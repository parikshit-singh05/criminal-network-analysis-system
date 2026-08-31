#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.case_metadata_service import ingest_case_metadata

def main():
    print("Running case metadata service...")
    try:
        ingest_case_metadata()
        print("Case metadata service completed.")
    except Exception as e:
        print(f"Error in case metadata service: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()