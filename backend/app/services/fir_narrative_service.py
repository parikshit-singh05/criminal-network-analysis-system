import os
from app.ingestion.text_processor import process_text_document

DATASET_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'dataset', 'criminal_network_dataset', 'unstructured', 'fir_narratives')

def ingest_fir_narratives():
    """
    Ingest FIR narrative text files into Neo4j.
    Uses the text processor to extract entities and relationships and store them in Neo4j.
    """
    if not os.path.exists(DATASET_PATH):
        print(f"Directory not found: {DATASET_PATH}")
        return

    for filename in os.listdir(DATASET_PATH):
        if filename.endswith(".txt"):
            file_path = os.path.join(DATASET_PATH, filename)
            # We'll let the text processor handle the file reading and metadata extraction.
            # However, our text processor currently doesn't extract metadata from the file header.
            # We'll update the text processor to accept source_info, and we'll pass the metadata we extract here.
            # For now, we'll read the file and extract metadata as before, then call process_text_document.
            with open(file_path, 'r', encoding='utf-8') as file:
                content = file.read()

            # Extract metadata from the file (assuming a header format)
            lines = content.split('\n')
            metadata = {}
            text_lines = []
            in_metadata = True
            for line in lines:
                if in_metadata and ':' in line:
                    key, value = line.split(':', 1)
                    metadata[key.strip()] = value.strip()
                else:
                    in_metadata = False
                    text_lines.append(line)
            text = '\n'.join(text_lines)

            # Prepare source_info
            source_info = {
                'file_path': file_path,
                'file_name': filename,
                'metadata': metadata
            }

            # Process the text document
            process_text_document(text, source_info)

            print(f"Processed FIR narrative: {filename}")

    print("FIR narratives ingestion completed.")