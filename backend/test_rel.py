#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.repositories.neo4j_connector import neo4j_connector

query = """
MATCH (c1:Case {case_id: 'FIR-2024-001'})
MATCH (c2:Case {case_id: 'FIR-2024-002'})
MERGE (c1)-[r:RELATED_TO]->(c2)
SET r.relationship_type = 'RELATED_TO',
    r.description = 'Test'
RETURN c1.case_id, c2.case_id, r
"""
try:
    result = neo4j_connector.run_query(query)
    print("Result:")
    for record in result:
        print(f"  {record}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()