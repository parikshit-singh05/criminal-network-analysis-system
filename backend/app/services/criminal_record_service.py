from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_name
import csv
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'structured', 'criminal_records.csv')

def ingest_criminal_records():
    """
    Ingest criminal records data from CSV into Neo4j.
    Creates Person nodes (if not already created) and links them to Case nodes via INVOLVED_IN relationship.
    Also creates Case nodes if they don't exist.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            person_name = normalize_name(row['person_name'])
            person_id = row['person_id']
            case_id = row['case_id']
            offense_type = row['offense_type']
            date = row['date']
            role = row['role']
            status = row['status']
            jurisdiction = row['jurisdiction']
            record_id = row['record_id']

            if not person_name or not case_id:
                continue

            # Create or merge the Person node
            person_query = """
            MERGE (p:Person {person_id: $person_id})
            SET p.person_name = $person_name,
                p.normalized_name = $normalized_name
            """
            neo4j_connector.run_query(person_query, {
                "person_id": person_id,
                "person_name": row['person_name'],
                "normalized_name": person_name
            })

            # Create or merge the Case node (no properties, as metadata is handled elsewhere)
            case_query = """
            MERGE (c:Case {case_id: $case_id})
            """
            neo4j_connector.run_query(case_query, {
                "case_id": case_id
            })

            # Create the relationship between Person and Case: INVOLVED_IN
            relation_query = """
            MATCH (p:Person {person_id: $person_id})
            MATCH (c:Case {case_id: $case_id})
            MERGE (p)-[r:INVOLVED_IN {record_id: $record_id}]->(c)
            SET r.offense_type = $offense_type,
                r.date = $date,
                r.role = $role,
                r.status = $status,
                r.jurisdiction = $jurisdiction
            """
            neo4j_connector.run_query(relation_query, {
                "person_id": person_id,
                "case_id": case_id,
                "record_id": record_id,
                "offense_type": offense_type,
                "date": date,
                "role": role,
                "status": status,
                "jurisdiction": jurisdiction
            })

            print(f"Processed criminal record: {person_id} -> {case_id}")

    print("Criminal records ingestion completed.")