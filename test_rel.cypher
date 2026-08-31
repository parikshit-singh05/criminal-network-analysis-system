MATCH (c1:Case {case_id: 'FIR-2024-001'})
MATCH (c2:Case {case_id: 'FIR-2024-002'})
MERGE (c1)-[r:RELATED_TO]->(c2)
SET r.relationship_type = 'RELATED_TO',
    r.description = 'Test'
RETURN c1.case_id, c2.case_id, r