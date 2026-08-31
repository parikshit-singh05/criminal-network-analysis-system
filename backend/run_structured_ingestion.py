#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.phone_registry_service import ingest_phone_registry
from app.services.vehicle_registry_service import ingest_vehicle_registry
from app.services.bank_account_service import ingest_bank_accounts
from app.services.organization_registry_service import ingest_organization_registry
from app.services.location_service import ingest_locations
from app.services.criminal_record_service import ingest_criminal_records
from app.services.cdr_service import ingest_cdr
from app.services.financial_transaction_service import ingest_financial_transactions
from app.services.case_metadata_service import ingest_case_metadata
from app.services.fir_records_service import ingest_fir_records
from app.services.social_media_service import ingest_social_media
from app.services.email_service import ingest_email_records

def main():
    print("Running structured and semi-structured ingestion services...")

    services = [
        ("Case metadata", ingest_case_metadata),
        ("Phone registry", ingest_phone_registry),
        ("Vehicle registry", ingest_vehicle_registry),
        ("Bank accounts", ingest_bank_accounts),
        ("Organization registry", ingest_organization_registry),
        ("Locations", ingest_locations),
        ("Criminal records", ingest_criminal_records),
        ("CDR", ingest_cdr),
        ("Financial transactions", ingest_financial_transactions),
        ("FIR records", ingest_fir_records),
        ("Social media", ingest_social_media),
        ("Email records", ingest_email_records),
    ]

    for name, service_func in services:
        try:
            print(f"\n{name}...")
            service_func()
            print(f"{name} completed.")
        except Exception as e:
            print(f"Error in {name}: {e}")
            import traceback
            traceback.print_exc()

    print("\nAll structured and semi-structured ingestion services completed.")

if __name__ == "__main__":
    main()