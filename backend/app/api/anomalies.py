from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.repositories.neo4j_connector import neo4j_connector
import statistics

router = APIRouter()

@router.get("/high-degree-entities")
async def detect_high_degree_entities(
    threshold_std_dev: float = Query(2.0, description="Number of standard deviations above mean to consider anomalous"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(20, description="Maximum number of results to return")
):
    """
    Detect entities with unusually high degree (potential hubs in the network).
    Uses statistical method: mean + threshold_std_dev * std_dev
    """
    try:
        # Map entity type to Neo4j label
        type_to_label = {
            "PERSON": "Person",
            "PHONE": "Phone",
            "VEHICLE": "Vehicle",
            "ACCOUNT": "BankAccount",
            "ORGANIZATION": "Organization",
            "LOCATION": "Location"
        }

        label_clause = ""
        params = {"threshold_std_dev": threshold_std_dev, "limit": limit}
        if entity_type:
            if entity_type.upper() not in type_to_label:
                raise HTTPException(status_code=400, detail=f"Unsupported entity type: {entity_type}")
            label = type_to_label[entity_type.upper()]
            label_clause = f"AND n:{label}"

        # First, calculate degree statistics
        stats_query = f"""
        MATCH (n)
        WHERE 1=1 {label_clause}
        OPTIONAL MATCH (n)-[r]-()
        WITH n, count(r) AS degree
        RETURN avg(degree) AS mean_degree, stDev(degree) AS std_dev_degree
        """

        stats_result = neo4j_connector.run_query(stats_query, params)
        if not stats_result or stats_result[0]["mean_degree"] is None:
            return {
                "anomalies": [],
                "message": "Not enough data to calculate statistics",
                "threshold_used": threshold_std_dev
            }

        mean_degree = stats_result[0]["mean_degree"]
        std_dev_degree = stats_result[0]["std_dev_degree"] or 0.0  # Handle case where std_dev is None
        threshold = mean_degree + (threshold_std_dev * std_dev_degree)

        # Then find entities above the threshold
        anomaly_query = f"""
        MATCH (n)
        WHERE 1=1 {label_clause}
        OPTIONAL MATCH (n)-[r]-()
        WITH n, count(r) AS degree
        WHERE degree > $threshold
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

        anomaly_params = {
            "threshold": threshold,
            "limit": limit
        }
        if entity_type:
            anomaly_params["label_clause"] = label_clause  # This won't work directly, need to rebuild query

        # Rebuild query with label clause
        anomaly_query = f"""
        MATCH (n)
        WHERE 1=1 {label_clause}
        OPTIONAL MATCH (n)-[r]-()
        WITH n, count(r) AS degree
        WHERE degree > $threshold
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

        result = neo4j_connector.run_query(anomaly_query, {"threshold": threshold, "limit": limit})

        anomalies = []
        for record in result:
            anomalies.append({
                "id": record["id"],
                "types": record["types"],
                "value": record["value"],
                "degree": record["degree"],
                "z_score": (record["degree"] - mean_degree) / std_dev_degree if std_dev_degree > 0 else 0
            })

        return {
            "anomaly_type": "high_degree_entities",
            "description": "Entities with unusually high number of connections (potential network hubs)",
            "statistics": {
                "mean_degree": mean_degree,
                "std_dev_degree": std_dev_degree,
                "threshold": threshold,
                "threshold_std_dev": threshold_std_dev
            },
            "anomalies": anomalies,
            "count": len(anomalies)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/isolated-entities")
async def detect_isolated_entities(
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(20, description="Maximum number of results to return")
):
    """
    Detect entities with no connections (isolated nodes).
    """
    try:
        # Map entity type to Neo4j label
        type_to_label = {
            "PERSON": "Person",
            "PHONE": "Phone",
            "VEHICLE": "Vehicle",
            "ACCOUNT": "BankAccount",
            "ORGANIZATION": "Organization",
            "LOCATION": "Location"
        }

        label_clause = ""
        params = {"limit": limit}
        if entity_type:
            if entity_type.upper() not in type_to_label:
                raise HTTPException(status_code=400, detail=f"Unsupported entity type: {entity_type}")
            label = type_to_label[entity_type.upper()]
            label_clause = f"AND n:{label}"

        query = f"""
        MATCH (n)
        WHERE 1=1 {label_clause}
        AND NOT (n)-[]-()
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
               END AS value
        LIMIT $limit
        """

        result = neo4j_connector.run_query(query, params)

        anomalies = []
        for record in result:
            anomalies.append({
                "id": record["id"],
                "types": record["types"],
                "value": record["value"]
            })

        return {
            "anomaly_type": "isolated_entities",
            "description": "Entities with no connections to any other entities",
            "anomalies": anomalies,
            "count": len(anomalies)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mutual-exclusivity")
async def detect_mutual_exclusivity_pairs(
    min_co_occurrence: int = Query(2, description="Minimum number of shared documents to consider"),
    max_exclusivity_score: float = Query(0.3, description="Maximum exclusivity score to consider anomalous (0-1)")
):
    """
    Detect pairs of entities that rarely appear together in documents despite appearing frequently individually.
    This can indicate potential aliases or false identities.
    """
    try:
        # This is a simplified version - a full implementation would be more complex
        query = """
        MATCH (d:Document)-[r1:MENTIONED_IN]->(e1)
        MATCH (d:Document)-[r2:MENTIONED_IN]->(e2)
        WHERE e1 <> e2
        AND elementId(e1) < elementId(e2)  // Avoid duplicate pairs
        WITH e1, e2, count(d) AS co_occurrence_count
        MATCH (e1)-[r1:MENTIONED_IN]->(d1:Document)
        WITH e1, e2, co_occurrence_count, count(DISTINCT d1) AS e1_doc_count
        MATCH (e2)-[r2:MENTIONED_IN]->(d2:Document)
        WITH e1, e2, co_occurrence_count, e1_doc_count, count(DISTINCT d2) AS e2_doc_count
        WHERE e1_doc_count > 0 AND e2_doc_count > 0
        // Calculate Jaccard similarity: intersection / union
        WITH e1, e2, co_occurrence_count, e1_doc_count, e2_doc_count,
             toFloat(co_occurrence_count) / (e1_doc_count + e2_doc_count - co_occurrence_count) AS jaccard_similarity
        WHERE co_occurrence_count >= $min_co_occurrence
          AND jaccard_similarity <= $max_exclusivity_score
        RETURN elementId(e1) AS entity1_id,
               labels(e1) AS entity1_types,
               CASE
                 WHEN e1:Person THEN e1.person_name
                 WHEN e1:Phone THEN e1.phone_number
                 WHEN e1:Vehicle THEN e1.registration_number
                 WHEN e1:BankAccount THEN e1.account_number
                 WHEN e1:Organization THEN e1.name
                 WHEN e1:Location THEN e1.name
                 ELSE 'Unknown'
               END AS entity1_value,
               elementId(e2) AS entity2_id,
               labels(e2) AS entity2_types,
               CASE
                 WHEN e2:Person THEN e2.person_name
                 WHEN e2:Phone THEN e2.phone_number
                 WHEN e2:Vehicle THEN e2.registration_number
                 WHEN e2:BankAccount THEN e2.account_number
                 WHEN e2:Organization THEN e2.name
                 WHEN e2:Location THEN e2.name
                 ELSE 'Unknown'
               END AS entity2_value,
               co_occurrence_count,
               e1_doc_count AS entity1_document_count,
               e2_doc_count AS entity2_document_count,
               jaccard_similarity
        ORDER BY jaccard_similarity ASC
        LIMIT 20
        """

        result = neo4j_connector.run_query(query, {
            "min_co_occurrence": min_co_occurrence,
            "max_exclusivity_score": max_exclusivity_score
        })

        anomalies = []
        for record in result:
            anomalies.append({
                "entity1": {
                    "id": record["entity1_id"],
                    "types": record["entity1_types"],
                    "value": record["entity1_value"]
                },
                "entity2": {
                    "id": record["entity2_id"],
                    "types": record["entity2_types"],
                    "value": record["entity2_value"]
                },
                "shared_documents": record["co_occurrence_count"],
                "entity1_document_count": record["entity1_document_count"],
                "entity2_document_count": record["entity2_document_count"],
                "exclusivity_score": record["jaccard_similarity"]  # Lower score means more exclusive
            })

        return {
            "anomaly_type": "mutual_exclusivity_pairs",
            "description": "Pairs of entities that rarely appear together in documents despite appearing frequently individually",
            "parameters": {
                "min_co_occurrence": min_co_occurrence,
                "max_exclusivity_score": max_exclusivity_score
            },
            "anomalies": anomalies,
            "count": len(anomalies)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))