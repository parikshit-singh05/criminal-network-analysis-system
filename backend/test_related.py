#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.repositories.neo4j_connector import neo4j_connector

query = """
MATCH (c:Case)
WHERE c.related_cases IS NOT NULL
RETURN c.case_id, c.related_cases
LIMIT 5
"""
try:
    result = neo4j_connector.run_query(query)
    print("Cases with related_cases property:")
    for record in result:
        print(f"  {record.get('case_id')}: {record.get('related_cases')}")
except Exception as e:
    print(f"Error: {e}")

# Also check if any RELATED_TO relationships exist
query2 = """
MATCH ()-[r:RELATED_TO]->()
RETURN count(r) AS count
"""
try:
    result = neo4j_connector.run_query(query2)
    print(f"RELATED_TO relationships count: {result[0].get('count') if result else 0}")
except Exception as e:
    print(f"Error checking RELATED_TO: {e}")

# Let's also see if there are any relationships at all between cases, regardless of type
query3 = """
MATCH (c1:Case)-[r]-(c2:Case)
RETURN type(r) AS relType, count(r) AS count
"""
try:
    result = neo4j_connector.run_query(query3)
    print("Relationships between cases:")
    for record in result:
        print(f"  {record.get('relType')}: {record.get('count')}")
except Exception as e:
    print(f"Error: {e}")