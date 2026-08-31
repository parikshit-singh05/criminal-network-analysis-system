#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.repositories.neo4j_connector import neo4j_connector

def test_case_creation():
    case_id = "TEST-001"
    title = "Test Case"
    # Create or merge a Case node with some properties
    query = """
    MERGE (c:Case {case_id: $case_id})
    SET c.title = $title
    RETURN c.case_id AS case_id, c.title AS title
    """
    try:
        result = neo4j_connector.run_query(query, {"case_id": case_id, "title": title})
        print("Result:", result)
        if result:
            record = result[0]
            print(f"Created case: case_id={record.get('case_id')}, title={record.get('title')}")
        else:
            print("No result returned")
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_case_creation()