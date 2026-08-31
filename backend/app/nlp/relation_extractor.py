from typing import List, Dict, Any
from app.nlp.ner import extract_entities_from_text
import re
import logging

logger = logging.getLogger(__name__)

def extract_relations_from_text(text: str, entities: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Extract relationships from text between entities.
    Uses regex patterns to identify common relationship types in FIR narratives.
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

    # Define relationship patterns
    # Each pattern is a tuple: (pattern_string, relation_type, source_offset, target_offset)
    # source_offset and target_offset indicate which capture group contains the source/target entity
    patterns = [
        # Financial transactions
        (r'(.+?)\s+(?:received|got)\s+(?:suspicious\s+)?(?:deposits?|credits?|payments?|money|funds)\s+(?:from|through|via)\s+(.+?)(?:\s|$|[,.;])', 'RECEIVED_MONEY_FROM', 1, 2),
        (r'(.+?)\s+(?:made|paid)\s+(?:payment|settlement)\s+(?:to|for)\s+(.+?)(?:\s|$|[,.;])', 'MADE_PAYMENT_TO', 1, 2),
        (r'(.+?)\s+(?:hawala|hundi)\s+(?:channels?|network|operators?)\s+(?:of|operated by|run by)\\s+(.+?)(?:\s|$|[,.;])', 'USING_HAWALA_CHANNEL_OF', 1, 2),

        # Communication
        (r'(.+?)\s+(?:called|contacted|communicated with|spoke to|had\s+calls?\s+with)\s+(.+?)(?:\s|$|[,.;])', 'COMMUNICATED_WITH', 1, 2),
        (r'(.+?)\s+(?:was\s+in\s+touch\s+with|maintained\s+contact\s+with)\s+(.+?)(?:\s|$|[,.;])', 'MAINTAINED_CONTACT_WITH', 1, 2),
        (r'(.+?)\s+(?:phone\s+number\s+|mobile\s+number\s+)(.+?)\s+(?:belonged\s+to|was\s+of|registered\s+to)\s+(.+?)(?:\s|$|[,.;])', 'PHONE_NUMBER_OF', 3, 3),  # This needs adjustment

        # Physical movements and meetings
        (r'(.+?)\s+(?:met|meeting|met with|had\s+a\s+meeting\s+with)\s+(.+?)(?:\s|$|[,.;])', 'MET_WITH', 1, 2),
        (r'(.+?)\s+(?:seen\s+with|spotted\s+with|accompanied\s+by)\s+(.+?)(?:\s|$|[,.;])', 'SEEN_WITH', 1, 2),
        (r'(.+?)\s+(?:visited|went\s+to|came\s+from)\s+(.+?)(?:\s|$|[,.;])', 'VISITED', 1, 2),
        (r'(.+?)\s+(?:resided\s+at|lived\s+at|stayed\s+at|was\s+at)\s+(.+?)(?:\s|$|[,.;])', 'RESIDED_AT', 1, 2),

        # Transportation and vehicles
        (r'(.+?)\s+(?:transported|moved|carried)\s+(.+?)\s+(?:in|using|via)\s+(.+?)(?:\s|$|[,.;])', 'TRANSPORTED_IN_VEHICLE', 1, 3),
        (r'(.+?)\s+(?:drove|was\s+driving|operator\s+of)\s+(.+?)(?:\s|$|[,.;])', 'DRVE_VEHICLE', 1, 2),
        (r'(.+?)\s+(?:vehicle\s+|car\s+|suv\s+)(.+?)\s+(?:registered\s+to|owned\s+by|belonged\s+to)\s+(.+?)(?:\s|$|[,.;])', 'VEHICLE_REGISTERED_TO', 3, 3),  # Needs adjustment

        # Criminal activities
        (r'(.+?)\s+(?:supplied|provided|gave|sold)\s+(.+?)\s+(?:to|for)\s+(.+?)(?:\s|$|[,.;])', 'SUPPLIED_TO', 1, 3),
        (r'(.+?)\s+(?:received|got|obtained)\s+(.+?)\s+(?:from|via|through)\s+(.+?)(?:\s|$|[,.;])', 'RECEIVED_FROM', 1, 3),
        (r'(.+?)\s+(?:conspired\s+with|colluded\s+with|worked\s+with)\s+(.+?)(?:\s|$|[,.;])', 'CONSPIRED_WITH', 1, 2),

        # Location-based relationships
        (r'(.+?)\s+(?:was\s+at|was\s+found\s+at|apprehended\s+at|arrested\s+at)\s+(.+?)(?:\s|$|[,.;])', 'WAS_AT_LOCATION', 1, 2),
        (r'(.+?)\s+(?:incident\s+took\s+place\s+at|occurred\s+at|happened\s+at)\s+(.+?)(?:\s|$|[,.;])', 'INCIDENT_AT_LOCATION', 1, 2),
    ]

    # Process each pattern
    for pattern_str, rel_type, source_group, target_group in patterns:
        try:
            pattern = re.compile(pattern_str, re.IGNORECASE)
            for match in pattern.finditer(text):
                # Extract source and target text
                try:
                    source_text = match.group(source_group).strip()
                    target_text = match.group(target_group).strip()

                    # Clean up the extracted text (remove extra words, punctuation)
                    source_text = re.sub(r'^\s*(the|a|an|of|in|at|to|for|with|from)\s+', '', source_text, flags=re.IGNORECASE)
                    source_text = re.sub(r'\s+(the|a|an|of|in|at|to|for|with|from)\s*$', '', source_text, flags=re.IGNORECASE)
                    target_text = re.sub(r'^\s*(the|a|an|of|in|at|to|for|with|from)\s+', '', target_text, flags=re.IGNORECASE)
                    target_text = re.sub(r'\s+(the|a|an|of|in|at|to|for|with|from)\s*$', '', target_text, flags=re.IGNORECASE)

                    # Only add if we have meaningful text
                    if source_text and len(source_text) > 1 and target_text and len(target_text) > 1:
                        relations.append({
                            'source_entity_text': source_text,
                            'source_entity_type': _guess_entity_type(source_text, entities),
                            'target_entity_text': target_text,
                            'target_entity_type': _guess_entity_type(target_text, entities),
                            'relation_type': rel_type,
                            'confidence': 0.8,  # Base confidence for regex-based extraction
                            'extracted_text': match.group(0),
                            'start_pos': match.start(),
                            'end_pos': match.end()
                        })
                except IndexError:
                    # Skip if groups don't exist
                    continue
        except Exception as e:
            logger.warning(f"Error processing pattern {pattern_str}: {e}")
            continue

    # Also extract proximity-based relationships (entities mentioned close to each other)
    # But only for certain entity types that are more likely to have meaningful relationships
    proximity_relations = _extract_proximity_relations(text, entities)
    relations.extend(proximity_relations)

    logger.info(f"Extracted {len(relations)} relations from text using regex patterns.")
    return relations

def _guess_entity_type(entity_text: str, entities: List[Dict[str, Any]] = None) -> str:
    """Guess the entity type based on the entity text and known entities."""
    if entities is None:
        return "UNKNOWN"

    entity_text_lower = entity_text.lower().strip()

    # Check if we have an exact match in our entities
    for entity in entities:
        if entity.get('text', '').lower().strip() == entity_text_lower:
            return entity.get('type', 'UNKNOWN')

    # If no exact match, try to guess based on patterns
    # Phone number patterns
    if re.search(r'[\+]?[\d\-\s]{10,}', entity_text):
        return "PHONE_NUMBER"
    # Vehicle number patterns (Indian format)
    elif re.search(r'[A-Z]{2}[-\s]?\d{1,2}[A-Z]{1,2}[-\s]?\d{4}', entity_text, re.IGNORECASE):
        return "VEHICLE_NUMBER"
    # Account number patterns
    elif re.search(r'[A-Za-z0-9]{9,18}', entity_text):
        return "BANK_ACCOUNT"
    # Person name patterns (simplified)
    elif re.search(r'^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$', entity_text):
        return "PERSON"
    else:
        return "UNKNOWN"

def _extract_proximity_relations(text: str, entities: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """Extract relationships based on proximity of entities in text."""
    if entities is None or len(entities) < 2:
        return []

    relations = []
    # Sort entities by position
    sorted_entities = sorted(entities, key=lambda x: x.get('start', 0))

    # Look for entities that appear close to each other (within 30 characters for higher confidence)
    for i in range(len(sorted_entities) - 1):
        ent1 = sorted_entities[i]
        ent2 = sorted_entities[i + 1]

        pos1 = ent1.get('start', 0)
        pos2 = ent2.get('start', 0)

        # If entities are close together, infer a relationship
        if abs(pos2 - pos1) < 30:  # Within 30 characters for higher confidence
            # Get the text between them to infer relationship type
            between_text = text[pos1:pos2].lower()

            # Determine relationship type based on connecting words
            rel_type = "ASSOCIATED_WITH"  # Default
            if any(word in between_text for word in ['called', 'contacted', 'spoke', 'phoned', 'called']):
                rel_type = "COMMUNICATED_WITH"
            elif any(word in between_text for word in ['met', 'meeting', 'saw', 'visited', 'seen']):
                rel_type = "MET_WITH"
            elif any(word in between_text for word in ['paid', 'gave', 'sent', 'transferred', 'transfer']):
                rel_type = "TRANSFERRED_VALUE_TO"
            elif any(word in between_text for word in ['received', 'got', 'obtained', 'took', 'receive']):
                rel_type = "RECEIVED_VALUE_FROM"
            elif any(word in between_text for word in ['supplied', 'provided', 'delivered']):
                rel_type = "SUPPLIED_BY"
            elif any(word in between_text for word in ['lived', 'resided', 'stayed', 'at']):
                rel_type = "RESIDED_AT"
            elif any(word in between_text for word in ['owned', 'possessed', 'had']):
                rel_type = "POSSESSED"

            # Only add if we have meaningful entity types (not UNKNOWN for both)
            source_type = ent1.get('type', 'UNKNOWN')
            target_type = ent2.get('type', 'UNKNOWN')
            if source_type != 'UNKNOWN' or target_type != 'UNKNOWN':
                relations.append({
                    'source_entity_text': ent1.get('text', ''),
                    'source_entity_type': source_type,
                    'target_entity_text': ent2.get('text', ''),
                    'target_entity_type': target_type,
                    'relation_type': rel_type,
                    'confidence': 0.5,  # Lower confidence for proximity-based
                    'extracted_text': between_text.strip(),
                    'start_pos': pos1,
                    'end_pos': pos2
                })

    return relations

# Placeholder for future LLM-based relation extraction
class RelationExtractor:
    def __init__(self):
        # In the future, we would load a pre-trained relation extraction model or use an LLM
        pass

    def extract(self, text: str, entities: List[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        # For now, delegate to the function-based approach
        return extract_relations_from_text(text, entities)