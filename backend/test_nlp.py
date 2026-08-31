#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.nlp.ner import extract_entities_from_text
from app.nlp.relation_extractor import extract_relations_from_text

def test_nlp():
    # Sample text from FIR-2024-001 narrative
    sample_text = """
    On 15th January 2024, at approximately 14:30 hours, acting on specific intelligence received from a reliable source,
    a team comprising Inspector Sharma, SI Verma, and constables conducted a raid at House No.
    House No. 45, Sector 12, Dwarka, Delhi.

    Upon entry, the team apprehended one Rajesh Kumar (approx. 38 years), resident of the said address.
    During search of the premises, 5 (five) kilograms of suspected heroin, packed in 50 packets of 100 grams each,
    was recovered from a concealed compartment in the bedroom wardrobe. Also recovered were:
    - One white Toyota Fortuner SUV bearing registration DL-5C-AB-1234 parked in the garage
    - Two mobile phones (numbers 9876543210 and 9988776655)
    - Cash amounting to Rs. 2,50,000/-
    - Bank passbook of HDFC Bank account number 12345678901234
    - A diary containing coded entries

    During interrogation, Rajesh Kumar disclosed that:
    1. The heroin consignment was received from one Vikram Singh, resident of Amritsar, Punjab,
       through a courier approximately 3 days prior.
    2. The drugs were transported from Amritsar to Delhi in the Toyota Fortuner DL-5C-AB-1234
       driven by an associate.
    3. Payment for the consignment was made through hawala channels operated by Mohammed Farooq,
       who runs a shop at Shop No. 78, Chandni Chowk, Delhi.
    4. Frequent communication was maintained with Vikram Singh (phone 9123456789) and
       an unknown number 9988776655 (traced to Ludhiana, Punjab).
    5. His HDFC account received suspicious deposits totaling approximately Rs. 50 lakhs
       from multiple shell company accounts based in Kolkata over the past 6 months.

    One Priya Sharma (approx. 32 years) was found present at the premises during the raid.
    She claimed to be visiting Rajesh Kumar for a property matter. However, surveillance records
    indicate she was seen meeting Sunil Verma at Hotel Grand Palace, Karol Bagh on multiple occasions
    in December 2023 and January 2024.

    Call Detail Record analysis of the seized phones reveals:
    - Number 9876543210 (Rajesh Kumar) had 47 calls with 9123456789 (Vikram Singh) in the past 30 days
    - Number 9876543210 had 23 calls with 9988776655 (Unknown, Ludhiana)
    - Number 9876543210 had 15 calls with 8877665544 (Sunil Verma, Mumbai)
    - Number 9123456789 (Vikram Singh) had 31 calls with 9111222333 (Mohammed Farooq)
    - Number 9123456789 had 18 calls with 7788990011 (Baldev Raj)
    """

    print("Testing NER...")
    entities = extract_entities_from_text(sample_text)
    print(f"Extracted {len(entities)} entities:")
    for entity in entities[:20]:  # Show first 20
        print(f"  {entity['type']}: {entity['text']} (pos: {entity['start']}-{entity['end']})")
    if len(entities) > 20:
        print(f"  ... and {len(entities) - 20} more")

    print("\nTesting Relation Extraction...")
    relations = extract_relations_from_text(sample_text, entities)
    print(f"Extracted {len(relations)} relations:")
    for relation in relations[:20]:  # Show first 20
        print(f"  {relation['source_entity_text']} ({relation['source_entity_type']}) "
              f"--[{relation['relation_type']}]--> "
              f"{relation['target_entity_text']} ({relation['target_entity_type']}) "
              f"(confidence: {relation['confidence']:.2f})")
    if len(relations) > 20:
        print(f"  ... and {len(relations) - 20} more")

if __name__ == "__main__":
    test_nlp()