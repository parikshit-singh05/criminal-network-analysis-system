# Criminal Network Analysis System - MVP

An AI-powered system for analyzing criminal networks by ingesting structured, semi-structured, and unstructured data, extracting entities and relationships, resolving entities across sources, and building a provenance-aware knowledge graph for analysis.

## System Overview

This MVP implements a complete pipeline for criminal network analysis:

1. **Data Ingestion**: Processes structured (CSV) and semi-structured (JSON) data from various sources
2. **Entity Extraction**: Uses enhanced NER to extract persons, phone numbers, vehicle numbers, bank accounts, locations, and organizations from text
3. **Relationship Extraction**: Identifies relationships between entities using pattern matching and proximity analysis
4. **Entity Resolution**: Resolves duplicate entities across different data sources
5. **Knowledge Graph**: Stores all entities and relationships in a Neo4j graph database with provenance tracking
6. **Analytics & API**: Provides graph traversal, analytics, and REST APIs for exploration

## Architecture

```
Data Sources → Ingestion Services → Entity/Relationship Extraction → 
Entity Resolution → Neo4j Knowledge Graph → Analytics & API Layer
```

## Components

### Ingestion Services
- `phone_registry_service.py` - Processes phone registry data
- `vehicle_registry_service.py` - Processes vehicle registration data  
- `bank_account_service.py` - Processes bank account data
- `organization_registry_service.py` - Processes organization data
- `location_service.py` - Processes location data
- `criminal_record_service.py` - Processes criminal records
- `cdr_service.py` - Processes call detail records
- `financial_transaction_service.py` - Processes financial transactions
- `case_metadata_service.py` - Processes case metadata and creates case relationships
- `fir_records_service.py` - Processes FIR records
- `social_media_service.py` - Processes social media posts
- `email_service.py` - Processes email records
- `fir_narrative_service.py` - Processes unstructured FIR narratives (uses NLP)

### NLP Components
- `ner.py` - Enhanced named entity recognition for criminal justice domain
- `relation_extractor.py` - Relationship extraction using patterns and proximity analysis

### Entity Resolution
- `entity_resolution/resolver.py` - Resolves duplicate entities based on normalized attributes

### API Layer
- `app/api/entities.py` - Entity CRUD operations and search
- `app/api/graph.py` - Graph traversal, pathfinding, and neighborhood queries
- `app/api/analytics.py` - Graph analytics (degree centrality, clustering coefficient, etc.)
- `app/api/evidence.py` - Document and provenance management
- `app/api/anomalies.py` - Anomaly detection (high-degree entities, isolates, etc.)

## Installation

1. **Prerequisites**:
   - Python 3.8+
   - Neo4j 4.0+ (with APOC plugin recommended for full functionality)
   - pip

2. **Setup**:
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd Criminal Network Analysis Project/backend

   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Configure Neo4j connection
   # Edit app/config.py or set environment variables:
   # NEO4J_URI=bolt://localhost:7687
   # NEO4J_USER=neo4j
   # NEO4J_PASSWORD=password
   ```

3. **Initialize Database**:
   ```bash
   # Run the verification script to test ingestion
   python final_verification.py
   ```

## Usage

### Running the System

1. **Start the API Server**:
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Access the API Documentation**:
   Open your browser to: `http://localhost:8000/docs`

3. **Example API Calls**:
   
   - **List all persons**:
     ```
     GET /entities/?entity_type=PERSON&limit=50
     ```
   
   - **Search for entities by name**:
     ```
     GET /entities/search/?q=Rajesh&entity_type=PERSON
     ```
   
   - **Find shortest path between two entities**:
     ```
     GET /graph/path/{entity_id_1}/{entity_id_2}
     ```
   
   - **Get neighbors of an entity**:
     ```
     GET /graph/neighbors/{entity_id}
     ```
   
   - **Get degree centrality (most connected entities)**:
     ```
     GET /analytics/degree-centrality?limit=10
     ```
   
   - **Get documents mentioning a specific entity**:
     ```
     GET /evidence/entity-provenance/{entity_id}
     ```

## Data Model

### Node Labels
- `Person` - Criminal suspects, victims, witnesses, investigators
- `Phone` - Mobile and landline phone numbers
- `Vehicle` - Vehicles with registration numbers
- `BankAccount` - Bank accounts
- `Organization` - Companies, institutions, police stations
- `Location` - Addresses, areas, buildings
- `Document` - Source documents (FIRs, emails, reports, etc.)
- `Case` - Criminal cases

### Relationship Types
- `MENTIONED_IN` - Document to entity (provenance)
- `INVOLVED_IN` - Person to Case (from criminal records)
- `CALLS` - Phone to Phone (from CDR)
- `TRANSFERS` - BankAccount to BankAccount (from financial transactions)
- `RELATED_TO` - Case to Case (from case metadata)
- `RELATED_TO` - Generic entity-to-entity (from NLP relation extraction)
- Specific types like `COMMUNICATED_WITH`, `TRANSPORTED_IN_VEHICLE`, `RECEIVED_MONEY_FROM`, etc.

## Features

### Entity Extraction
- Persons: Names of individuals
- Phones: Mobile and landline numbers (Indian and international formats)
- Vehicles: Registration numbers (Indian format)
- Accounts: Bank account numbers
- Locations: Addresses, sectors, hotels, cities
- Organizations: Companies, banks, police stations

### Relationship Extraction
- Financial: `RECEIVED_MONEY_FROM`, `MADE_PAYMENT_TO`, `USING_HAWALA_CHANNEL_OF`
- Communication: `COMMUNICATED_WITH`, `MAINTAINED_CONTACT_WITH`
- Physical: `MET_WITH`, `SEEN_WITH`, `VISITED`, `RESIDED_AT`
- Transportation: `TRANSPORTED_IN_VEHICLE`, `DRVE_VEHICLE`
- Criminal: `SUPPLIED_TO`, `RECEIVED_FROM`, `CONSPIRED_WITH`
- Location-based: `WAS_AT_LOCATION`, `INCIDENT_AT_LOCATION`

### Analytics
- Degree Centrality: Find most connected entities (potential hubs)
- Connected Components: Identify disconnected subgraphs
- Clustering Coefficient: Measure how closely neighbors are interconnected
- Anomaly Detection: Find unusually high-degree entities, isolated nodes, mutually exclusive pairs

## Future Enhancements

1. **Advanced NLP**: Integrate transformer-based NER and relation extraction models
2. **Temporal Analysis**: Add temporal reasoning for tracking entity states over time
3. **Geospatial Analysis**: Integrate maps for location-based visualization
4. **Machine Learning**: Train models for anomaly detection and link prediction
5. **Visualization**: Build a web-based graph visualization interface
6. **Real-time Ingestion**: Add support for streaming data sources
7. **Multi-lingual Support**: Extend NLP to handle multiple languages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Built as part of an AI-Powered Criminal Network Analysis System MVP.