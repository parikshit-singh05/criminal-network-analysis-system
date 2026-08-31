from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.repositories.neo4j_connector import neo4j_connector

router = APIRouter()

@router.get("/")
async def list_entities(
    entity_type: Optional[str] = Query(None, description="Filter by entity type (PERSON, PHONE, VEHICLE, etc.)"),
    limit: int = Query(100, description="Maximum number of entities to return"),
    offset: int = Query(0, description="Number of entities to skip")
):
    """
    List entities with optional filtering by type.
    """
    try:
        if entity_type:
            # Map entity type to Neo4j label
            type_to_label = {
                "PERSON": "Person",
                "PHONE": "Phone",
                "VEHICLE": "Vehicle",
                "ACCOUNT": "BankAccount",
                "ORGANIZATION": "Organization",
                "LOCATION": "Location",
                "DOCUMENT": "Document"
            }
            label = type_to_label.get(entity_type.upper())
            if not label:
                raise HTTPException(status_code=400, detail=f"Unsupported entity type: {entity_type}")

            query = f"""
            MATCH (e:{label})
            RETURN elementId(e) AS id, e.{_get_primary_property(label)} AS value,
                   labels(e) AS types, properties(e) AS properties
            SKIP $offset LIMIT $limit
            """
        else:
            query = """
            MATCH (e)
            WHERE NOT e:Document  
            RETURN elementId(e) AS id,
                   CASE
                     WHEN e:Person THEN e.person_name
                     WHEN e:Phone THEN e.phone_number
                     WHEN e:Vehicle THEN e.registration_number
                     WHEN e:BankAccount THEN e.account_number
                     WHEN e:Organization THEN e.name
                     WHEN e:Location THEN e.name
                     ELSE 'Unknown'
                   END AS value,
                   labels(e) AS types, properties(e) AS properties
            SKIP $offset LIMIT $limit
            """

        result = neo4j_connector.run_query(query, {"limit": limit, "offset": offset})

        entities = []
        for record in result:
            entities.append({
                "id": record["id"],
                "value": record["value"],
                "types": record["types"],
                "properties": record["properties"]
            })

        return {
            "entities": entities,
            "count": len(entities),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{entity_id}")
async def get_entity(entity_id: str):
    """
    Get a specific entity by its internal Neo4j ID.
    """
    try:
        query = """
        MATCH (e)
        WHERE elementId(e) = $entity_id
        RETURN elementId(e) AS id,
               labels(e) AS types,
               properties(e) AS properties
        """
        result = neo4j_connector.run_query(query, {"entity_id": entity_id})

        if not result:
            raise HTTPException(status_code=404, detail="Entity not found")

        record = result[0]
        return {
            "id": record["id"],
            "types": record["types"],
            "properties": record["properties"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/")
async def search_entities(
    q: str = Query(..., description="Search query"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(20, description="Maximum number of results")
):
    """
    Search entities by text match in their primary properties.
    """
    try:
        if entity_type:
            # Map entity type to Neo4j label and property
            type_mapping = {
                "PERSON": ("Person", "person_name"),
                "PHONE": ("Phone", "phone_number"),
                "VEHICLE": ("Vehicle", "registration_number"),
                "ACCOUNT": ("BankAccount", "account_number"),
                "ORGANIZATION": ("Organization", "name"),
                "LOCATION": ("Location", "name")
            }

            if entity_type.upper() not in type_mapping:
                raise HTTPException(status_code=400, detail=f"Unsupported entity type: {entity_type}")

            label, property_name = type_mapping[entity_type.upper()]
            query = f"""
            MATCH (e:{label})
            WHERE toLower(e.{property_name}) CONTAINS toLower($query)
            RETURN elementId(e) AS id, e.{property_name} AS value,
                   labels(e) AS types, properties(e) AS properties
            LIMIT $limit
            """
        else:
            query = """
            MATCH (e)
            WHERE
              (e:Person AND toLower(e.person_name) CONTAINS toLower($query)) OR
              (e:Phone AND toLower(e.phone_number) CONTAINS toLower($query)) OR
              (e:Vehicle AND toLower(e.registration_number) CONTAINS toLower($query)) OR
              (e:BankAccount AND toLower(e.account_number) CONTAINS toLower($query)) OR
              (e:Organization AND toLower(e.name) CONTAINS toLower($query)) OR
              (e:Location AND toLower(e.name) CONTAINS toLower($query))
            RETURN elementId(e) AS id,
                   CASE
                     WHEN e:Person THEN e.person_name
                     WHEN e:Phone THEN e.phone_number
                     WHEN e:Vehicle THEN e.registration_number
                     WHEN e:BankAccount THEN e.account_number
                     WHEN e:Organization THEN e.name
                     WHEN e:Location THEN e.name
                     ELSE 'Unknown'
                   END AS value,
                   labels(e) AS types, properties(e) AS properties
            LIMIT $limit
            """

        result = neo4j_connector.run_query(query, {"query": q, "limit": limit})

        entities = []
        for record in result:
            entities.append({
                "id": record["id"],
                "value": record["value"],
                "types": record["types"],
                "properties": record["properties"]
            })

        return {
            "entities": entities,
            "query": q,
            "count": len(entities)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def _get_primary_property(label: str) -> str:
    """Get the primary property name for a given label."""
    mapping = {
        "Person": "person_name",
        "Phone": "phone_number",
        "Vehicle": "registration_number",
        "BankAccount": "account_number",
        "Organization": "name",
        "Location": "name",
        "Document": "document_id"
    }
    return mapping.get(label, "name")