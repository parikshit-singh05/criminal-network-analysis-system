from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.repositories.neo4j_connector import neo4j_connector

router = APIRouter()

@router.get("/stats")
async def get_graph_stats():
    """
    Get total counts of nodes and relationships in the database.
    """
    try:
        nodes_query = "MATCH (n) RETURN count(n) as count"
        rels_query = "MATCH ()-[r]->() RETURN count(r) as count"
        
        nodes_result = neo4j_connector.run_query(nodes_query)
        rels_result = neo4j_connector.run_query(rels_query)
        
        total_nodes = nodes_result[0]["count"] if nodes_result else 0
        total_rels = rels_result[0]["count"] if rels_result else 0
        
        return {
            "total_nodes": total_nodes,
            "total_relationships": total_rels
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/traverse/{entity_id}")
async def traverse_graph(
    entity_id: str,
    max_depth: int = Query(3, description="Maximum traversal depth"),
    relationship_types: Optional[str] = Query(None, description="Comma-separated list of relationship types to follow"),
    direction: str = Query("both", description="Direction: 'in', 'out', or 'both'")
):
    """
    Traverse the graph from a starting entity.
    """
    try:
        # Validate direction
        if direction not in ["in", "out", "both"]:
            raise HTTPException(status_code=400, detail="Direction must be 'in', 'out', or 'both'")

        # Build relationship type filter string
        rel_type_filter = ""
        if relationship_types:
            rel_types = [rt.strip().upper() for rt in relationship_types.split(",") if rt.strip()]
            if rel_types:
                rel_type_filter = "|".join(rel_types)

        # Build relationship pattern with direction and variable length
        if direction == "out":
            rel_pattern = f"-[r:{rel_type_filter}*1..{max_depth}]->" if rel_type_filter else f"-[r*1..{max_depth}]->"
        elif direction == "in":
            rel_pattern = f"<-[r:{rel_type_filter}*1..{max_depth}]-" if rel_type_filter else f"<-[r*1..{max_depth}]>-"
        else:  # both
            rel_pattern = f"-[r:{rel_type_filter}*1..{max_depth}]-" if rel_type_filter else f"-[r*1..{max_depth}]-"

        query = f"""
        MATCH path = (startNode){rel_pattern}(endNode)
        WHERE elementId(startNode) = $entity_id
        RETURN [n IN nodes(path) |
                {{
                  id: elementId(n),
                  labels: labels(n),
                  properties: properties(n)
                }}
               ] AS nodes,
               [r IN relationships(path) |
                {{
                  id: elementId(r),
                  type: type(r),
                  properties: properties(r),
                  startNode: elementId(startNode(r)),
                  endNode: elementId(endNode(r))
                }}
               ] AS relationships
        LIMIT 100
        """

        result = neo4j_connector.run_query(query, {"entity_id": entity_id})

        if not result:
            # Return just the starting node if no paths found
            node_query = """
            MATCH (e)
            WHERE elementId(e) = $entity_id
            RETURN elementId(e) AS id, labels(e) AS types, properties(e) AS properties
            """
            node_result = neo4j_connector.run_query(node_query, {"entity_id": entity_id})
            if not node_result:
                raise HTTPException(status_code=404, detail="Starting entity not found")

            node_record = node_result[0]
            return {
                "starting_entity": {
                    "id": node_record["id"],
                    "types": node_record["types"],
                    "properties": node_record["properties"]
                },
                "paths": [],
                "message": "No paths found within the specified depth and relationship types"
            }

        record = result[0]
        return {
            "starting_entity_id": entity_id,
            "max_depth": max_depth,
            "relationship_types": relationship_types,
            "direction": direction,
            "paths": [{
                "nodes": record["nodes"],
                "relationships": record["relationships"]
            }]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/path/{from_entity_id}/{to_entity_id}")
async def find_shortest_path(
    from_entity_id: str,
    to_entity_id: str,
    relationship_types: Optional[str] = Query(None, description="Comma-separated list of relationship types to follow"),
    max_hops: int = Query(6, description="Maximum number of hops in path")
):
    """
    Find the shortest path between two entities.
    """
    try:
        # Build relationship type filter string
        rel_type_filter = ""
        if relationship_types:
            rel_types = [rt.strip().upper() for rt in relationship_types.split(",") if rt.strip()]
            if rel_types:
                rel_type_filter = "|".join(rel_types)

        # Build relationship pattern for shortest path (single direction, variable length)
        if rel_type_filter:
            rel_pattern = f"[r:{rel_type_filter}*1..{max_hops}]"
        else:
            rel_pattern = f"[r*1..{max_hops}]"

        query = f"""
        MATCH path = shortestPath(
          (startNode)-{rel_pattern}-(endNode)
        )
        WHERE elementId(startNode) = $from_entity_id
          AND elementId(endNode) = $to_entity_id
        RETURN [n IN nodes(path) |
                {{
                  id: elementId(n),
                  labels: labels(n),
                  properties: properties(n)
                }}
               ] AS nodes,
               [r IN relationships(path) |
                {{
                  id: elementId(r),
                  type: type(r),
                  properties: properties(r),
                  startNode: elementId(startNode(r)),
                  endNode: elementId(endNode(r))
                }}
               ] AS relationships,
               length(path) AS hops
        """

        result = neo4j_connector.run_query(query, {
            "from_entity_id": from_entity_id,
            "to_entity_id": to_entity_id,
            "max_hops": max_hops
        })

        if not result:
            raise HTTPException(status_code=404, detail="No path found between the entities")

        record = result[0]
        return {
            "from_entity_id": from_entity_id,
            "to_entity_id": to_entity_id,
            "max_hops": max_hops,
            "relationship_types": relationship_types,
            "path": {
                "nodes": record["nodes"],
                "relationships": record["relationships"],
                "hops": record["hops"]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/neighbors/{entity_id}")
async def get_neighbors(
    entity_id: str,
    relationship_types: Optional[str] = Query(None, description="Comma-separated list of relationship types"),
    direction: str = Query("both", description="Direction: 'in', 'out', or 'both'"),
    limit: int = Query(50, description="Maximum number of neighbors to return")
):
    """
    Get direct neighbors of an entity.
    """
    try:
        if direction not in ["in", "out", "both"]:
            raise HTTPException(status_code=400, detail="Direction must be 'in', 'out', or 'both'")

        # Build relationship type filter string
        rel_type_filter = ""
        if relationship_types:
            rel_types = [rt.strip().upper() for rt in relationship_types.split(",") if rt.strip()]
            if rel_types:
                rel_type_filter = "|".join(rel_types)

        # Build relationship pattern with direction and type filter
        if direction == "out":
            rel_pattern = f"-[r:{rel_type_filter}]->" if rel_type_filter else f"-[r]->"
        elif direction == "in":
            rel_pattern = f"<-[r:{rel_type_filter}]-" if rel_type_filter else f"<-[r]-"
        else:  # both
            rel_pattern = f"-[r:{rel_type_filter}]-" if rel_type_filter else f"-[r]-"

        query = f"""
        MATCH (startNode){rel_pattern}(endNode)
        WHERE elementId(startNode) = $entity_id
        RETURN elementId(endNode) AS id,
               labels(endNode) AS types,
               properties(endNode) AS properties,
               type(r) AS relationship_type
        LIMIT $limit
        """

        result = neo4j_connector.run_query(query, {"entity_id": entity_id, "limit": limit})

        neighbors = []
        for record in result:
            neighbors.append({
                "id": record["id"],
                "types": record["types"],
                "properties": record["properties"],
                "relationship_type": record["relationship_type"]
            })

        return {
            "entity_id": entity_id,
            "direction": direction,
            "relationship_types": relationship_types,
            "neighbors": neighbors,
            "count": len(neighbors)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/whole")
async def get_whole_graph(
    limit: int = Query(1000, description="Maximum number of nodes to return"),
    relationship_limit: int = Query(1000, description="Maximum number of relationships to return")
):
    """
    Get the whole graph (nodes and relationships) up to specified limits.
    Returns elements in Cytoscape.js format.
    """
    try:
        # Get nodes
        nodes_query = """
        MATCH (n)
        RETURN elementId(n) AS id,
               labels(n) AS types,
               properties(n) AS properties
        LIMIT $limit
        """

        nodes_result = neo4j_connector.run_query(nodes_query, {"limit": limit})

        elements = []
        for record in nodes_result:
            # Determine a label for the node
            label = record["properties"].get('person_name') or record["properties"].get('phone_number') or record["properties"].get('registration_number') or record["properties"].get('account_number') or record["properties"].get('name') or 'Unknown'
            elements.append({
                "data": {
                    "id": record["id"],
                    "label": label,
                    "type": record["types"][0] if record["types"] else "Unknown",
                    **record["properties"]
                }
            })

        valid_node_ids = [record["id"] for record in nodes_result]

        # Get relationships ONLY between the fetched nodes to ensure consistency
        if valid_node_ids:
            rels_query = """
            MATCH (a)-[r]->(b)
            WHERE elementId(a) IN $node_ids AND elementId(b) IN $node_ids
            RETURN elementId(r) AS id,
                   type(r) AS type,
                   properties(r) AS properties,
                   elementId(a) AS source,
                   elementId(b) AS target
            LIMIT $relationship_limit
            """
            rels_result = neo4j_connector.run_query(rels_query, {
                "node_ids": valid_node_ids,
                "relationship_limit": relationship_limit
            })
    
            for record in rels_result:
                elements.append({
                    "data": {
                        "id": record["id"],
                        "source": record["source"],
                        "target": record["target"],
                        "label": record["type"],
                        **record["properties"]
                    }
                })

        return elements
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))