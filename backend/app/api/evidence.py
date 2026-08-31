from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from app.repositories.neo4j_connector import neo4j_connector

router = APIRouter()

@router.get("/documents")
async def list_documents(
    document_type: Optional[str] = Query(None, description="Filter by document type (FIR, Email, SocialMedia, etc.)"),
    limit: int = Query(50, description="Maximum number of documents to return"),
    offset: int = Query(0, description="Number of documents to skip")
):
    """
    List documents with optional filtering by type.
    """
    try:
        if document_type:
            query = """
            MATCH (d:Document)
            WHERE toLower(d.document_type) = toLower($document_type)
            RETURN elementId(d) AS id, d.document_id AS document_id,
                   d.document_type AS document_type, d.case_id AS case_id,
                   d.text_hash AS text_hash, d.source_info AS source_info
            SKIP $offset LIMIT $limit
            """
        else:
            query = """
            MATCH (d:Document)
            RETURN elementId(d) AS id, d.document_id AS document_id,
                   d.document_type AS document_type, d.case_id AS case_id,
                   d.text_hash AS text_hash, d.source_info AS source_info
            SKIP $offset LIMIT $limit
            """

        result = neo4j_connector.run_query(query, {
            "document_type": document_type,
            "limit": limit,
            "offset": offset
        })

        documents = []
        for record in result:
            documents.append({
                "id": record["id"],
                "document_id": record["document_id"],
                "document_type": record["document_type"],
                "case_id": record["case_id"],
                "text_hash": record["text_hash"],
                "source_info": record["source_info"]
            })

        return {
            "documents": documents,
            "count": len(documents),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}")
async def get_document(document_id: str):
    """
    Get a specific document by its document ID.
    """
    try:
        query = """
        MATCH (d:Document {document_id: $document_id})
        RETURN elementId(d) AS id, d.document_id AS document_id,
               d.document_type AS document_type, d.case_id AS case_id,
               d.text_hash AS text_hash, d.source_info AS source_info
        """
        result = neo4j_connector.run_query(query, {"document_id": document_id})

        if not result:
            raise HTTPException(status_code=404, detail="Document not found")

        record = result[0]
        # Also get entities mentioned in this document
        entities_query = """
        MATCH (d:Document {document_id: $document_id})-[r:MENTIONED_IN]->(e)
        RETURN elementId(e) AS id,
               labels(e) AS types,
               properties(e) AS properties,
               r.count AS mention_count
        ORDER BY r.count DESC
        """
        entities_result = neo4j_connector.run_query(entities_query, {"document_id": document_id})

        entities = []
        for record in entities_result:
            entities.append({
                "id": record["id"],
                "types": record["types"],
                "properties": record["properties"],
                "mention_count": record["mention_count"]
            })

        return {
            "id": record["id"],
            "document_id": record["document_id"],
            "document_type": record["document_type"],
            "case_id": record["case_id"],
            "text_hash": record["text_hash"],
            "source_info": record["source_info"],
            "mentioned_entities": entities
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents/{document_id}/entities")
async def get_document_entities(
    document_id: str,
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    limit: int = Query(100, description="Maximum number of entities to return")
):
    """
    Get entities mentioned in a specific document.
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
                "LOCATION": "Location"
            }
            if entity_type.upper() not in type_to_label:
                raise HTTPException(status_code=400, detail=f"Unsupported entity type: {entity_type}")
            label = type_to_label[entity_type.upper()]

            query = f"""
            MATCH (d:Document {{document_id: $document_id}})-[r:MENTIONED_IN]->(e:{label})
            RETURN elementId(e) AS id,
                   labels(e) AS types,
                   properties(e) AS properties,
                   r.count AS mention_count
            ORDER BY r.count DESC
            LIMIT $limit
            """
        else:
            query = """
            MATCH (d:Document {document_id: $document_id})-[r:MENTIONED_IN]->(e)
            WHERE NOT e:Document
            RETURN elementId(e) AS id,
                   labels(e) AS types,
                   properties(e) AS properties,
                   r.count AS mention_count
            ORDER BY r.count DESC
            LIMIT $limit
            """

        result = neo4j_connector.run_query(query, {
            "document_id": document_id,
            "limit": limit
        })

        entities = []
        for record in result:
            entities.append({
                "id": record["id"],
                "types": record["types"],
                "properties": record["properties"],
                "mention_count": record["mention_count"]
            })

        return {
            "document_id": document_id,
            "entity_type": entity_type,
            "entities": entities,
            "count": len(entities)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/entity-provenance/{entity_id}")
async def get_entity_provenance(entity_id: str):
    """
    Get the provenance (documents where mentioned) for a specific entity.
    """
    try:
        query = """
        MATCH (e)
        WHERE elementId(e) = $entity_id
        MATCH (d:Document)-[r:MENTIONED_IN]->(e)
        RETURN elementId(d) AS id,
               d.document_id AS document_id,
               d.document_type AS document_type,
               d.case_id AS case_id,
               r.count AS mention_count
        ORDER BY r.count DESC
        """
        result = neo4j_connector.run_query(query, {"entity_id": entity_id})

        if not result:
            # Check if entity exists
            entity_check = """
            MATCH (e)
            WHERE elementId(e) = $entity_id
            RETURN elementId(e) AS id
            """
            entity_result = neo4j_connector.run_query(entity_check, {"entity_id": entity_id})
            if not entity_result:
                raise HTTPException(status_code=404, detail="Entity not found")
            else:
                return {
                    "entity_id": entity_id,
                    "documents": [],
                    "count": 0,
                    "message": "Entity exists but is not mentioned in any documents"
                }

        documents = []
        for record in result:
            documents.append({
                "id": record["id"],
                "document_id": record["document_id"],
                "document_type": record["document_type"],
                "case_id": record["case_id"],
                "mention_count": record["mention_count"]
            })

        return {
            "entity_id": entity_id,
            "documents": documents,
            "count": len(documents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))