from app.repositories.neo4j_connector import neo4j_connector
import logging

logger = logging.getLogger(__name__)

def run_pagerank():
    """
    Run PageRank algorithm on the graph.
    """
    logger.info("Running PageRank...")
    # Check if GDS is installed
    try:
        # The GDS procedure call
        query = """
        CALL gds.pageRank.stream({
            nodeProjection: ['Person', 'Phone', 'Vehicle', 'BankAccount', 'Organization', 'Location'],
            relationshipProjection: {
                CALLS: {type: 'CALLS', orientation: 'NATURAL'},
                TRANSFERS: {type: 'TRANSFERS', orientation: 'NATURAL'},
                USES_PHONE: {type: 'USES_PHONE', orientation: 'NATURAL'},
                OWNS: {type: 'OWNS', orientation: 'NATURAL'},
                ASSOCIATED_WITH: {type: 'ASSOCIATED_WITH', orientation: 'NATURAL'},
                HELD_BY: {type: 'HELD_BY', orientation: 'NATURAL'},
                LOCATED_AT: {type: 'LOCATED_AT', orientation: 'NATURAL'},
                REGISTERED_TO: {type: 'REGISTERED_TO', orientation: 'NATURAL'},
                INVOLVED_IN: {type: 'INVOLVED_IN', orientation: 'NATURAL'},
                MENTIONED_IN: {type: 'MENTIONED_IN', orientation: 'NATURAL'}
            }
        })
        YIELD nodeId, score
        RETURN gds.util.asNode(nodeId).name AS name, score
        ORDER BY score DESC
        LIMIT 20
        """
        results = neo4j_connector.run_query(query)
        logger.info(f"PageRank completed. Top 20 scores: {results}")
        return results
    except Exception as e:
        logger.error(f"Failed to run PageRank: {e}")
        # Fallback: return empty list
        return []

def run_betweenness_centrality():
    """
    Run Betweenness Centrality algorithm on the graph.
    """
    logger.info("Running Betweenness Centrality...")
    try:
        query = """
        CALL gds.betweennessCentrality.stream({
            nodeProjection: ['Person', 'Phone', 'Vehicle', 'BankAccount', 'Organization', 'Location'],
            relationshipProjection: {
                CALLS: {type: 'CALLS', orientation: 'NATURAL'},
                TRANSFERS: {type: 'TRANSFERS', orientation: 'NATURAL'},
                USES_PHONE: {type: 'USES_PHONE', orientation: 'NATURAL'},
                OWNS: {type: 'OWNS', orientation: 'NATURAL'},
                ASSOCIATED_WITH: {type: 'ASSOCIATED_WITH', orientation: 'NATURAL'},
                HELD_BY: {type: 'HELD_BY', orientation: 'NATURAL'},
                LOCATED_AT: {type: 'LOCATED_AT', orientation: 'NATURAL'},
                REGISTERED_TO: {type: 'REGISTERED_TO', orientation: 'NATURAL'},
                INVOLVED_IN: {type: 'INVOLVED_IN', orientation: 'NATURAL'},
                MENTIONED_IN: {type: 'MENTIONED_IN', orientation: 'NATURAL'}
            }
        })
        YIELD nodeId, score
        RETURN gds.util.asNode(nodeId).name AS name, score
        ORDER BY score DESC
        LIMIT 20
        """
        results = neo4j_connector.run_query(query)
        logger.info(f"Betweenness Centrality completed. Top 20 scores: {results}")
        return results
    except Exception as e:
        logger.error(f"Failed to run Betweenness Centrality: {e}")
        return []

def run_pagerank_and_betweenness():
    """
    Run both PageRank and Betweenness Centrality and return the results.
    """
    pagerank_results = run_pagerank()
    betweenness_results = run_betweenness_centrality()
    return {
        "pagerank": pagerank_results,
        "betweenness": betweenness_results
    }

def run_community_detection():
    """
    Run community detection (Louvain) on the graph.
    """
    logger.info("Running Community Detection (Louvain)...")
    try:
        query = """
        CALL gds.louvain.stream({
            nodeProjection: ['Person', 'Phone', 'Vehicle', 'BankAccount', 'Organization', 'Location'],
            relationshipProjection: {
                CALLS: {type: 'CALLS', orientation: 'NATURAL'},
                TRANSFERS: {type: 'TRANSFERS', orientation: 'NATURAL'},
                USES_PHONE: {type: 'USES_PHONE', orientation: 'NATURAL'},
                OWNS: {type: 'OWNS', orientation: 'NATURAL'},
                ASSOCIATED_WITH: {type: 'ASSOCIATED_WITH', orientation: 'NATURAL'},
                HELD_BY: {type: 'HELD_BY', orientation: 'NATURAL'},
                LOCATED_AT: {type: 'LOCATED_AT', orientation: 'NATURAL'},
                REGISTERED_TO: {type: 'REGISTERED_TO', orientation: 'NATURAL'},
                INVOLVED_IN: {type: 'INVOLVED_IN', orientation: 'NATURAL'},
                MENTIONED_IN: {type: 'MENTIONED_IN', orientation: 'NATURAL'}
            }
        })
        YIELD nodeId, communityId
        RETURN gds.util.asNode(nodeId).name AS name, communityId
        ORDER BY communityId, name
        """
        results = neo4j_connector.run_query(query)
        logger.info(f"Community Detection completed. Found {len(results)} node assignments.")
        return results
    except Exception as e:
        logger.error(f"Failed to run Community Detection: {e}")
        return []

def run_degree_centrality():
    """
    Run Degree Centrality algorithm on the graph.
    """
    logger.info("Running Degree Centrality...")
    try:
        query = """
        CALL gds.degree.stream({
            nodeProjection: ['Person', 'Phone', 'Vehicle', 'BankAccount', 'Organization', 'Location'],
            relationshipProjection: {
                CALLS: {type: 'CALLS', orientation: 'NATURAL'},
                TRANSFERS: {type: 'TRANSFERS', orientation: 'NATURAL'},
                USES_PHONE: {type: 'USES_PHONE', orientation: 'NATURAL'},
                OWNS: {type: 'OWNS', orientation: 'NATURAL'},
                ASSOCIATED_WITH: {type: 'ASSOCIATED_WITH', orientation: 'NATURAL'},
                HELD_BY: {type: 'HELD_BY', orientation: 'NATURAL'},
                LOCATED_AT: {type: 'LOCATED_AT', orientation: 'NATURAL'},
                REGISTERED_TO: {type: 'REGISTERED_TO', orientation: 'NATURAL'},
                INVOLVED_IN: {type: 'INVOLVED_IN', orientation: 'NATURAL'},
                MENTIONED_IN: {type: 'MENTIONED_IN', orientation: 'NATURAL'}
            }
        })
        YIELD nodeId, score
        RETURN gds.util.asNode(nodeId).name AS name, score
        ORDER BY score DESC
        LIMIT 20
        """
        results = neo4j_connector.run_query(query)
        logger.info(f"Degree Centrality completed. Top 20 scores: {results}")
        return results
    except Exception as e:
        logger.error(f"Failed to run Degree Centrality: {e}")
        return []