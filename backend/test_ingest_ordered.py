#!/usr/bin/env python3
"""
Test script to run all ingestion services in a specific order.
"""
import sys
import os

# Add the backend directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.case_metadata_service import ingest_case_metadata
from app.services.phone_registry_service import ingest_phone_registry
from app.services.vehicle_registry_service import ingest_vehicle_registry
from app.services.bank_account_service import ingest_bank_accounts
from app.services.organization_registry_service import ingest_organization_registry
from app.services.location_service import ingest_locations
from app.services.cdr_service import ingest_cdr
from app.services.financial_transaction_service import ingest_financial_transactions
from app.services.fir_records_service import ingest_fir_records
from app.services.email_service import ingest_email_records
from app.services.social_media_service import ingest_social_media
from app.services.criminal_record_service import ingest_criminal_records

def main():
    print("Starting ordered ingestion...")

    try:
        print("\n1. Ingesting case metadata...")
        ingest_case_metadata()
    except Exception as e:
        print(f"Error in case metadata ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n2. Ingesting phone registry...")
        ingest_phone_registry()
    except Exception as e:
        print(f"Error in phone registry ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n3. Ingesting vehicle registry...")
        ingest_vehicle_registry()
    except Exception as e:
        print(f"Error in vehicle registry ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n4. Ingesting bank accounts...")
        ingest_bank_accounts()
    except Exception as e:
        print(f"Error in bank accounts ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n5. Ingesting organization registry...")
        ingest_organization_registry()
    except Exception as e:
        print(f"Error in organization registry ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n6. Ingesting locations...")
        ingest_locations()
    except Exception as e:
        print(f"Error in locations ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n7. Ingesting CDR...")
        ingest_cdr()
    except Exception as e:
        print(f"Error in CDR ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n8. Ingesting financial transactions...")
        ingest_financial_transactions()
    except Exception as e:
        print(f"Error in financial transactions ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n9. Ingesting FIR records...")
        ingest_fir_records()
    except Exception as e:
        print(f"Error in FIR records ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n10. Ingesting email records...")
        ingest_email_records()
    except Exception as e:
        print(f"Error in email records ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n11. Ingesting social media...")
        ingest_social_media()
    except Exception as e:
        print(f"Error in social media ingestion: {e}")
        import traceback
        traceback.print_exc()

    try:
        print("\n12. Ingesting criminal records...")
        ingest_criminal_records()
    except Exception as e:
        print(f"Error in criminal records ingestion: {e}")
        import traceback
        traceback.print_exc()

    print("\nAll ingestion attempts completed.")

if __name__ == "__main__":
    main()