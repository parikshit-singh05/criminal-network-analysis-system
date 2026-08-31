import re
from typing import Optional

def normalize_phone_number(phone: str) -> Optional[str]:
    """
    Normalize a phone number to a standard format.
    Removes all non-digit characters and returns the digits.
    If the number starts with a country code (like 91 for India), we keep it.
    We'll return a string of digits, or None if empty.
    """
    if not phone:
        return None
    # Remove all non-digit characters
    digits = re.sub(r'\D', '', phone)
    # If the number starts with '0' and is 10 digits, it might be an Indian number without country code
    # We'll just return the digits as is, and let the entity resolution handle it.
    return digits if digits else None

def normalize_vehicle_number(vehicle: str) -> Optional[str]:
    """
    Normalize a vehicle registration number.
    Removes all non-alphanumeric characters and converts to uppercase.
    """
    if not vehicle:
        return None
    # Keep only alphanumeric and convert to uppercase
    normalized = re.sub(r'[^A-Za-z0-9]', '', vehicle).upper()
    return normalized if normalized else None

def normalize_account_number(account: str) -> Optional[str]:
    """
    Normalize a bank account number.
    Removes all non-alphanumeric characters.
    """
    if not account:
        return None
    # Keep only alphanumeric
    normalized = re.sub(r'[^A-Za-z0-9]', '', account)
    return normalized if normalized else None

def normalize_name(name: str) -> Optional[str]:
    """
    Normalize a name for entity resolution.
    Converts to uppercase and removes extra whitespace.
    """
    if not name:
        return None
    # Convert to uppercase and strip whitespace
    normalized = name.strip().upper()
    # Remove any extra spaces between words
    normalized = re.sub(r'\s+', ' ', normalized)
    return normalized if normalized else None

def normalize_date(date_str: str) -> Optional[str]:
    """
    Normalize a date string to YYYY-MM-DD format.
    Assumes the input is already in YYYY-MM-DD or similar.
    """
    if not date_str:
        return None
    # We'll assume the date is in YYYY-MM-DD format, but we can try to parse common formats.
    # For simplicity, we'll return the string if it matches YYYY-MM-DD, otherwise try to parse.
    # We'll use a simple regex to check for YYYY-MM-DD
    if re.match(r'^\d{4}-\d{2}-\d{2}$', date_str):
        return date_str
    # If not, we might try to parse, but for now we'll return None if not in expected format.
    # In a real implementation, we would use dateutil.parser or similar.
    return None  # Placeholder: we assume the dates are already in YYYY-MM-DD

def normalize_amount(amount_str: str) -> Optional[float]:
    """
    Normalize an amount string to a float.
    Removes currency symbols and commas.
    """
    if not amount_str:
        return None
    # Remove currency symbols and commas
    cleaned = re.sub(r'[^\d.]', '', amount_str)
    try:
        return float(cleaned)
    except ValueError:
        return None
