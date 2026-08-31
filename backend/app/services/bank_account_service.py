from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_account_number, normalize_name
import csv
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'structured', 'bank_accounts.csv')

def ingest_bank_accounts():
    """
    Ingest bank account data from CSV into Neo4j.
    Creates BankAccount nodes and connects them to Person or Organization nodes via HELD_BY relationship.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            account_number = normalize_account_number(row['account_number'])
            holder_name = normalize_name(row['holder_name'])
            bank = row['bank']
            branch_city = row['branch_city']
            account_type = row['account_type']
            opened_date = row['opened_date']
            status = row['status']
            linked_entity_type = row['linked_entity_type']
            linked_entity_id = row['linked_entity_id']
            account_id = row['account_id']

            if not account_number:
                continue

            # Create or merge the BankAccount node
            account_query = """
            MERGE (a:BankAccount {account_id: $account_id})
            SET a.account_number = $account_number,
                a.normalized_number = $normalized_number,
                a.holder_name = $holder_name,
                a.bank = $bank,
                a.branch_city = $branch_city,
                a.account_type = $account_type,
                a.opened_date = $opened_date,
                a.status = $status,
                a.linked_entity_type = $linked_entity_type,
                a.linked_entity_id = $linked_entity_id
            """
            neo4j_connector.run_query(account_query, {
                "account_id": account_id,
                "account_number": row['account_number'],
                "normalized_number": account_number,
                "holder_name": holder_name,
                "bank": bank,
                "branch_city": branch_city,
                "account_type": account_type,
                "opened_date": opened_date,
                "status": status,
                "linked_entity_type": linked_entity_type,
                "linked_entity_id": linked_entity_id
            })

            print(f"Processed bank account: {account_number}")

    print("Bank account ingestion completed.")