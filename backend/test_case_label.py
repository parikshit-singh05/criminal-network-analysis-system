#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.repositories.neo4j_connector import neo4j_connector

query = """
MATCH (c:Case)
RETURN c.case_id, labels(c) AS labels, properties(c) AS props
LIMIT 5
"""
try:
    result = neo4j_connector.run_query(query)
    print("Case nodes with label Case:")
    for record in result:
        print(f"  case_id: {record.get('case_id')}")
        print(f"    labels: {record.get('labels')}")
        print(f"    properties: {record.get('props')}")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()