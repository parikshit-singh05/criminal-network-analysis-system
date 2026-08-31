"""
NLP Module for Criminal Network Analysis System.
Provides entity and relationship extraction capabilities.
"""

from .nlp_service import extract_entities_from_text, extract_relations_from_text, get_nlp_implementation_info

__all__ = [
    "extract_entities_from_text",
    "extract_relations_from_text",
    "get_nlp_implementation_info"
]