from neo4j import GraphDatabase
from app.config import settings
import logging

logger = logging.getLogger(__name__)

class Neo4jConnector:
    def __init__(self):
        self.driver = None
        self._connect()

    def _connect(self):
        try:
            self.driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            # Do not verify connectivity here to allow app to start without Neo4j
            logger.info("Neo4j driver initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Neo4j driver: {e}")
            # We don't raise here to allow the app to start

    def close(self):
        if self.driver:
            self.driver.close()

    def run_query(self, query, parameters=None):
        if not self.driver:
            raise Exception("Neo4j driver not initialized")
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record for record in result]

    def verify_connectivity(self):
        if not self.driver:
            raise Exception("Neo4j driver not initialized")
        self.driver.verify_connectivity()

# Singleton instance
neo4j_connector = Neo4jConnector()
