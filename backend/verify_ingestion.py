#!/usr/bin/env python3
"""
Verification script to check data ingested into Neo4j.
"""
import sys
import os

# Add the backend directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.repositories.neo4j_connector import neo4j_connector

def main():
    print("Verifying ingestion...")

    # Query to count nodes by label
    queries = [
        ("Case nodes", "MATCH (c:Case) RETURN count(c) AS count"),
        ("Person nodes", "MATCH (p:Person) RETURN count(p) AS count"),
        ("PhoneNumber nodes", "MATCH (p:PhoneNumber) RETURN count(p) AS count"),
        ("Vehicle nodes", "MATCH (v:Vehicle) RETURN count(v) AS count"),
        ("BankAccount nodes", "MATCH (b:BankAccount) RETURN count(b) AS count"),
        ("Organization nodes", "MATCH (o:Organization) RETURN count(o) AS count"),
        ("Location nodes", "MATCH (l:Location) RETURN count(l) AS count"),
        ("Document nodes", "MATCH (d:Document) RETURN count(d) AS count"),
        ("CALLS relationships", "MATCH ()-[r:CALLS]->() RETURN count(r) AS count"),
        ("TRANSFERS relationships", "MATCH ()-[r:TRANSFERS]->() RETURN count(r) AS count"),
        ("RELATED_TO relationships (Case-Case)", "MATCH ()-[r:RELATED_TO]->() WHERE startNode(r):Case AND endNode(r):Case RETURN count(r) AS count"),
        ("INVOLVED_IN relationships (Person-Case)", "MATCH ()-[r:INVOLVED_IN]->() WHERE startNode(r):Person AND endNode(r):Case RETURN count(r) AS count"),
    ]

    for desc, query in queries:
        try:
            result = neo4j_connector.run_query(query)
            # Assuming run_query returns a list of records
            if result:
                value = result[0].get("count") if result[0] else 0
                print(f"{desc}: {value}")
            else:
                print(f"{desc}: 0")
        except Exception as e:
            print(f"Error querying {desc}: {e}")

    # Check a few Case nodes for properties from case_metadata
    print("\nSample Case node properties:")
    case_query = """
    MATCH (c:Case)
    RETURN c.case_id AS case_id, c.title AS title, c.fir_date AS fir_date, c.current_status AS current_status
    LIMIT 5
    """
    try:
        result = neo4j_connector.run_query(case_query)
        for record in result:
            print(f"Case {record.get('case_id')}: title={record.get('title')}, fir_date={record.get('fir_date')}, status={record.get('current_status')}")
    except Exception as e:
        print(f"Error fetching case properties: {e}")

    # Check that FIR records have set fir_id and date on Case nodes (should match case_metadata)
    print("\nChecking FIR-specific properties on Case nodes:")
    fir_query = """
    MATCH (c:Case)
    WHERE c.fir_id IS NOT NULL
    RETURN c.case_id AS case_id, c.fir_id AS fir_id, c.date AS date
    LIMIT 5
    """
    try:
        result = neo4j_connector.run_query(fir_query)
        for record in result:
            print(f"Case {record.get('case_id')}: fir_id={record.get('fir_id')}, date={record.get('date')}")
    except Exception as e:
        print(f"Error checking FIR properties: {e}")

    # Check that criminal records have created Person nodes and linked to Cases
    print("\nSample Person-Case links:")
    person_case_query = """
    MATCH (p:Person)-[r:INVOLVED_IN]->(c:Case)
    RETURN p.person_id AS person_id, p.person_name AS person_name, c.case_id AS case_id, r.record_id AS record_id
    LIMIT 5
    """
    try:
        result = neo4j_connector.run_query(person_case_query)
        for record in result:
            print(f"Person {record.get('person_id')} ({record.get('person_name')}) -> Case {record.get('case_id')} via record {record.get('record_id')}")
    except Exception as e:
        print(f"Error fetching person-case links: {e}")

    print("\nVerification completed.")

if __name__ == "__main__":
    main()