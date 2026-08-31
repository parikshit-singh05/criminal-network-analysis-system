#!/usr/bin/env python3
"""
Final verification script for the Criminal Network Analysis System MVP.
This script demonstrates that all components are working together.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.repositories.neo4j_connector import neo4j_connector
from app.services.case_metadata_service import ingest_case_metadata
from app.services.phone_registry_service import ingest_phone_registry
from app.services.vehicle_registry_service import ingest_vehicle_registry
from app.services.bank_account_service import ingest_bank_accounts
from app.services.organization_registry_service import ingest_organization_registry
from app.services.location_service import ingest_locations
from app.services.criminal_record_service import ingest_criminal_records
from app.services.cdr_service import ingest_cdr
from app.services.financial_transaction_service import ingest_financial_transactions
from app.services.fir_records_service import ingest_fir_records
from app.services.social_media_service import ingest_social_media
from app.services.email_service import ingest_email_records
from app.nlp.ner import extract_entities_from_text
from app.nlp.relation_extractor import extract_relations_from_text

def print_header(title):
    print("\n" + "="*60)
    print(f" {title}")
    print("="*60)

def print_subheader(title):
    print(f"\n--- {title} ---")

def reset_database():
    """Reset the database to a clean state."""
    print_subheader("Resetting Database")
    try:
        neo4j_connector.run_query("MATCH ()-[r]-() DELETE r")
        neo4j_connector.run_query("MATCH (n) DELETE n")
        print("✓ Database reset successfully")
    except Exception as e:
        print(f"✗ Error resetting database: {e}")

def run_ingestion_pipeline():
    """Run all ingestion services."""
    print_subheader("Running Ingestion Pipeline")

    services = [
        ("Case Metadata", ingest_case_metadata),
        ("Phone Registry", ingest_phone_registry),
        ("Vehicle Registry", ingest_vehicle_registry),
        ("Bank Accounts", ingest_bank_accounts),
        ("Organization Registry", ingest_organization_registry),
        ("Locations", ingest_locations),
        ("Criminal Records", ingest_criminal_records),
        ("CDR", ingest_cdr),
        ("Financial Transactions", ingest_financial_transactions),
        ("FIR Records", ingest_fir_records),
        ("Social Media", ingest_social_media),
        ("Email Records", ingest_email_records),
    ]

    success_count = 0
    for name, service_func in services:
        try:
            print(f"  Running {name}...", end=" ")
            service_func()
            print("✓")
            success_count += 1
        except Exception as e:
            print(f"✗ Error: {e}")

    print(f"\nIngestion Summary: {success_count}/{len(services)} services completed successfully")
    return success_count == len(services)

def test_nlp_components():
    """Test the NLP components with sample text."""
    print_subheader("Testing NLP Components")

    sample_text = """
    On 15th January 2024, acting on specific intelligence, Inspector Sharma conducted a raid
    at House No. 45, Sector 12, Dwarka, Delhi and apprehended Rajesh Kumar.
    During the raid, police recovered 5kg of heroin from a white Toyota Fortuner
    bearing registration DL-5C-AB-1234. Two mobile phones were seized: 9876543210 and 9988776655.
    The suspect's HDFC account number 12345678901234 received suspicious deposits
    from Vikram Singh (phone 9123456789) through hawala channels operated by Mohammed Farooq.
    Call records show frequent communication between Rajesh Kumar and Vikram Singh.
    """

    try:
        print("  Testing Entity Extraction...", end=" ")
        entities = extract_entities_from_text(sample_text)
        print(f"✓ Extracted {len(entities)} entities")

        # Show some sample entities
        person_entities = [e for e in entities if e['type'] == 'PERSON']
        phone_entities = [e for e in entities if e['type'] == 'PHONE']
        vehicle_entities = [e for e in entities if e['type'] == 'VEHICLE']
        account_entities = [e for e in entities if e['type'] == 'ACCOUNT']
        location_entities = [e for e in entities if e['type'] == 'LOCATION']

        print(f"    Persons: {len(person_entities)} (e.g., {[e['text'] for e in person_entities[:3]]})")
        print(f"    Phones: {len(phone_entities)} (e.g., {[e['text'] for e in phone_entities[:3]]})")
        print(f"    Vehicles: {len(vehicle_entities)} (e.g., {[e['text'] for e in vehicle_entities[:3]]})")
        print(f"    Accounts: {len(account_entities)} (e.g., {[e['text'] for e in account_entities[:3]]})")
        print(f"    Locations: {len(location_entities)} (e.g., {[e['text'] for e in location_entities[:3]]})")

        print("  Testing Relation Extraction...", end=" ")
        relations = extract_relations_from_text(sample_text, entities)
        print(f"✓ Extracted {len(relations)} relations")

        # Show some sample relations
        if relations:
            print("    Sample relations:")
            for rel in relations[:5]:
                print(f"      {rel['source_entity_text']} ({rel['source_entity_type']}) "
                      f"--[{rel['relation_type']}]--> {rel['target_entity_text']} ({rel['target_entity_type']})")

        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_database_state():
    """Test the state of the database after ingestion."""
    print_subheader("Checking Database State")

    try:
        # Count nodes by type
        queries = [
            ("Person nodes", "MATCH (p:Person) RETURN count(p) AS count"),
            ("Case nodes", "MATCH (c:Case) RETURN count(c) AS count"),
            ("Phone nodes", "MATCH (p:Phone) RETURN count(p) AS count"),
            ("Vehicle nodes", "MATCH (v:Vehicle) RETURN count(v) AS count"),
            ("BankAccount nodes", "MATCH (b:BankAccount) RETURN count(b) AS count"),
            ("Organization nodes", "MATCH (o:Organization) RETURN count(o) AS count"),
            ("Location nodes", "MATCH (l:Location) RETURN count(l) AS count"),
            ("Document nodes", "MATCH (d:Document) RETURN count(d) AS count"),
        ]

        all_success = True
        for desc, query in queries:
            try:
                result = neo4j_connector.run_query(query)
                count = result[0].get('count') if result else 0
                print(f"  {desc}: {count}")
                if count == 0 and "Document" not in desc:  # Documents might be zero if unstructured not processed
                    print(f"    ⚠ Warning: {desc} is zero")
            except Exception as e:
                print(f"  {desc}: ✗ Error - {e}")
                all_success = False

        # Count relationships
        rel_queries = [
            ("CALLS relationships", "MATCH ()-[r:CALLS]->() RETURN count(r) AS count"),
            ("TRANSFERS relationships", "MATCH ()-[r:TRANSFERS]->() RETURN count(r) AS count"),
            ("INVOLVED_IN relationships", "MATCH ()-[r:INVOLVED_IN]->() RETURN count(r) AS count"),
            ("RELATED_TO relationships (Case-Case)", "MATCH ()-[r:RELATED_TO]->() WHERE startNode(r):Case AND endNode(r):Case RETURN count(r) AS count"),
            ("MENTIONED_IN relationships", "MATCH ()-[r:MENTIONED_IN]->() RETURN count(r) AS count"),
        ]

        print("\n  Relationship Counts:")
        for desc, query in rel_queries:
            try:
                result = neo4j_connector.run_query(query)
                count = result[0].get('count') if result else 0
                print(f"    {desc}: {count}")
            except Exception as e:
                print(f"    {desc}: ✗ Error - {e}")
                all_success = False

        return all_success
    except Exception as e:
        print(f"✗ Error checking database state: {e}")
        return False

def test_entity_resolution():
    """Test the entity resolution component."""
    print_subheader("Testing Entity Resolution")

    try:
        from app.entity_resolution.resolver import resolve_entities
        print("  Running entity resolution...", end=" ")
        resolve_entities()
        print("✓ Entity resolution completed")
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def main():
    print_header("CRIMINAL NETWORK ANALYSIS SYSTEM - MVP VERIFICATION")

    # Reset database to start clean
    reset_database()

    # Run ingestion pipeline
    ingestion_success = run_ingestion_pipeline()

    # Check database state
    db_success = test_database_state()

    # Test NLP components
    nlp_success = test_nlp_components()

    # Test entity resolution
    er_success = test_entity_resolution()

    # Final summary
    print_header("VERIFICATION SUMMARY")
    print(f"Ingestion Pipeline:     {'✓ PASS' if ingestion_success else '✗ FAIL'}")
    print(f"Database State:         {'✓ PASS' if db_success else '✗ FAIL'}")
    print(f"NLP Components:         {'✓ PASS' if nlp_success else '✗ FAIL'}")
    print(f"Entity Resolution:      {'✓ PASS' if er_success else '✗ FAIL'}")

    overall_success = ingestion_success and db_success and nlp_success and er_success
    print(f"\nOverall Result:         {'✓ SYSTEM READY' if overall_success else '✗ SYSTEM NEEDS ATTENTION'}")

    if overall_success:
        print("\n🎉 The Criminal Network Analysis System MVP is ready for use!")
        print("   Next steps:")
        print("   1. Start the API server: uvicorn app.main:app --reload")
        print("   2. Access the API documentation at: http://localhost:8000/docs")
        print("   3. Explore the graph using the available endpoints")
    else:
        print("\n⚠ Please address the failed components before proceeding.")

    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)