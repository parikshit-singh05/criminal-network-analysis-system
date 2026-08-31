from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_vehicle_number, normalize_name
import csv
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'structured', 'vehicle_registry.csv')

def ingest_vehicle_registry():
    """
    Ingest vehicle registry data from CSV into Neo4j.
    Creates Vehicle nodes and connects them to Person nodes via OWNS or ASSOCIATED_WITH relationships.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            registration_number = normalize_vehicle_number(row['registration_number'])
            make_model = row['make_model']
            color = row['color']
            registered_owner = normalize_name(row['registered_owner'])
            associated_person = normalize_name(row['associated_person'])
            city = row['city']
            status = row['status']
            source_case_id = row['source_case_id']
            vehicle_id = row['vehicle_id']

            if not registration_number:
                continue

            # Create or merge the Vehicle node
            vehicle_query = """
            MERGE (v:Vehicle {vehicle_id: $vehicle_id})
            SET v.registration_number = $registration_number,
                v.normalized_number = $normalized_number,
                v.make_model = $make_model,
                v.color = $color,
                v.registered_owner = $registered_owner,
                v.associated_person = $associated_person,
                v.city = $city,
                v.status = $status,
                v.source_case_id = $source_case_id
            """
            neo4j_connector.run_query(vehicle_query, {
                "vehicle_id": vehicle_id,
                "registration_number": row['registration_number'],
                "normalized_number": registration_number,
                "make_model": make_model,
                "color": color,
                "registered_owner": registered_owner,
                "associated_person": associated_person,
                "city": city,
                "status": status,
                "source_case_id": source_case_id
            })

            print(f"Processed vehicle: {registration_number}")

    print("Vehicle registry ingestion completed.")