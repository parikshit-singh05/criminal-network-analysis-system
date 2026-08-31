from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_phone_number, normalize_name
import csv
import os
from app.config import settings

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'structured', 'phone_registry.csv')

def ingest_phone_registry():
    """
    Ingest phone registry data from CSV into Neo4j.
    Creates Phone nodes and connects them to Person nodes via USES_PHONE relationship.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            phone_number = normalize_phone_number(row['phone_number'])
            subscriber_name = normalize_name(row['subscriber_name'])
            subscriber_type = row['subscriber_type']
            city = row['city']
            status = row['status']
            first_seen = row['first_seen']
            last_seen = row['last_seen']
            source_case_id = row['source_case_id']
            phone_id = row['phone_id']

            if not phone_number:
                continue

            # Create or merge the Phone node
            phone_query = """
            MERGE (p:Phone {phone_id: $phone_id})
            SET p.phone_number = $phone_number,
                p.normalized_number = $normalized_number,
                p.subscriber_name = $subscriber_name,
                p.subscriber_type = $subscriber_type,
                p.city = $city,
                p.status = $status,
                p.first_seen = $first_seen,
                p.last_seen = $last_seen,
                p.source_case_id = $source_case_id
            """
            neo4j_connector.run_query(phone_query, {
                "phone_id": phone_id,
                "phone_number": row['phone_number'],  # original
                "normalized_number": phone_number,
                "subscriber_name": subscriber_name,
                "subscriber_type": subscriber_type,
                "city": city,
                "status": status,
                "first_seen": first_seen,
                "last_seen": last_seen,
                "source_case_id": source_case_id
            })

            # Now, we need to link the phone to a person.
            # However, we don't have the person yet. We'll do that when we ingest the person data.
            # For now, we'll just create the phone node and later we'll create relationships.
            # We can also create a relationship if we know the person from the subscriber_name.
            # But we'll do that in a separate step after we have both nodes.

            # For now, we'll just print progress.
            print(f"Processed phone: {phone_number}")

    print("Phone registry ingestion completed.")