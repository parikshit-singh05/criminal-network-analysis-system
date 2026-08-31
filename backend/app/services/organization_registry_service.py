from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_name
import csv
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'structured', 'organization_registry.csv')

def ingest_organization_registry():
    """
    Ingest organization registry data from CSV into Neo4j.
    Creates Organization nodes.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            organization_name = normalize_name(row['organization_name'])
            organization_type = row['organization_type']
            registration_city = row['registration_city']
            registration_address = row['registration_address']
            director_name = normalize_name(row['director_name'])
            status = row['status']
            source_case_id = row['source_case_id']
            organization_id = row['organization_id']

            if not organization_name:
                continue

            # Create or merge the Organization node
            org_query = """
            MERGE (o:Organization {organization_id: $organization_id})
            SET o.organization_name = $organization_name,
                o.organization_type = $organization_type,
                o.registration_city = $registration_city,
                o.registration_address = $registration_address,
                o.director_name = $director_name,
                o.status = $status,
                o.source_case_id = $source_case_id
            """
            neo4j_connector.run_query(org_query, {
                "organization_id": organization_id,
                "organization_name": row['organization_name'],
                "organization_type": organization_type,
                "registration_city": registration_city,
                "registration_address": registration_address,
                "director_name": director_name,
                "status": status,
                "source_case_id": source_case_id
            })

            print(f"Processed organization: {organization_name}")

    print("Organization registry ingestion completed.")