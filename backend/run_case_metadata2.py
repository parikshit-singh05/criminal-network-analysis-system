#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.services.case_metadata_service import ingest_case_metadata

try:
    print("Running case_metadata_service...")
    ingest_case_metadata()
    print("Done.")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()