"""
NLP Service Factory for Criminal Network Analysis System.
This module provides a unified interface for NLP components, allowing
switching between regex-based and transformer-based implementations.
"""
import os
import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

# Configuration for NLP implementation selection
# Set USE_TRANSFORMER_NLP=true to use transformer-based models
USE_TRANSFORMER_NLP = os.getenv("USE_TRANSFORMER_NLP", "false").lower() == "true"

def get_ner_implementation():
    """
    Get the appropriate NER implementation based on configuration.

    Returns:
        Module with extract_entities_from_text function
    """
    if USE_TRANSFORMER_NLP:
        try:
            from app.nlp import transformer_ner
            logger.info("Using transformer-based NER implementation")
            return transformer_ner
        except ImportError as e:
            logger.warning(f"Failed to import transformer NER: {e}. Falling back to regex-based NER.")
            from app.nlp import ner
            return ner
    else:
        logger.info("Using regex-based NER implementation")
        from app.nlp import ner
        return ner

def get_relation_extractor_implementation():
    """
    Get the appropriate relation extractor implementation based on configuration.

    Returns:
        Module with extract_relations_from_text function
    """
    if USE_TRANSFORMER_NLP:
        try:
            from app.nlp import transformer_relation
            logger.info("Using transformer-enhanced relation extraction implementation")
            return transformer_relation
        except ImportError as e:
            logger.warning(f"Failed to import transformer relation extractor: {e}. Falling back to regex-based relation extractor.")
            from app.nlp import relation_extractor
            return relation_extractor
    else:
        logger.info("Using regex-based relation extraction implementation")
        from app.nlp import relation_extractor
        return relation_extractor

# Main interface functions that maintain backward compatibility
def extract_entities_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract entities from text using the configured NLP implementation.

    Args:
        text: Input text to extract entities from

    Returns:
        List of entity dictionaries with keys: text, type, start, end
    """
    ner_impl = get_ner_implementation()
    return ner_impl.extract_entities_from_text(text)

def extract_relations_from_text(text: str, entities: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Extract relationships from text using the configured NLP implementation.

    Args:
        text: Input text to extract relationships from
        entities: Pre-extracted entities (optional)

    Returns:
        List of relationship dictionaries
    """
    relation_impl = get_relation_extractor_implementation()
    return relation_impl.extract_relations_from_text(text, entities)

# Utility function to get current implementation info
def get_nlp_implementation_info() -> Dict[str, Any]:
    """
    Get information about the currently configured NLP implementations.

    Returns:
        Dictionary with implementation details
    """
    return {
        "use_transformer_nlp": USE_TRANSFORMER_NLP,
        "ner_implementation": "transformer" if USE_TRANSFORMER_NLP else "regex",
        "relation_implementation": "transformer-enhanced" if USE_TRANSFORMER_NLP else "regex"
    }