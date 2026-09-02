# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Python/FastAPI)
- **Start API server**: `cd backend && uvicorn app.main:app --reload`
- **Run tests**: `python -m pytest` or run individual test files like `python test_nlp.py`
- **Install dependencies**: `pip install -r requirements.txt` (in backend directory)
- **Run verification script**: `python final_verification.py` (tests full ingestion pipeline)
- **Environment setup**: Copy `.env.example` to `.env` and configure Neo4j connection:
  ```
  NEO4J_URI=bolt://localhost:7687
  NEO4J_USER=neo4j
  NEO4J_PASSWORD=password
  ```
  Alternatively, use Docker Compose to run Neo4j (see Common Tasks).

### Frontend (React)
- **Start development server**: `cd frontend && npm start`
- **Run tests**: `npm test`
- **Build for production**: `npm run build`
- **Install dependencies**: `npm install` (in frontend directory)
- **Configure API URL**: Set `REACT_APP_API_URL` environment variable to point to the backend (e.g., `REACT_APP_API_URL=http://localhost:8000`) if not running locally on port 8000

### Common Tasks
- **Run specific ingestion service**: Use `python run_one_service.py` (modify the script to import the desired service) or create a similar script for the target service
- **Check Neo4j connection**: Ensure Neo4j is running on localhost:7687 with APOC plugin recommended
- **Access API docs**: Visit `http://localhost:8000/docs` when backend is running
- **Access frontend**: Visit `http://localhost:3000` when frontend is running
- **Run Neo4j with Docker Compose**: `docker-compose up` (starts Neo4j with APOC plugin enabled; credentials: neo4j/password)

## Code Architecture

### Backend Structure
```
backend/
├── app/
│   ├── api/                 # REST API endpoints
│   │   ├── entities.py      # Entity CRUD and search operations
│   │   ├── graph.py         # Graph traversal, pathfinding, neighborhood queries
│   │   ├── analytics.py     # Graph analytics (centrality, clustering, etc.)
│   │   ├── anomalies.py     # Anomaly detection (high-degree entities, isolates)
│   │   └── evidence.py      # Document and provenance management
│   ├── ingestion/           # Data ingestion services for various sources
│   ├── nlp/                 # Natural language processing components
│   │   ├── ner.py          # Enhanced named entity recognition
│   │   └── relation_extractor.py  # Relationship extraction using patterns
│   ├── entity_resolution/   # Entity resolution logic
│   ├── repositories/        # Data access layer for Neo4j
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── config.py            # Configuration management
│   └── main.py              # FastAPI application entry point
├── requirements.txt         # Python dependencies
├── run.py                   # Simple script to start the API
└── *_service.py             # Individual service runners for ingestion
```

### Frontend Structure
```
frontend/
├── src/
│   ├── App.js               # Main React application with Cytoscape visualization
│   ├── App.css              # Styling
│   ├── index.js             # Entry point
│   └── ...                  # Standard Create React App structure
├── package.json             # npm dependencies and scripts
└── public/                  # Static assets
```

### Key Architectural Components

1. **Data Pipeline**:
   - Structured data ingestion services process CSV/JSON from sources (phone records, vehicle registry, bank accounts, etc.)
   - Unstructured data processed by `fir_narrative_service.py` using NLP components
   - Entity extraction identifies persons, phones, vehicles, accounts, locations, organizations
   - Relationship extraction finds connections between entities using pattern matching
   - Entity resolution merges duplicate entities across sources based on normalized attributes
   - Data stored in Neo4j graph database with provenance tracking (`MENTIONED_IN` relationships)

2. **API Layer** (REST endpoints):
   - `/entities/` - CRUD operations and search for entities
   - `/graph/` - Graph traversal, pathfinding, neighborhood queries
   - `/analytics/` - Degree centrality, clustering coefficient, connected components
   - `/anomalies/` - Anomaly detection (high-degree entities, isolates)
   - `/evidence/` - Document provenance and source tracking

3. **Frontend**:
   - React app with Cytoscape for interactive graph visualization
   - Fetches data from backend API to display entity relationships
   - Color-coded node types (PERSON, PHONE, VEHICLE, ACCOUNT, ORGANIZATION, LOCATION)
   - Breadth-first layout for clear hierarchical visualization

### Technology Stack
- **Backend**: Python 3.8+, FastAPI, Neo4j, PyTorch, Transformers, SpaCy
- **Frontend**: React, Cytoscape.js
- **Database**: Neo4j 4.0+ with APOC plugin
- **API Documentation**: Auto-generated Swagger UI at `/docs`

### Extension Points
- Add new ingestion services in `backend/app/ingestion/` following existing patterns
- Enhance NLP models in `backend/app/nlp/` for better entity/relationship extraction
- Add new analytics endpoints in `backend/app/api/analytics.py`
- Extend frontend visualization with additional node/edge styling in `frontend/src/App.js`