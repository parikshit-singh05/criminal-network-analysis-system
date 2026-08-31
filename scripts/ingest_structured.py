#!/usr/bin/env python
"""
Script to ingest structured data into Neo4j.
"""
import sys
import os

# Add the backend directory to the path so we can import the app modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.services.phone_registry_service import ingest_phone_registry
from app.services.vehicle_registry_service import ingest_vehicle_registry
from app.services.bank_account_service import ingest_bank_accounts
from app.services.organization_registry_service import ingest_organization_registry
from app.services.location_service import ingest_locations
from app.services.criminal_record_service import ingest_criminal_records
from app.services.cdr_service import ingest_cdr
from app.services.financial_transaction_service import ingest_financial_transactions

def main():
    print("Starting structured data ingestion...")

    # Ingest registry data first (nodes)
    ingest_phone_registry()
    ingest_vehicle_registry()
    ingest_bank_accounts()
    ingest_organization_registry()
    ingest_locations()

    # Ingest data that creates nodes and relationships
    ingest_criminal_records()

    # Ingest data that creates relationships between existing nodes
    ingest_cdr()
    ingest_financial_transactions()

    print("Structured data ingestion completed.")

if __name__ == "__main__":
    main()