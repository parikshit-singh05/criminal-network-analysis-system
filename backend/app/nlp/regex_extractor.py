import re
from typing import List, Dict, Any, Optional

def extract_phone_numbers(text: str) -> List[Dict[str, Any]]:
    """
    Extract phone numbers from text using regex patterns.
    Returns a list of dictionaries with the phone number and its position.
    """
    # Pattern for Indian phone numbers: 10 digits, possibly with country code, spaces, dashes
    patterns = [
        r'\+?91[\s\-]?[6-9]\d{9}',  # Indian numbers with country code
        r'[6-9]\d{9}',               # Indian numbers without country code
        r'\+\d{1,3}[\s\-]?\d{1,14}'  # Generic international numbers
    ]
    phone_numbers = []
    for pattern in patterns:
        for match in re.finditer(pattern, text):
            phone_numbers.append({
                "text": match.group(),
                "start": match.start(),
                "end": match.end(),
                "type": "PHONE"
            })
    return phone_numbers

def extract_vehicle_numbers(text: str) -> List[Dict[str, Any]]:
    """
    Extract vehicle registration numbers from text.
    """
    # Pattern for Indian vehicle registration: XX-XX-XX-XXXX or similar
    # Examples: DL-5C-AB-1234, HR-26-DK-9876
    pattern = r'[A-Z]{2}-\d{1,2}[A-Z]{1,2}-\d{4}'
    vehicle_numbers = []
    for match in re.finditer(pattern, text):
        vehicle_numbers.append({
            "text": match.group(),
            "start": match.start(),
            "end": match.end(),
            "type": "VEHICLE"
        })
    return vehicle_numbers

def extract_account_numbers(text: str) -> List[Dict[str, Any]]:
    """
    Extract bank account numbers from text.
    """
    # Pattern for bank account numbers: alphanumeric, typically 9-18 digits
    # This is a simplistic pattern; in reality, account number formats vary by bank.
    pattern = r'[A-Za-z0-9]{9,18}'
    account_numbers = []
    for match in re.finditer(pattern, text):
        # We might want to filter out false positives, but for now we'll return all matches.
        account_numbers.append({
            "text": match.group(),
            "start": match.start(),
            "end": match.end(),
            "type": "ACCOUNT"
        })
    return account_numbers

def extract_names(text: str) -> List[Dict[str, Any]]:
    """
    Extract person names from text using a simple regex pattern.
    This is a placeholder; real NER would be more accurate.
    """
    # Pattern for names: sequences of words starting with capital letters
    # This will capture many false positives, but it's a start.
    pattern = r'[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*'
    names = []
    for match in re.finditer(pattern, text):
        names.append({
            "text": match.group(),
            "start": match.start(),
            "end": match.end(),
            "type": "PERSON"
        })
    return names

def extract_entities(text: str) -> List[Dict[str, Any]]:
    """
    Extract all supported entities from text.
    """
    entities = []
    entities.extend(extract_phone_numbers(text))
    entities.extend(extract_vehicle_numbers(text))
    entities.extend(extract_account_numbers(text))
    entities.extend(extract_names(text))
    # Sort by start position
    entities.sort(key=lambda x: x['start'])
    return entities