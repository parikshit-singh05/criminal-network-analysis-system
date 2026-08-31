"""
Transformer-enhanced Relation Extraction for Criminal Justice Domain.
This module provides relation extraction using transformer-based entity recognition
combined with enhanced pattern matching and contextual analysis.
"""
from typing import List, Dict, Any
import re
import logging
from app.nlp.transformer_ner import extract_entities_from_text

logger = logging.getLogger(__name__)

class TransformerRelationExtractor:
    def __init__(self):
        """Initialize the transformer-enhanced relation extractor."""
        # We'll use the transformer NER for better entity recognition
        pass

    def extract_relations(self, text: str, entities: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """
        Extract relationships from text using transformer-based entity recognition
        and enhanced pattern matching.

        Args:
            text: Input text to extract relationships from
            entities: Pre-extracted entities (optional). If not provided,
                     entities will be extracted using transformer NER.

        Returns:
            List of relationship dictionaries
        """
        if entities is None:
            entities = extract_entities_from_text(text)

        # Create a mapping from entity text to entity info for easy lookup
        entity_map = {}
        for entity in entities:
            entity_text = entity.get('text', '').lower().strip()
            if entity_text:
                # Store multiple matches if same text appears multiple times
                if entity_text not in entity_map:
                    entity_map[entity_text] = []
                entity_map[entity_text].append(entity)

        relations = []

        # Enhanced relationship patterns with better context awareness
        # Each pattern is a tuple: (pattern_string, relation_type, source_group, target_group, context_check)
        patterns = [
            # Financial transactions - enhanced with financial context
            (r'(.+?)\s+(?:received|got|obtained)\s+(?:suspicious\s+)?(?:deposits?|credits?|payments?|money|funds|amount|sum)\s+(?:from|through|via|by)\s+(.+?)(?:\s|$|[,.;:!?])', 'RECEIVED_MONEY_FROM', 1, 2),
            (r'(.+?)\s+(?:made|paid|sent|transferred)\s+(?:payment|settlement|amount|sum|funds)\s+(?:to|for|toward)\s+(.+?)(?:\s|$|[,.;:!?])', 'MADE_PAYMENT_TO', 1, 2),
            (r'(.+?)\s+(?:hawala|hundi)\s+(?:channels?|network|operators?|system)\s+(?:of|operated by|run by|managed by)\s+(.+?)(?:\s|$|[,.;:!?])', 'USING_HAWALA_CHANNEL_OF', 1, 2),
            (r'(.+?)\s+(?:paid|settled|cleared)\s+(?:dues?|obligations?|bills?)\s+(?:to|for)\s+(.+?)(?:\s|$|[,.;:!?])', 'PAID_DUES_TO', 1, 2),

            # Communication - enhanced with communication context
            (r'(.+?)\s+(?:called|phoned|contacted|reached out to|got in touch with)\s+(.+?)(?:\s|$|[,.;:!?])', 'COMMUNICATED_WITH', 1, 2),
            (r'(.+?)\s+(?:was\s+in\s+touch\s+with|maintained\s+contact\s+with|kept\s+in\s+touch\s+with)\s+(.+?)(?:\s|$|[,.;:!?])', 'MAINTAINED_CONTACT_WITH', 1, 2),
            (r'(.+?)\s+(?:exchanged\s+(?:calls?|messages?|sms\s+|text\s+messages?))\s+(?:with|and)\s+(.+?)(?:\s|$|[,.;:!?])', 'EXCHANGED_COMMUNICATION_WITH', 1, 2),
            (r'(.+?)\s+(?:sent\s+|received\s+)\s+(?:a\s+)?(?:message|text|sms|email)\s+(?:to|from)\s+(.+?)(?:\s|$|[,.;:!?])', 'SENT_MESSAGE_TO', 2, 2),  # Simplified

            # Physical movements and meetings - enhanced
            (r'(.+?)\s+(?:met|meeting|met with|had\s+a\s+meeting\s+with|met\s+for\s+discussion|held\s+a\s+meeting\s+with)\s+(.+?)(?:\s|$|[,.;:!?])', 'MET_WITH', 1, 2),
            (r'(.+?)\s+(?:seen\s+with|spotted\s+with|accompanied\s+by|was\s+seen\s+with)\s+(.+?)(?:\s|$|[,.;:!?])', 'SEEN_WITH', 1, 2),
            (r'(.+?)\s+(?:visited|went\s+to|came\s+from|traveled\s+to|visited\s+the\s+premises\s+of)\s+(.+?)(?:\s|$|[,.;:!?])', 'VISITED', 1, 2),
            (r'(.+?)\s+(?:resided\s+at|lived\s+at|stayed\s+at|was\s+at|was\s+staying\s+at|inhabited)\s+(.+?)(?:\s|$|[,.;:!?])', 'RESIDED_AT', 1, 2),

            # Transportation and vehicles - enhanced
            (r'(.+?)\s+(?:transported|moved|carried|conveyed)\s+(.+?)\s+(?:in|using|via|by\s+means\s+of)\s+(.+?)(?:\s|$|[,.;:!?])', 'TRANSPORTED_IN_VEHICLE', 1, 3),
            (r'(.+?)\s+(?:drove|was\s+driving|operator\s+of|was\s+behind\s+the\s+wheel\s+of)\s+(.+?)(?:\s|$|[,.;:!?])', 'DRVE_VEHICLE', 1, 2),
            (r'(.+?)\s+(?:used\s+|took\s+| hired\s+)\s+(?:the\s+)?(?:vehicle|car)\s+(.+?)(?:\s|$|[,.;:!?])', 'USED_VEHICLE', 1, 2),

            # Criminal activities - enhanced
            (r'(.+?)\s+(?:supplied|provided|gave|delivered|transferred)\\s+(.+?)\s+(?:to|for)\s+(.+?)(?:\s|$|[,.;:!?])', 'SUPPLIED_TO', 1, 3),
            (r'(.+?)\s+(?:received|obtained|got|took)\s+(.+?)\s+(?:from|by)\s+(.+?)(?:\s|$|[,.;:!?])', 'RECEIVED_FROM', 1, 3),
            (r'(.+?)\s+(?:conspired|planned|colluded)\s+(?:with|against)\s+(.+?)(?:\s|$|[,.;:!?])', 'CONSPIRED_WITH', 1, 2),
            (r'(.+?)\s+(?:aided|abetted|assisted|helped)\s+(.+?)\s+(?:in|with)\s+(.+?)(?:\s|$|[,.;:!?])', 'AIDED_IN', 1, 3),

            # Location-based - enhanced
            (r'(.+?)\s+(?:was\s+at|was\s+located\s+at|was\s+found\s+at|was\s+seen\s+at)\s+(.+?)(?:\s|$|[,.;:!?])', 'WAS_AT_LOCATION', 1, 2),
            (r'(.+?)\s+(?:incident\s+|event\s+|occurrence\s+|case\s+)\s+(?:at|in|on)\s+(.+?)(?:\s|$|[,.;:!?])', 'INCIDENT_AT_LOCATION', 1, 2),
            (r'(.+?)\s+(?:lives\s+in|resides\in|domicile\s+in|based\s+in)\s+(.+?)(?:\s|$|[,.;:!?])', 'RESIDES_IN', 1, 2),
        ]

        # Apply each pattern
        for pattern_string, relation_type, source_group, target_group in patterns:
            try:
                pattern = re.compile(pattern_string, re.IGNORECASE)
                for match in pattern.finditer(text):
                    try:
                        source_text = match.group(source_group).strip()
                        target_text = match.group(target_group).strip()

                        # Validate that we captured non-empty strings
                        if not source_text or not target_text:
                            continue

                        # Look up entities in our entity map (case-insensitive)
                        source_key = source_text.lower()
                        target_key = target_text.lower()

                        source_entities = entity_map.get(source_key, [])
                        target_entities = entity_map.get(target_key, [])

                        # Create relations for each combination of source and target entities
                        for source_entity in source_entities:
                            for target_entity in target_entities:
                                # Avoid self-relations unless specifically allowed
                                if source_entity.get('start') == target_entity.get('start') and \
                                   source_entity.get('end') == target_entity.get('end'):
                                    continue

                                relations.append({
                                    'source_entity_text': source_entity['text'],
                                    'source_entity_type': source_entity['type'],
                                    'source_entity_start': source_entity['start'],
                                    'source_entity_end': source_entity['end'],
                                    'target_entity_text': target_entity['text'],
                                    'target_entity_type': target_entity['type'],
                                    'target_entity_start': target_entity['start'],
                                    'target_entity_end': target_entity['end'],
                                    'relation_type': relation_type,
                                    'confidence': 0.8,  # Base confidence for pattern-based relations
                                    'matched_text': match.group()
                                })
                    except IndexError:
                        # Skip if group index is out of range
                        continue
                    except Exception as e:
                        logger.debug(f"Error processing match for pattern {pattern_string}: {e}")
                        continue
            except re.error as e:
                logger.warning(f"Invalid regex pattern '{pattern_string}': {e}")
                continue

        # Remove duplicates (same relation between same entities with same type)
        unique_relations = []
        seen_relations = set()
        for relation in relations:
            # Create a unique key for the relation
            key = (
                relation['source_entity_text'].lower(),
                relation['source_entity_type'],
                relation['target_entity_text'].lower(),
                relation['target_entity_type'],
                relation['relation_type']
            )
            if key not in seen_relations:
                seen_relations.add(key)
                unique_relations.append(relation)

        logger.info(f"Extracted {len(unique_relations)} unique relations using transformer-enhanced extraction")
        return unique_relations

# Fallback function for backward compatibility
def extract_relations_from_text(text: str, entities: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Extract relationships from text using transformer-enhanced relation extraction.
    This function maintains backward compatibility with the existing API.

    Args:
        text: Input text to extract relationships from
        entities: Pre-extracted entities (optional)

    Returns:
        List of relationship dictionaries
    """
    extractor = TransformerRelationExtractor()
    return extractor.extract_relations(text, entities)