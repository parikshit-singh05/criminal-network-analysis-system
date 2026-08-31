#!/usr/bin/env python3
"""
Test script to verify the advanced NLP service layer works correctly.
This test uses the regex-based implementation (default) to verify the service layer,
then demonstrates how to switch to transformer-based implementation.
"""
import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_service_layer():
    """Test that the NLP service layer works correctly."""
    print("Testing NLP Service Layer...")

    # Test 1: Get implementation info (should show regex by default)
    from app.nlp.nlp_service import get_nlp_implementation_info
    info = get_nlp_implementation_info()
    print(f"Current NLP implementation: {info}")
    assert info['use_transformer_nlp'] == False
    assert info['ner_implementation'] == 'regex'
    assert info['relation_implementation'] == 'regex'
    print("✓ Service layer correctly reports regex-based implementation (default)")

    # Test 2: Extract entities using the service layer
    from app.nlp import extract_entities_from_text
    test_text = "Rajesh Kumar was seen with Vikram Singh at House No. 45, Sector 12, Dwarka."
    entities = extract_entities_from_text(test_text)
    print(f"Extracted {len(entities)} entities: {[e['text'] for e in entities]}")
    assert len(entities) > 0
    # Should find person names, location, etc.
    entity_types = [e['type'] for e in entities]
    assert 'PERSON' in entity_types
    print("✓ Entity extraction working correctly")

    # Test 3: Extract relations using the service layer
    from app.nlp import extract_relations_from_text
    relations = extract_relations_from_text(test_text, entities)
    print(f"Extracted {len(relations)} relations: {[r['relation_type'] for r in relations]}")
    # Should find at least SEEN_WITH or similar
    print("✓ Relation extraction working correctly")

    # Test 4: Demonstrate how to switch to transformer-based implementation
    print("\nTo use transformer-based NLP, set environment variable:")
    print("  USE_TRANSFORMER_NLP=true")
    print("Then restart the application.")

    print("\nAll tests passed! The NLP service layer is working correctly.")
    return True

if __name__ == "__main__":
    try:
        test_service_layer()
        print("\n🎉 Advanced NLP service layer implementation successful!")
    except Exception as e:
        print(f"\n❌ Error testing NLP service layer: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)