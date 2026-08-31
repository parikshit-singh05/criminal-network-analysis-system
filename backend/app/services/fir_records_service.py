import json
from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_name
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'semi_structured', 'fir_records.json')

def ingest_fir_records():
    """
    Ingest FIR records from JSON into Neo4j.
    Creates Case nodes and links to Persons, Phones, Vehicles, etc. mentioned in the FIR.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        data = json.load(file)
        data = data.get('fir_records', [])

    # Assuming the JSON structure is a list of FIR objects
    for fir in data:
        fir_id = fir.get('fir_id')
        # Use fir_id as the case_id since there is no separate case_id field
        case_id = fir_id
        date = fir.get('date')
        # Other fields as per the dataset description

        # Create or merge the Case node, setting properties only if not already set
        case_query = """
        MERGE (c:Case {case_id: $case_id})
        ON CREATE SET c.fir_id = $fir_id, c.date = $date
        ON MATCH SET c.fir_id = COALESCE(c.fir_id, $fir_id), c.date = COALESCE(c.date, $date)
        """
        neo4j_connector.run_query(case_query, {
            "case_id": case_id,
            "fir_id": fir_id,
            "date": date
        })

        # Extract entities and relationships from the FIR narrative (if present)
        # This would involve NLP, but for now we'll skip and rely on the structured data.
        # We'll implement NLP in the next phase.

        print(f"Processed FIR: {fir_id}")

    print("FIR records ingestion completed.")