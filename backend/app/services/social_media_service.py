import json
from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_name
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'semi_structured', 'social_media_export.json')

def ingest_social_media():
    """
    Ingest social media posts from JSON into Neo4j.
    Creates Document nodes and extracts entities and relationships from the post text.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        data = json.load(file)
        data = data.get('social_media_posts', [])

    # Assuming the JSON structure is a list of social media post objects
    for post in data:
        post_id = post.get('post_id')
        case_id = post.get('case_id')
        platform = post.get('platform')
        post_text = post.get('post_text')
        date = post.get('date')
        # Other fields

        # Create or merge the Document node (representing the social media post)
        doc_query = """
        MERGE (d:Document {document_id: $post_id})
        SET d.case_id = $case_id,
            d.platform = $platform,
            d.post_text = $post_text,
            d.date = $date,
            d.document_type = 'SOCIAL_MEDIA_POST'
        """
        neo4j_connector.run_query(doc_query, {
            "post_id": post_id,
            "case_id": case_id,
            "platform": platform,
            "post_text": post_text,
            "date": date
        })

        # TODO: Extract entities and relationships from post_text using NLP
        # For now, we'll just store the post as a document.

        print(f"Processed social media post: {post_id}")

    print("Social media ingestion completed.")