from fastapi import APIRouter
from app.repositories.neo4j_connector import neo4j_connector

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/health/neo4j")
async def neo4j_health_check():
    try:
        neo4j_connector.verify_connectivity()
        return {"status": "healthy", "message": "Neo4j connection is healthy"}
    except Exception as e:
        return {"status": "unhealthy", "message": f"Neo4j connection failed: {str(e)}"}
