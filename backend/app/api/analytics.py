from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.repositories.neo4j_connector import neo4j_connector

router = APIRouter()


@router.get("/degree-centrality")
async def get_degree_centrality(
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(10, description="Number of top entities to return")
):
    """Get degree centrality (number of connections) for entities."""
    try:
        if limit < 1:
            raise HTTPException(status_code=400, detail="limit must be at least 1")

        type_to_label = {
            "PERSON": "Person",
            "PHONE": "Phone",
            "VEHICLE": "Vehicle",
            "ACCOUNT": "BankAccount",
            "ORGANIZATION": "Organization",
            "LOCATION": "Location",
        }

        if entity_type and entity_type.upper() not in type_to_label:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported entity type: {entity_type}",
            )

        label_clause = ""
        params = {"limit": limit}
        if entity_type:
            label_clause = f"AND n:{type_to_label[entity_type.upper()]}"

        query = f"""
        MATCH (n)
        WHERE 1=1 {label_clause}
        OPTIONAL MATCH (n)-[r]-()
        WITH n, count(r) AS degree
        RETURN elementId(n) AS id,
               labels(n) AS types,
               CASE
                 WHEN n:Person THEN properties(n)['person_name']
                 WHEN n:Phone THEN properties(n)['phone_number']
                 WHEN n:Vehicle THEN properties(n)['registration_number']
                 WHEN n:BankAccount THEN properties(n)['account_number']
                 WHEN n:Organization THEN properties(n)['name']
                 WHEN n:Location THEN properties(n)['name']
                 WHEN n:Case THEN coalesce(
                     properties(n)['case_id'],
                     properties(n)['title'],
                     properties(n)['name']
                 )
                 WHEN n:Document THEN coalesce(
                     properties(n)['document_id'],
                     properties(n)['title']
                 )
                 ELSE coalesce(properties(n)['name'], 'Unknown')
               END AS value,
               degree
        ORDER BY degree DESC
        LIMIT $limit
        """

        result = neo4j_connector.run_query(query, params)
        centrality = [
            {
                "id": record["id"],
                "types": record["types"],
                "value": record["value"],
                "degree": record["degree"],
            }
            for record in result
        ]

        return {
            "metric": "degree_centrality",
            "entity_type": entity_type,
            "centrality": centrality,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/connected-components")
async def get_connected_components(
    min_size: int = Query(2, description="Minimum size of component to report")
):
    """Find connected components using native Cypher, without APOC."""
    try:
        if min_size < 1:
            raise HTTPException(status_code=400, detail="min_size must be at least 1")

        query = """
        MATCH (n)
        WHERE NOT n:Document

        CALL (n) {
            MATCH p = (n)-[*0..]-(m)
            WHERE NOT m:Document
              AND ALL(x IN nodes(p) WHERE NOT x:Document)
            RETURN collect(DISTINCT m) AS reachable_nodes
        }

        UNWIND reachable_nodes AS member
        WITH min(elementId(member)) AS component_id,
             collect(DISTINCT member) AS component_nodes
        WHERE size(component_nodes) >= $min_size

        RETURN component_id,
               [member IN component_nodes |
                {
                    id: elementId(member),
                    labels: labels(member),
                    value: CASE
                        WHEN member:Person THEN properties(member)['person_name']
                        WHEN member:Phone THEN properties(member)['phone_number']
                        WHEN member:Vehicle THEN properties(member)['registration_number']
                        WHEN member:BankAccount THEN properties(member)['account_number']
                        WHEN member:Organization THEN properties(member)['name']
                        WHEN member:Location THEN coalesce(
                            properties(member)['name'],
                            properties(member)['address']
                        )
                        WHEN member:Case THEN coalesce(
                            properties(member)['case_id'],
                            properties(member)['title'],
                            properties(member)['name']
                        )
                        WHEN member:Document THEN coalesce(
                            properties(member)['document_id'],
                            properties(member)['title']
                        )
                        ELSE coalesce(properties(member)['name'], 'Unknown')
                    END
                }
               ] AS members,
               size(component_nodes) AS size
        ORDER BY size DESC
        """

        result = neo4j_connector.run_query(query, {"min_size": min_size})
        components = [
            {
                "component_id": record["component_id"],
                "size": record["size"],
                "members": record["members"],
            }
            for record in result
        ]

        return {
            "min_component_size": min_size,
            "components": components,
            "count": len(components),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Connected components analysis failed: {str(e)}",
        )


@router.get("/clustering-coefficient/{entity_id}")
async def get_clustering_coefficient(entity_id: str):
    """Get the local clustering coefficient for an entity."""
    try:
        query = """
        MATCH (n)
        WHERE elementId(n) = $entity_id

        OPTIONAL MATCH (n)-[r1]-()(f)-[r2]-(n)
        WHERE r1 <> r2

        WITH n, count(DISTINCT f) AS connections_between_neighbors
        OPTIONAL MATCH (n)-[r]-()
        WITH n, connections_between_neighbors, count(r) AS total_neighbors

        RETURN elementId(n) AS id,
               labels(n) AS types,
               CASE
                   WHEN n:Person THEN properties(n)['person_name']
                   WHEN n:Phone THEN properties(n)['phone_number']
                   WHEN n:Vehicle THEN properties(n)['registration_number']
                   WHEN n:BankAccount THEN properties(n)['account_number']
                   WHEN n:Organization THEN properties(n)['name']
                   WHEN n:Location THEN properties(n)['name']
                   WHEN n:Case THEN coalesce(
                       properties(n)['case_id'],
                       properties(n)['title'],
                       properties(n)['name']
                   )
                   WHEN n:Document THEN coalesce(
                       properties(n)['document_id'],
                       properties(n)['title']
                   )
                   ELSE coalesce(properties(n)['name'], 'Unknown')
               END AS value,
               total_neighbors,
               connections_between_neighbors,
               CASE
                   WHEN total_neighbors < 2 THEN 0.0
                   ELSE toFloat(2 * connections_between_neighbors) /
                        (total_neighbors * (total_neighbors - 1))
               END AS clustering_coefficient
        """

        result = neo4j_connector.run_query(query, {"entity_id": entity_id})
        if not result:
            raise HTTPException(status_code=404, detail="Entity not found")

        record = result[0]
        return {
            "entity_id": entity_id,
            "entity": {
                "id": record["id"],
                "types": record["types"],
                "value": record["value"],
            },
            "total_neighbors": record["total_neighbors"],
            "connections_between_neighbors": record["connections_between_neighbors"],
            "clustering_coefficient": record["clustering_coefficient"],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
