from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_account_number, normalize_name, normalize_amount
import csv
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'structured', 'financial_transactions.csv')

def ingest_financial_transactions():
    """
    Ingest financial transaction data from CSV into Neo4j.
    Creates TRANSFERS relationships between BankAccount nodes.
    Also creates BankAccount nodes if they don't exist (based on account_number).
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Normalize sender and receiver account numbers
            sender_account = normalize_account_number(row['sender_account'])
            receiver_account = normalize_account_number(row['receiver_account'])
            # Normalize sender and receiver names
            sender_name = normalize_name(row['sender_name'])
            receiver_name = normalize_name(row['receiver_name'])
            # Other fields
            date = row['date']
            try:
                amount_inr = float(row['amount_inr']) if row['amount_inr'] else None
            except ValueError:
                amount_inr = None
            bank = row['bank']
            txn_type = row['type']
            description = row['description']
            source_case_id = row['source_case_id']
            transaction_id = row['transaction_id']

            # Skip if essential fields are missing
            if not sender_account or not receiver_account:
                continue

            # Create or merge the sender BankAccount node
            sender_query = """
            MERGE (a:BankAccount {account_number: $account_number})
            ON CREATE SET a.normalized_number = $normalized_number, a.account_id = $account_number
            ON MATCH SET a.account_number = COALESCE(a.account_number, $account_number)
            """
            neo4j_connector.run_query(sender_query, {
                "account_number": row['sender_account'],
                "normalized_number": sender_account
            })

            # Create or merge the receiver BankAccount node
            receiver_query = """
            MERGE (a:BankAccount {account_number: $account_number})
            ON CREATE SET a.normalized_number = $normalized_number, a.account_id = $account_number
            ON MATCH SET a.account_number = COALESCE(a.account_number, $account_number)
            """
            neo4j_connector.run_query(receiver_query, {
                "account_number": row['receiver_account'],
                "normalized_number": receiver_account
            })

            # Create the TRANSFERS relationship between the two bank accounts
            transfer_query = """
            MATCH (sender:BankAccount {account_number: $sender_account_number})
            MATCH (receiver:BankAccount {account_number: $receiver_account_number})
            MERGE (sender)-[r:TRANSFERS {transaction_id: $transaction_id}]->(receiver)
            SET r.sender_name = $sender_name,
                r.receiver_name = $receiver_name,
                r.amount_inr = $amount_inr,
                r.bank = $bank,
                r.type = $type,
                r.description = $description,
                r.date = $date,
                r.source_case_id = $source_case_id
            """
            neo4j_connector.run_query(transfer_query, {
                "sender_account_number": row['sender_account'],
                "receiver_account_number": row['receiver_account'],
                "transaction_id": transaction_id,
                "sender_name": row['sender_name'],
                "receiver_name": row['receiver_name'],
                "amount_inr": amount_inr,
                "bank": bank,
                "type": txn_type,
                "description": description,
                "date": date,
                "source_case_id": source_case_id
            })

            print(f"Processed transaction: {sender_account} -> {receiver_account} ({amount_inr})")

    print("Financial transaction ingestion completed.")