import json
from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_name
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'semi_structured', 'email_records.json')

def ingest_email_records():
    """
    Ingest email records from JSON into Neo4j.
    Creates Document nodes and extracts entities and relationships from the email content.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        data = json.load(file)
        data = data.get('email_records', [])

    # Assuming the JSON structure is a list of email objects
    for email in data:
        email_id = email.get('email_id')
        case_id = email.get('case_id')
        sender = email.get('sender')
        recipients = email.get('recipients', [])
        subject = email.get('subject')
        body = email.get('body')
        date = email.get('date')
        # Other fields

        # Create or merge the Document node (representing the email)
        doc_query = """
        MERGE (d:Document {document_id: $email_id})
        SET d.case_id = $case_id,
            d.sender = $sender,
            d.subject = $subject,
            d.body = $body,
            d.date = $date,
            d.document_type = 'EMAIL'
        """
        neo4j_connector.run_query(doc_query, {
            "email_id": email_id,
            "case_id": case_id,
            "sender": sender,
            "subject": subject,
            "body": body,
            "date": date
        })

        # TODO: Extract entities and relationships from email body using NLP
        # For now, we'll just store the email as a document.

        print(f"Processed email: {email_id}")

    print("Email records ingestion completed.")