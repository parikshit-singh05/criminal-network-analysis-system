from typing import List, Dict, Any
import re

def extract_entities_from_text(text: str) -> List[Dict[str, Any]]:
    """
    Extract entities from text using enhanced NER models.
    """
    model = NERModel()
    return model.predict(text)

# Enhanced NER with better pattern matching
class NERModel:
    def __init__(self):
        # In the future, we would load a pre-trained NER model here
        # For now, we'll use enhanced regex patterns
        pass

    def predict(self, text: str) -> List[Dict[str, Any]]:
        """
        Enhanced entity extraction with better patterns for criminal justice domain.
        """
        entities = []

        # Extract persons (enhanced)
        entities.extend(self._extract_persons(text))

        # Extract phone numbers (enhanced)
        entities.extend(self._extract_phone_numbers(text))

        # Extract vehicle numbers (enhanced)
        entities.extend(self._extract_vehicle_numbers(text))

        # Extract bank account numbers (enhanced)
        entities.extend(self._extract_account_numbers(text))

        # Extract locations/addresses (new)
        entities.extend(self._extract_locations(text))

        # Extract organizations (new)
        entities.extend(self._extract_organizations(text))

        # Sort by start position
        entities.sort(key=lambda x: x['start'])
        return entities

    def _extract_persons(self, text: str) -> List[Dict[str, Any]]:
        """Extract person names with improved accuracy."""
        entities = []
        # Pattern for person names: sequences of words starting with capital letters
        # But avoid common false positives and single letters
        false_positives = {'The', 'This', 'That', 'And', 'Or', 'But', 'In', 'On', 'At', 'To', 'For',
                          'Of', 'With', 'By', 'Is', 'Are', 'Was', 'Were', 'Been', 'Have', 'Has', 'Had',
                          'Date', 'Time', 'Case', 'Fir', 'Nr', 'No', 'Number', 'Amount', 'Rs', 'Rupees',
                          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
                          'Upon', 'During', 'Also', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'}

        # More sophisticated pattern that looks for capitalized words that aren't at sentence start
        # unless they're proper nouns, and require at least 2 characters
        pattern = r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b'
        for match in re.finditer(pattern, text):
            name = match.group(1)
            # Skip if it's a false positive
            if name in false_positives:
                continue
            # Skip if any part of the name is a false positive
            parts = name.split()
            if any(part in false_positives for part in parts):
                continue
            entities.append({
                "text": name,
                "start": match.start(),
                "end": match.end(),
                "type": "PERSON"
            })
        return entities

    def _extract_phone_numbers(self, text: str) -> List[Dict[str, Any]]:
        """Extract phone numbers with improved accuracy."""
        entities = []
        # Pattern for Indian phone numbers: 10 digits, possibly with country code, spaces, dashes
        patterns = [
            r'\+?91[\s\-]?[6-9]\d{9}',  # Indian numbers with country code
            r'[6-9]\d{9}',               # Indian numbers without country code
            r'\+\d{1,3}[\s\-]?\d{1,14}'  # Generic international numbers
        ]
        for pattern in patterns:
            for match in re.finditer(pattern, text):
                entities.append({
                    "text": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "type": "PHONE"
                })
        return entities

    def _extract_vehicle_numbers(self, text: str) -> List[Dict[str, Any]]:
        """Extract vehicle registration numbers with improved accuracy."""
        entities = []
        # Pattern for Indian vehicle registration: XX-XX-XX-XXXX or similar
        # Examples: DL-5C-AB-1234, HR-26-DK-9876
        # Also handle formats like DL5CAB1234, DL 5C AB 1234
        patterns = [
            r'[A-Z]{2}-\d{1,2}[A-Z]{1,2}-\d{4}',  # Standard format with hyphens
            r'[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{4}',     # Without hyphens
            r'[A-Z]{2}\s\d{1,2}\s[A-Z]{1,2}\s\d{4}' # With spaces
        ]
        for pattern in patterns:
            for match in re.finditer(pattern, text, re.IGNORECASE):
                entities.append({
                    "text": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "type": "VEHICLE"
                })
        return entities

    def _extract_account_numbers(self, text: str) -> List[Dict[str, Any]]:
        """Extract bank account numbers with improved accuracy."""
        entities = []
        # Pattern for bank account numbers: alphanumeric, typically 9-18 digits
        # But be more specific to avoid false positives
        # Look for context clues like "account", "a/c", etc.
        context_pattern = r'(?:account|a\.?c\.?|acct)[\s\:#]*([A-Za-z0-9]{9,18})'
        for match in re.finditer(context_pattern, text, re.IGNORECASE):
            entities.append({
                "text": match.group(1),
                "start": match.start(1),
                "end": match.end(1),
                "type": "ACCOUNT"
            })

        # Also look for standalone numbers that might be account numbers
        # But only if they're in a financial context
        financial_context = r'(?:balance|deposit|withdrawal|transfer|credit|debit)[\s\w]*([A-Za-z0-9]{9,18})'
        for match in re.finditer(financial_context, text, re.IGNORECASE):
            entities.append({
                "text": match.group(1),
                "start": match.start(1),
                "end": match.end(1),
                "type": "ACCOUNT"
            })
        return entities

    def _extract_locations(self, text: str) -> List[Dict[str, Any]]:
        """Extract locations and addresses."""
        entities = []
        # Patterns for addresses and locations
        address_patterns = [
            # House number, sector, etc.
            r'\b(House\s+No\.?\s*\d+[,.\s]*(?:Sector\s*\.?\s*\d+)?[,.\s]*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
            # Hotel names
            r'\b(Hotel\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
            # Road/street names
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Road|Street|Lane|Avenue|Boulevard|Marg|Chowk))\b',
            # City names (often capitalized and stand alone)
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:PS|Police\s+Station|District|City)\b',
            # Sector patterns
            r'\b(Sector\s*\d+[,.\s]*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b',
        ]

        for pattern in address_patterns:
            for match in re.finditer(pattern, text):
                entities.append({
                    "text": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "type": "LOCATION"
                })
        return entities

    def _extract_organizations(self, text: str) -> List[Dict[str, Any]]:
        """Extract organization names."""
        entities = []
        # Patterns for organizations
        org_patterns = [
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:PS|Police\s+Station))\b',  # Police Stations
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Bank|Bank\s+of\s+[A-Z][a-z]+))\b',  # Banks
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Ltd|Limited|Private\s+Limited|Pvt\s+Ltd|Corporation|Corp|Inc|Company|Co))\b',  # Companies
            r'\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:PS|Police\s+Station)\s+[A-Z][a-z]+)\b',  # PS with city
        ]

        for pattern in org_patterns:
            for match in re.finditer(pattern, text):
                entities.append({
                    "text": match.group(),
                    "start": match.start(),
                    "end": match.end(),
                    "type": "ORGANIZATION"
                })
        return entities