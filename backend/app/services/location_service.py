from app.repositories.neo4j_connector import neo4j_connector
from app.utils.normalization import normalize_name
import csv
import os

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'structured', 'locations.csv')

def ingest_locations():
    """
    Ingest location data from CSV into Neo4j.
    Creates Location nodes.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"File not found: {DATASET_PATH}")
        return

    with open(DATASET_PATH, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            original_name = row['name']
            location_name = normalize_name(original_name)
            location_type = row['type']
            city = row['city']
            state = row['state']
            country = row['country']
            try:
                latitude = float(row['latitude']) if row['latitude'] else None
            except ValueError:
                latitude = None
            try:
                longitude = float(row['longitude']) if row['longitude'] else None
            except ValueError:
                longitude = None
            aliases = row['aliases']
            location_id = row['location_id']

            if not original_name:
                continue

            # Create or merge the Location node
            location_query = """
            MERGE (l:Location {location_id: $location_id})
            SET l.name = $original_name,
                l.normalized_name = $location_name,
                l.type = $location_type,
                l.city = $city,
                l.state = $state,
                l.country = $country,
                l.latitude = $latitude,
                l.longitude = $longitude,
                l.aliases = $aliases
            """
            neo4j_connector.run_query(location_query, {
                "location_id": location_id,
                "original_name": original_name,
                "location_name": location_name,
                "location_type": location_type,
                "city": city,
                "state": state,
                "country": country,
                "latitude": latitude,
                "longitude": longitude,
                "aliases": aliases
            })

            print(f"Processed location: {location_name}")

    print("Location ingestion completed.")