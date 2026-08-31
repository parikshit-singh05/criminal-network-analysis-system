#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Before import")
try:
    from app.services.case_metadata_service import ingest_case_metadata
    print("After import")
except Exception as e:
    print(f"Import error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("Before call")
try:
    ingest_case_metadata()
    print("After call")
except Exception as e:
    print(f"Exception during call: {e}")
    import traceback
    traceback.print_exc()