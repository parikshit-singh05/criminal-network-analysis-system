#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.repositories.neo4j_connector import neo4j_connector

query = """
CALL db.relationshipTypes() YIELD relationshipType
RETURN relationshipType
"""
try:
    result = neo4j_connector.run_query(query)
    print("Relationship types:")
    for record in result:
        print(f"  {record.get('relationshipType')}")
except Exception as e:
    print(f"Error: {e}")

# Also check counts per type
query2 = """
MATCH ()-[r]->()
RETURN type(r) AS type, count(r) AS count
ORDER BY count DESC
"""
try:
    result = neo4j_connector.run_query(query2)
    print("\nRelationship counts:")
    for record in result:
        print(f"  {record.get('type')}: {record.get('count')}")
except Exception as e:
    print(f"Error: {e}")