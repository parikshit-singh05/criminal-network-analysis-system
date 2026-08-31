#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.phone_registry_service import ingest_phone_registry

def main():
    print("Running phone registry service...")
    try:
        ingest_phone_registry()
        print("Phone registry service completed.")
    except Exception as e:
        print(f"Error in phone registry service: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()