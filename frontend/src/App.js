import React, { useState, useEffect } from 'react';
import cytoscape from 'cytoscape';
import './App.css';

// Function to fetch data from backend API
async function fetchEntities() {
  try {
    const response = await fetch('http://localhost:8000/entities/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching entities:', error);
    return { entities: [], count: 0 };
  }
}

// Function to fetch relationships for a given entity
async function fetchEntityRelationships(entityId, maxDepth = 2) {
  try {
    const response = await fetch(`http://localhost:8000/graph/traverse/${entityId}?max_depth=${maxDepth}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching entity relationships:', error);
    return { paths: [] };
  }
}

// Function to convert Neo4j data to Cytoscape format
function convertToCytoscapeElements(data) {
  const nodes = [];
  const edges = [];
  const nodeIds = new Set();

  // Process nodes from paths
  data.paths.forEach(path => {
    path.nodes.forEach(node => {
      if (!nodeIds.has(node.id)) {
        nodeIds.add(node.id);
        nodes.push({
          data: {
            id: node.id,
            label: node.value || 'Unknown',
            type: node.types[0] || 'Unknown',
            ...node.properties
          }
        });
      }
    });

    path.relationships.forEach(rel => {
      edges.push({
        data: {
          id: rel.id || `${rel.startNode}-${rel.endNode}`,
          source: rel.startNode,
          target: rel.endNode,
          label: rel.type || 'RELATED_TO',
          ...rel.properties
        }
      });
    });
  });

  // If no paths but we have a starting entity, add it
  if (data.starting_entity && !nodeIds.has(data.starting_entity.id)) {
    nodes.push({
      data: {
        id: data.starting_entity.id,
        label: data.starting_entity.value || 'Unknown',
        type: data.starting_entity.types[0] || 'Unknown',
        ...data.starting_entity.properties
      }
    });
  }

  return [...nodes, ...edges];
}

function App() {
  const [entities, setEntities] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [cytoElements, setCytoElements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cytoRef, setCytoRef] = useState(null);

  // Fetch entities on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchEntities();
        setEntities(data.entities);
      } catch (err) {
        setError('Failed to load entities');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle entity selection
  const handleEntitySelect = async (entityId) => {
    setSelectedEntity(entityId);
    setLoading(true);
    try {
      const relationshipData = await fetchEntityRelationships(entityId);
      const cytoElements = convertToCytoscapeElements(relationshipData);
      setCytoElements(cytoElements);
    } catch (err) {
      setError('Failed to load entity relationships');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Cytoscape when ref is available
  useEffect(() => {
    if (cytoRef !== null) {
      const cy = cytoscape({
        container: cytoRef,
        elements: cytoElements,
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#6FB1FC',
              'label': 'data(label)',
              'text-valign': 'center',
              'color': '#fff',
              'text-outline-width': 2,
              'text-outline-color': '#6FB1FC',
              'width': 60,
              'height': 60,
              'font-size': 10
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 2,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier'
            }
          },
          {
            selector: ':selected',
            style: {
              'background-color': '#0000FF',
              'line-color': '#0000FF',
              'target-arrow-color': '#0000FF',
              'source-arrow-color': '#0000FF'
            }
          },
          {
            selector: 'node[type="PERSON"]',
            style: {
              'background-color': '#FF6B6B'
            }
          },
          {
            selector: 'node[type="PHONE"]',
            style: {
              'background-color': '#4ECDC4'
            }
          },
          {
            selector: 'node[type="VEHICLE"]',
            style: {
              'background-color': '#45B7D1'
            }
          },
          {
            selector: 'node[type="ACCOUNT"]',
            style: {
              'background-color': '#FFBE0B'
            }
          },
          {
            selector: 'node[type="ORGANIZATION"]',
            style: {
              'background-color': '#9B59B6'
            }
          },
          {
            selector: 'node[type="LOCATION"]',
            style: {
              'background-color': '#2ECC71'
            }
          }
        ],
        layout: {
          name: 'breadthfirst',
          directed: true,
          padding: 10
        }
      });

      // Clean up on unmount
      return () => cy.destroy();
    }
  }, [cytoRef, cytoElements]);

  if (loading) {
    return <div className="App">Loading...</div>;
  }

  if (error) {
    return <div className="App">Error: {error}</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Criminal Network Analysis System</h1>
      </header>
      <div className="main-content">
        <aside className="sidebar">
          <h2>Entities</h2>
          <input
            type="text"
            placeholder="Search entities..."
            className="search-input"
            onChange={(e) => {
              // Implement search filtering
            }}
          />
          <ul className="entity-list">
            {entities.map(entity => (
              <li
                key={entity.id}
                className={selectedEntity === entity.id ? 'selected' : ''}
                onClick={() => handleEntitySelect(entity.id)}
              >
                {entity.value} ({entity.types[0]})
              </li>
            ))}
          </ul>
        </aside>
        <div className="cyto-container">
          <div ref={setCytoRef} id="cyto-container" />
          {selectedEntity && (
            <div className="entity-details">
              <h3>Selected Entity Details</h3>
              {/* Entity details will be displayed here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;