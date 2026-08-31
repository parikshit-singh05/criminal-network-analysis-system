from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_phone_number, normalize_name
import csv
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'structured', 'cdr.csv')

def ingest_cdr():
    """
    Ingest CDR data from CSV into Neo4j.
    Creates CALLS relationships between Person nodes.
    Also creates Person nodes if they don't exist (based on caller_name and receiver_name).
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Normalize caller and receiver names
            caller_name = normalize_name(row['caller_name'])
            receiver_name = normalize_name(row['receiver_name'])
            # Normalize phone numbers
            caller_number = normalize_phone_number(row['caller_number'])
            receiver_number = normalize_phone_number(row['receiver_number'])
            # Other fields
            date = row['date']
            time = row['time']
            try:
                duration_seconds = int(row['duration_seconds']) if row['duration_seconds'] else None
            except ValueError:
                duration_seconds = None
            tower_location = row['tower_location']
            source_case_id = row['source_case_id']
            cdr_id = row['cdr_id']

            # Skip if essential fields are missing
            if not caller_name or not receiver_name:
                continue

            # Create or merge the caller Person node
            caller_query = """
            MERGE (p:Person {normalized_name: $normalized_name})
            ON CREATE SET p.person_name = $person_name
            ON MATCH SET p.person_name = COALESCE(p.person_name, $person_name)
            """
            # Note: We are using normalized_name as a temporary key for merging.
            # In a real system, we would have a more robust entity resolution.
            # For now, we'll use normalized_name to merge, and we'll store the original name.
            # We'll also generate a UUID for new nodes.
            neo4j_connector.run_query(caller_query, {
                "normalized_name": caller_name,
                "person_name": row['caller_name']
            })

            # Create or merge the receiver Person node
            receiver_query = """
            MERGE (p:Person {normalized_name: $normalized_name})
            ON CREATE SET p.person_name = $person_name
            ON MATCH SET p.person_name = COALESCE(p.person_name, $person_name)
            """
            neo4j_connector.run_query(receiver_query, {
                "normalized_name": receiver_name,
                "person_name": row['receiver_name']
            })

            # Create the CALLS relationship between the two persons
            # We'll match by normalized_name and then create the relationship.
            # Note: This assumes that normalized_name is unique enough for merging.
            # In reality, we would use entity resolution to get the canonical person ID.
            # For the MVP, we'll proceed with this.
            call_query = """
            MATCH (caller:Person {normalized_name: $caller_normalized_name})
            MATCH (receiver:Person {normalized_name: $receiver_normalized_name})
            MERGE (caller)-[r:CALLS {cdr_id: $cdr_id}]->(receiver)
            SET r.caller_number = $caller_number,
                r.receiver_number = $receiver_number,
                r.normalized_caller_number = $normalized_caller_number,
                r.normalized_receiver_number = $normalized_receiver_number,
                r.date = $date,
                r.time = $time,
                r.duration_seconds = $duration_seconds,
                r.tower_location = $tower_location,
                r.source_case_id = $source_case_id
            """
            neo4j_connector.run_query(call_query, {
                "caller_normalized_name": caller_name,
                "receiver_normalized_name": receiver_name,
                "cdr_id": cdr_id,
                "caller_number": row['caller_number'],
                "receiver_number": row['receiver_number'],
                "normalized_caller_number": caller_number,
                "normalized_receiver_number": receiver_number,
                "date": date,
                "time": time,
                "duration_seconds": duration_seconds,
                "tower_location": tower_location,
                "source_case_id": source_case_id
            })

            print(f"Processed CDR: {caller_name} -> {receiver_name}")

    print("CDR ingestion completed.")