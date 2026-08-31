#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.repositories.neo4j_connector import neo4j_connector

# Delete all relationships first, then nodes
try:
    neo4j_connector.run_query("MATCH ()-[r]-() DELETE r")
    print("Deleted all relationships")
except Exception as e:
    print(f"Error deleting relationships: {e}")

try:
    neo4j_connector.run_query("MATCH (n) DELETE n")
    print("Deleted all nodes")
except Exception as e:
    print(f"Error deleting nodes: {e}")

print("Cleanup completed.")