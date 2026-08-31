from app.repositories.neo4j_connector import neo4j_connector
from app.nlp.ner import extract_entities_from_text
from app.nlp.relation_extractor import extract_relations_from_text
from app.utils.normalization import normalize_name, normalize_phone_number, normalize_vehicle_number, normalize_account_number
import hashlib
import json
import logging
from typing import Dict, Any, Optional, List

logger = logging.getLogger(__name__)

def extract_document_id(text: str) -> str:
    """
    Extract a document ID from the text if present, otherwise generate a hash.
    """
    # Look for a line like "DOCUMENT_ID: xxx"
    import re
    match = re.search(r'DOCUMENT_ID:\s*(\S+)', text)
    if match:
        return match.group(1)
    # Otherwise, generate a SHA256 hash of the text
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def extract_case_id(text: str) -> Optional[str]:
    """
    Extract a case ID from the text if present.
    """
    import re
    match = re.search(r'CASE_ID:\s*(\S+)', text)
    if match:
        return match.group(1)
    return None

def create_or_merge_entity(entity_type: str, entity_text: str, document_id: str) -> None:
    """
    Create or merge an entity node based on the entity type and text.
    Uses normalized properties for merging.
    """
    # Define mapping from entity type to node label, normalized property, and text property
    entity_mapping = {
        "PERSON": {
            "label": "Person",
            "text_property": "person_name",
            "normalized_property": "normalized_name",
            "normalize_func": normalize_name
        },
        "PHONE_NUMBER": {
            "label": "Phone",
            "text_property": "phone_number",
            "normalized_property": "normalized_number",
            "normalize_func": normalize_phone_number
        },
        "VEHICLE_NUMBER": {
            "label": "Vehicle",
            "text_property": "registration_number",
            "normalized_property": "normalized_number",
            "normalize_func": normalize_vehicle_number
        },
        "BANK_ACCOUNT": {
            "label": "BankAccount",
            "text_property": "account_number",
            "normalized_property": "normalized_number",
            "normalize_func": normalize_account_number
        },
        # Add more entity types as needed
    }

    if entity_type not in entity_mapping:
        logger.warning(f"Unsupported entity type: {entity_type}. Skipping.")
        return

    mapping = entity_mapping[entity_type]
    normalized_value = mapping["normalize_func"](entity_text)

    # We'll use the normalized value as a key to merge nodes.
    # We'll set the text property to the original entity text.
    # We'll also keep a list of document IDs where this entity was mentioned (for provenance).
    query = f"""
    MERGE (e:{mapping['label']} {{{mapping['normalized_property']}: $normalized_value}})
    ON CREATE SET
        e.{mapping['text_property']} = $entity_text,
        e.mentioned_in = [$document_id]
    ON MATCH SET
        e.{mapping['text_property']} = COALESCE(e.{mapping['text_property']}, $entity_text),
        e.mentioned_in = CASE WHEN e.mentioned_in IS NULL THEN [$document_id]
                             WHEN $document_id IN e.mentioned_in THEN e.mentioned_in
                             ELSE e.mentioned_in + [$document_id]
                        END
    RETURN e
    """
    try:
        neo4j_connector.run_query(query, {
            "normalized_value": normalized_value,
            "entity_text": entity_text,
            "document_id": document_id
        })
        logger.debug(f"Created/merged {entity_type} entity: {entity_text} (normalized: {normalized_value})")
    except Exception as e:
        logger.error(f"Failed to create/merge entity {entity_text} of type {entity_type}: {e}")

def create_mention_relationship(document_id: str, entity_type: str, entity_text: str) -> None:
    """
    Create a MENTIONED_IN relationship between the Document node and the Entity node.
    """
    mapping = {
        "PERSON": "Person",
        "PHONE_NUMBER": "Phone",
        "VEHICLE_NUMBER": "Vehicle",
        "BANK_ACCOUNT": "BankAccount",
    }
    if entity_type not in mapping:
        return

    label = mapping[entity_type]
    normalized_value = None
    if entity_type == "PERSON":
        normalized_value = normalize_name(entity_text)
    elif entity_type == "PHONE_NUMBER":
        normalized_value = normalize_phone_number(entity_text)
    elif entity_type == "VEHICLE_NUMBER":
        normalized_value = normalize_vehicle_number(entity_text)
    elif entity_type == "BANK_ACCOUNT":
        normalized_value = normalize_account_number(entity_text)

    if normalized_value is None:
        return

    query = f"""
    MATCH (d:Document {{document_id: $document_id}})
    MATCH (e:{label} {{{'normalized_name' if label == 'Person' else 'normalized_number'}: $normalized_value}})
    MERGE (d)-[r:MENTIONED_IN]->(e)
    ON CREATE SET r.count = 1
    ON MATCH SET r.count = r.count + 1
    """
    try:
        neo4j_connector.run_query(query, {
            "document_id": document_id,
            "normalized_value": normalized_value
        })
        logger.debug(f"Created MENTIONED_IN relationship between document {document_id} and {entity_type} {entity_text}")
    except Exception as e:
        logger.error(f"Failed to create MENTIONED_IN relationship: {e}")

def create_relation_relationship(relation: Dict[str, Any], document_id: str) -> None:
    """
    Create a relationship between two entities based on the extracted relation.
    The relation dict should have: 'source_entity_text', 'source_entity_type',
                                'target_entity_text', 'target_entity_type', 'relation_type'
    """
    # We'll create a relationship of type given by relation_type between the source and target entities.
    # We'll first find the source and target entities by their normalized values.
    # We'll use the same mapping as before.

    entity_mapping = {
        "PERSON": {
            "label": "Person",
            "normalized_property": "normalized_name",
            "normalize_func": normalize_name
        },
        "PHONE_NUMBER": {
            "label": "Phone",
            "normalized_property": "normalized_number",
            "normalize_func": normalize_phone_number
        },
        "VEHICLE_NUMBER": {
            "label": "Vehicle",
            "normalized_property": "normalized_number",
            "normalize_func": normalize_vehicle_number
        },
        "BANK_ACCOUNT": {
            "label": "BankAccount",
            "normalized_property": "normalized_number",
            "normalize_func": normalize_account_number
        },
    }

    source_type = relation.get('source_entity_type')
    target_type = relation.get('target_entity_type')

    if source_type not in entity_mapping or target_type not in entity_mapping:
        logger.warning(f"Unsupported entity types in relation: {source_type} -> {target_type}")
        return

    source_mapping = entity_mapping[source_type]
    target_mapping = entity_mapping[target_type]

    source_text = relation.get('source_entity_text')
    target_text = relation.get('target_entity_text')
    relation_type = relation.get('relation_type', 'RELATED_TO')  # default relation type

    if not source_text or not target_text:
        logger.warning("Missing source or target entity text in relation")
        return

    source_normalized = source_mapping["normalize_func"](source_text)
    target_normalized = target_mapping["normalize_func"](target_text)

    # We'll create the relationship between the two entities.
    # We'll also set a property on the relationship to indicate the document(s) where it was mentioned.
    query = f"""
    MATCH (e1:{source_mapping['label']} {{{source_mapping['normalized_property']}: $source_normalized}})
    MATCH (e2:{target_mapping['label']} {{{target_mapping['normalized_property']}: $target_normalized}})
    MERGE (e1)-[r:{relation_type}]->(e2)
    ON CREATE SET
        r.mentioned_in = [$document_id],
        r.count = 1
    ON MATCH SET
        r.mentioned_in = CASE WHEN r.mentioned_in IS NULL THEN [$document_id]
                             WHEN $document_id IN r.mentioned_in THEN r.mentioned_in
                             ELSE r.mentioned_in + [$document_id]
                        END,
        r.count = r.count + 1
    """
    try:
        neo4j_connector.run_query(query, {
            "source_normalized": source_normalized,
            "target_normalized": target_normalized,
            "document_id": document_id
        })
        logger.debug(f"Created {relation_type} relationship between {source_type} {source_text} and {target_type} {target_text}")
    except Exception as e:
        logger.error(f"Failed to create relation relationship: {e}")

def process_text_document(text: str, source_info: Dict[str, Any] = None) -> None:
    """
    Process a text document: extract entities and relationships, and store them in Neo4j.
    """
    if source_info is None:
        source_info = {}

    # Extract a document ID
    document_id = extract_document_id(text)
    # Extract a case ID if present
    case_id = extract_case_id(text)

    # Create a Document node
    doc_query = """
    MERGE (d:Document {document_id: $document_id})
    ON CREATE SET
        d.case_id = $case_id,
        d.source_info = $source_info_json,
        d.text_hash = $text_hash
    ON MATCH SET
        d.case_id = COALESCE(d.case_id, $case_id),
        d.source_info = $source_info_json
    """
    # We'll store a hash of the text for change detection (optional)
    text_hash = hashlib.sha256(text.encode('utf-8')).hexdigest()
    try:
        neo4j_connector.run_query(doc_query, {
            "document_id": document_id,
            "case_id": case_id,
            "source_info_json": json.dumps(source_info),
            "text_hash": text_hash
        })
        logger.info(f"Created/merged Document node: {document_id}")
    except Exception as e:
        logger.error(f"Failed to create Document node: {e}")
        return

    # Extract entities using NER
    entities = extract_entities_from_text(text)
    logger.info(f"Extracted {len(entities)} entities from text.")

    # For each entity, create or merge the entity node and create a MENTIONED_IN relationship
    for entity in entities:
        entity_text = entity.get('text')
        entity_type = entity.get('type')
        if entity_text and entity_type:
            create_or_merge_entity(entity_type, entity_text, document_id)
            create_mention_relationship(document_id, entity_type, entity_text)
        else:
            logger.warning(f"Skipping entity with missing text or type: {entity}")

    # Extract relationships
    relations = extract_relations_from_text(text, entities)
    logger.info(f"Extracted {len(relations)} relations from text.")

    # For each relation, create a relationship between the entities
    for relation in relations:
        create_relation_relationship(relation, document_id)

    logger.info(f"Finished processing document {document_id}")

def process_document_file(file_path: str, source_info: Dict[str, Any] = None) -> None:
    """
    Process a text file by reading its content and then processing the text.
    """
    with open(file_path, 'r', encoding='utf-8') as file:
        text = file.read()
    process_text_document(text, source_info)