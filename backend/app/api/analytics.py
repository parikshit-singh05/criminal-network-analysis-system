from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.repositories.neo4j_connector import neo4j_connector

router = APIRouter()


@router.get("/degree-centrality")
async def get_degree_centrality(
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(10, description="Number of top entities to return")
):
    """
    Get degree centrality (number of connections) for entities.
    """
    try:
        type_to_label = {
            "PERSON": "Person",
            "PHONE": "Phone",
            "VEHICLE": "Vehicle",
            "ACCOUNT": "BankAccount",
            "ORGANIZATION": "Organization",
            "LOCATION": "Location"
        }

        if entity_type and entity_type.upper() not in type_to_label:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported entity type: {entity_type}"
            )

        label_clause = ""
        params = {"limit": limit}
        if entity_type:
            label = type_to_label[entity_type.upper()]
            label_clause = f"AND n:{label}"

        query = f"""
        MATCH (n)
        WHERE 1=1 {label_clause}
        OPTIONAL MATCH (n)-[r]-()
        WITH n, count(r) AS degree
        RETURN elementId(n) AS id,
               labels(n) AS types,
               CASE
                 WHEN n:Person THEN n.person_name
                 WHEN n:Phone THEN n.phone_number
                 WHEN n:Vehicle THEN n.registration_number
                 WHEN n:BankAccount THEN n.account_number
                 WHEN n:Organization THEN n.name
                 WHEN n:Location THEN n.name
                 ELSE 'Unknown'
               END AS value,
               degree
        ORDER BY degree DESC
        LIMIT $limit
        """

        result = neo4j_connector.run_query(query, params)

        centrality = []
        for record in result:
            centrality.append({
                "id": record["id"],
                "types": record["types"],
                "value": record["value"],
                "degree": record["degree"]
            })

        return {
            "metric": "degree_centrality",
            "entity_type": entity_type,
            "centrality": centrality
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/connected-components")
async def get_connected_components(
    min_size: int = Query(2, description="Minimum size of component to report")
):
    """
    Find connected components without relying on APOC.

    For each non-Document node, collect the non-Document nodes reachable
    from it, derive a stable component key from the minimum elementId, and
    group nodes by that key.
    """
    try:
        if min_size < 1:
            raise HTTPException(
                status_code=400,
                detail="min_size must be at least 1"
            )

        query = """
        MATCH (n)
        WHERE NOT n:Document

        CALL {
            WITH n
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
                    WHEN member:Person THEN member.person_name
                    WHEN member:Phone THEN member.phone_number
                    WHEN member:Vehicle THEN member.registration_number
                    WHEN member:BankAccount THEN member.account_number
                    WHEN member:Organization THEN member.name
                    WHEN member:Location THEN member.name
                    WHEN member:Case THEN coalesce(member.case_id, member.title, member.name)
                    WHEN member:Document THEN coalesce(member.document_id, member.file_name, member.title)
                    ELSE coalesce(member.name, member.id, 'Unknown')
                  END
                }
               ] AS members,
               size(component_nodes) AS size
        ORDER BY size DESC
        """

        result = neo4j_connector.run_query(
            query,
            {"min_size": min_size}
        )

        components = []
        for record in result:
            components.append({
                "component_id": record["component_id"],
                "size": record["size"],
                "members": record["members"]
            })

        return {
            "min_component_size": min_size,
            "components": components,
            "count": len(components)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Connected components analysis failed: {str(e)}"
        )


@router.get("/clustering-coefficient/{entity_id}")
async def get_clustering_coefficient(entity_id: str):
    """
    Get the local clustering coefficient for an entity.
    Measures how closely the neighbors of a node are connected to each other.
    """
    try:
        query = """
        MATCH (n)
        WHERE elementId(n) = $entity_id
        OPTIONAL MATCH (n)-[r1]-()(f)-[r2]-(n)
        WHERE r1 <> r2
        WITH n, count(DISTINCT f) AS connections_between_neighbors
        OPTIONAL MATCH (n)-[r]-()
        WITH n, connections_between_neighbors, count(r) AS total_neighbors
        WHERE total_neighbors > 1
        RETURN elementId(n) AS id,
               labels(n) AS types,
               CASE
                 WHEN n:Person THEN n.person_name
                 WHEN n:Phone THEN n.phone_number
                 WHEN n:Vehicle THEN n.registration_number
                 WHEN n:BankAccount THEN n.account_number
                 WHEN n:Organization THEN n.name
                 WHEN n:Location THEN n.name
                 ELSE 'Unknown'
               END AS value,
               total_neighbors,
               connections_between_neighbors,
               toFloat(2 * connections_between_neighbors) / (total_neighbors * (total_neighbors - 1)) AS clustering_coefficient
        """

        result = neo4j_connector.run_query(query, {"entity_id": entity_id})

        if not result:
            raise HTTPException(status_code=404, detail="Entity not found")

        record = result[0]
        if record["total_neighbors"] < 2:
            coefficient = 0.0
        else:
            coefficient = record["clustering_coefficient"]

        return {
            "entity_id": entity_id,
            "entity": {
                "id": record["id"],
                "types": record["types"],
                "value": record["value"]
            },
            "total_neighbors": record["total_neighbors"],
            "connections_between_neighbors": record["connections_between_neighbors"],
            "clustering_coefficient": coefficient
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
