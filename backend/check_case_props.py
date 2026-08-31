#!/usr/bin/env python3
from app.repositories.neo4j_connector import neo4j_connector
res = neo4j_connector.run_query('MATCH (c:Case) RETURN c.case_id AS case_id, c.persons_of_interest AS pois LIMIT 5')
print('Results:')
for r in res:
    print(f"Case {r.get('case_id')}: persons_of_interest={r.get('pois')}")