import json
from app.repositories.neo4j_connector import neo4j_connector
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'semi_structured', 'case_metadata.json')

def ingest_case_metadata():
    """
    Ingest case metadata from JSON into Neo4j.
    Creates Case nodes with metadata and links between cases (cross-case relationships).
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        data = json.load(file)
        cases = data.get('cases', [])

    # Assuming the JSON structure is a list of case metadata objects
    for case_meta in cases:
        case_id = case_meta.get('case_id')
        title = case_meta.get('title')
        originating_unit = case_meta.get('originating_unit')
        dates = case_meta.get('dates', {})
        incident_date = dates.get('incident_date')
        fir_date = dates.get('fir_date')
        last_update = dates.get('last_update')
        jurisdictions = case_meta.get('jurisdictions', [])
        crime_categories = case_meta.get('crime_categories', [])
        persons_of_interest = case_meta.get('persons_of_interest', [])
        evidence_types = case_meta.get('evidence_types', [])
        current_status = case_meta.get('current_status')
        investigating_officer = case_meta.get('investigating_officer')
        case_metadata_id = case_meta.get('case_metadata_id')
        related_cases = case_meta.get('related_cases', [])

        if not case_id:
            continue

        # Create or merge the Case node with metadata
        # Serialize complex properties
        persons_of_interest_json = json.dumps(persons_of_interest) if persons_of_interest else None
        case_query = """
        MERGE (c:Case {case_id: $case_id})
        SET c.title = $title,
            c.originating_unit = $originating_unit,
            c.incident_date = $incident_date,
            c.fir_date = $fir_date,
            c.last_update = $last_update,
            c.jurisdictions = $jurisdictions,
            c.crime_categories = $crime_categories,
            c.persons_of_interest = $persons_of_interest_json,
            c.evidence_types = $evidence_types,
            c.current_status = $current_status,
            c.investigating_officer = $investigating_officer,
            c.case_metadata_id = $case_metadata_id
        """
        neo4j_connector.run_query(case_query, {
            "case_id": case_id,
            "title": title,
            "originating_unit": originating_unit,
            "incident_date": incident_date,
            "fir_date": fir_date,
            "last_update": last_update,
            "jurisdictions": jurisdictions,
            "crime_categories": crime_categories,
            "persons_of_interest_json": persons_of_interest_json,
            "evidence_types": evidence_types,
            "current_status": current_status,
            "investigating_officer": investigating_officer,
            "case_metadata_id": case_metadata_id
        })

        # Create relationships to related cases
        print(f"  Case {case_id} has {len(related_cases)} related cases: {related_cases}")
        for related_case_id in related_cases:
            if not related_case_id:
                continue
            print(f"    Creating relationship to {related_case_id}")
            rel_query = """
            MATCH (c1:Case {case_id: $case_id})
            MATCH (c2:Case {case_id: $related_case_id})
            MERGE (c1)-[r:RELATED_TO]->(c2)
            SET r.relationship_type = $relationship_type,
                r.description = $description
            """
            neo4j_connector.run_query(rel_query, {
                "case_id": case_id,
                "related_case_id": related_case_id,
                "relationship_type": "RELATED_TO",  # generic type, or we could store specific type from metadata? Not provided.
                "description": f"Case {case_id} is related to case {related_case_id}"
            })
            print(f"    Created relationship to {related_case_id}")

        print(f"Processed case metadata: {case_id}")

    print("Case metadata ingestion completed.")