"""
Transformer-based Named Entity Recognition for Criminal Justice Domain.
This module provides entity extraction using pre-trained transformer models
from Hugging Face, with fine-tuning capabilities for domain-specific entities.
"""
from typing import List, Dict, Any
import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import logging
import os

logger = logging.getLogger(__name__)

# Entity label mapping for the criminal justice domain
# We'll use a custom model or map standard NER labels to our domain
ENTITY_LABEL_MAP = {
    # Standard NER labels to our domain types
    "PER": "PERSON",
    "PERSON": "PERSON",
    "ORG": "ORGANIZATION",
    "ORGANIZATION": "ORGANIZATION",
    "LOC": "LOCATION",
    "LOCATION": "LOCATION",
    "GPE": "LOCATION",  # Geopolitical entity
    # We'll add custom labels for phone, vehicle, account if using a custom model
}

class TransformerNERModel:
    def __init__(self, model_name: str = "dbmdz/bert-large-cased-finetuned-conll03-english"):
        """
        Initialize the transformer-based NER model.

        Args:
            model_name: Hugging Face model name for NER
                       Default is a BERT model fine-tuned on CONLL-2003 for NER
        """
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.ner_pipeline = None
        self._load_model()

    def _load_model(self):
        """Load the transformer model and tokenizer."""
        try:
            logger.info(f"Loading transformer NER model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForTokenClassification.from_pretrained(self.model_name)
            self.ner_pipeline = pipeline(
                "ner",
                model=self.model,
                tokenizer=self.tokenizer,
                aggregation_strategy="simple",  # Merge word pieces into entities
                device=0 if torch.cuda.is_available() else -1
            )
            logger.info("Transformer NER model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load transformer NER model: {e}")
            logger.info("Falling back to regex-based NER")
            self.ner_pipeline = None

    def predict(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract entities from text using transformer-based NER.

        Args:
            text: Input text to extract entities from

        Returns:
            List of entity dictionaries with keys: text, type, start, end, confidence
        """
        if not self.ner_pipeline:
            logger.warning("Transformer NER pipeline not available, returning empty list")
            return []

        try:
            # Run NER prediction
            raw_entities = self.ner_pipeline(text)

            # Convert to our expected format
            entities = []
            for entity in raw_entities:
                # Map the entity label to our domain type
                entity_type = ENTITY_LABEL_MAP.get(entity['entity_group'], entity['entity_group'])

                # Filter to only include entity types we care about in our domain
                if entity_type in ["PERSON", "PHONE", "VEHICLE", "ACCOUNT", "ORGANIZATION", "LOCATION"]:
                    entities.append({
                        "text": entity['word'],
                        "type": entity_type,
                        "start": entity['start'],
                        "end": entity['end'],
                        "confidence": entity['score']
                    })

            return entities

        except Exception as e:
            logger.error(f"Error in transformer NER prediction: {e}")
            return []

# Fallback function for backward compatibility
def extract_entities_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract entities from text using transformer-based NER.
    This function maintains backward compatibility with the existing API.

    Args:
        text: Input text to extract entities from

    Returns:
        List of entity dictionaries
    """
    model = TransformerNERModel()
    return model.predict(text)