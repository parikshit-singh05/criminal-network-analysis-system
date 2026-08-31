# Criminal Network Analysis System - Frontend

This is the frontend visualization interface for the Criminal Network Analysis System MVP. It provides an interactive graph visualization of criminal networks using React.js and Cytoscape.js.

## Features

- Interactive graph visualization of criminal networks
- Entity listing with search capability
- Click on entities to view their relationships and network connections
- Visual differentiation of entity types (persons, phones, vehicles, accounts, organizations, locations)
- Responsive design for different screen sizes

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- The backend API server running on http://localhost:8000

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

1. Make sure the backend API server is running:
   ```bash
   # From the project root directory
   cd backend
   uvicorn app.main:app --reload
   ```

2. Start the frontend development server:
   ```bash
   # From the frontend directory
   npm start
   ```

3. Open your browser to http://localhost:3000

## API Integration

The frontend consumes the following backend API endpoints:

- `GET /entities/` - Fetches list of all entities
- `GET /graph/traverse/{entity_id}?max_depth={depth}` - Fetches relationships for a given entity

## Component Structure

- `App.js` - Main application component containing:
  - Entity fetching and state management
  - Graph visualization using Cytoscape.js
  - Sidebar for entity listing
  - Main content area for graph display
  - Entity details panel

## Styling

Different entity types are visualized with distinct colors:
- Persons: Red (#FF6B6B)
- Phones: Teal (#4ECDC4)
- Vehicles: Blue (#45B7D1)
- Accounts: Yellow (#FFBE0B)
- Organizations: Purple (#9B59B6)
- Locations: Green (#2ECC71)
- Default: Blue (#6FB1FC)

## Customization

To modify the visualization or add new features:

1. Adjust the Cytoscape.js style definitions in `App.js` to change node/edge appearance
2. Modify the layout algorithm (currently using 'breadthfirst')
3. Add additional API endpoints for more advanced features like pathfinding or analytics
4. Enhance the entity details panel to show more information

## Future Enhancements

- Implement search functionality in the entity list
- Add pathfinding visualization between two entities
- Incorporate analytics data (degree centrality, etc.) into the visualization
- Add filtering options for relationship types
- Implement zoom and pan controls for the graph
- Add node/detail popups on hover or click