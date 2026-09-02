import React, { useRef, useEffect, useState } from 'react';
import Cytoscape from 'cytoscape';
import { neo4jToCytoscape } from '../../utils/graphUtils';
import GraphToolbar from '../graph/GraphToolbar';
import styles from '../../styles/components.css';
import { getEntityDisplayValue, getEntityTypeLabel, getRelationshipCategory } from '../../utils/normalization';

const GraphPanel = ({ children }) => {
  const cyRef = useRef(null);
  const containerRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [layoutName, setLayoutName] = useState('cose'); // Changed to cose for better force-directed layout
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLabels, setShowLabels] = useState(true);
  const [animationEnabled, setAnimationEnabled] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = Cytoscape({
      container: containerRef.current,
      elements: [],
      style: [],
      zoomingEnabled: true,
      panningEnabled: true,
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      autolock: false,
      autoungrabify: false,
      autounselectify: true,
      selectionType: 'single'
    });

    cyRef.current = cy;

    // Handle node selection
    cy.on('select', 'node', (evt) => {
      const node = evt.target;
      setSelectedNodeId(node.id());
      setSelectedEdgeId(null); // Clear edge selection when node is selected
    });

    cy.on('unselect', 'node', () => {
      setSelectedNodeId(null);
    });

    // Handle edge selection
    cy.on('select', 'edge', (evt) => {
      const edge = evt.target;
      setSelectedEdgeId(edge.id());
      setSelectedNodeId(null); // Clear node selection when edge is selected
    });

    cy.on('unselect', 'edge', () => {
      setSelectedEdgeId(null);
    });

    // Fit to elements when they change
    cy.on('layoutstop layoutready', () => {
      // Update zoom level from Cytoscape
      setZoomLevel(cy.zoom());
    });

    return () => {
      if (cy) cy.destroy();
    };
  }, []);

  // Update Cytoscape elements when they change
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.elements().remove();
      if (elements.length > 0) {
        cyRef.current.add(elements);

        // Apply layout
        const layoutOptions = {
          ...getLayoutOptions(layoutName),
          animate: animationEnabled
        };

        cyRef.current.layout(layoutOptions).run();
      }
    }
  }, [elements, layoutName, animationEnabled]);

  // Handle zoom changes from outside
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.zoom(zoomLevel);
    }
  }, [zoomLevel]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cyRef.current) {
        cyRef.current.resize();
        cyRef.current.fit(cyRef.current.elements(), 50);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getLayoutOptions = (layoutName) => {
    const baseOptions = {
      fit: true,
      padding: 30,
      animate: true,
      animationDuration: 500
    };

    switch (layoutName) {
      case 'breadthfirst':
        return {
          ...baseOptions,
          name: 'breadthfirst',
          directed: true,
          circle: false
        };
      case 'circle':
        return {
          ...baseOptions,
          name: 'circle'
        };
      case 'concentric':
        return {
          ...baseOptions,
          name: 'concentric'
        };
      case 'cose':
        return {
          ...baseOptions,
          name: 'cose',
          animate: true,
          animationDuration: 1000,
          ungrabifyWhileSimulating: false
        };
      case 'grid':
        return {
          ...baseOptions,
          name: 'grid',
          rows: 1
        };
      case 'preset':
        return {
          ...baseOptions,
          name: 'preset'
        };
      default:
        return {
          ...baseOptions,
          name: 'cose',
          animate: true
        };
    }
  };

  const handleLayoutChange = (e) => {
    setLayoutName(e.target.value);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const handleFitToView = () => {
    if (cyRef.current) {
      cyRef.current.fit(cyRef.current.elements(), 50);
      setZoomLevel(cyRef.current.zoom());
    }
  };

  const handleCenterSelected = () => {
    if (cyRef.current && selectedNodeId) {
      const node = cyRef.current.getElementById(selectedNodeId);
      if (!node.empty()) {
        cyRef.current.animate({
          fit: {
            eles: node,
            padding: 50
          }
        }, {
          duration: 500,
          easing: 'ease-in-out'
        });
      }
    }
  };

  const handleExpandNeighbors = () => {
    // This would fetch neighbors of selected node and add them to the graph
    // For now, we'll just show an alert
    if (selectedNodeId) {
      alert(`Expanding neighbors for node ${selectedNodeId} - feature coming soon`);
    }
  };

  const handleToggleLabels = () => {
    setShowLabels(!showLabels);
    // In a real implementation, we would update the stylesheet to show/hide labels
  };

  const handleToggleAnimation = () => {
    setAnimationEnabled(!animationEnabled);
  };

  // This would normally fetch data based on selected entity from sidebar
  // For now, we'll simulate with empty state or sample data when implemented
  const loadGraphData = async (entityId) => {
    setLoading(true);
    setError(null);
    try {
      if (entityId) {
        // Fetch the neighborhood of the selected entity
        const response = await apiService.get(`/graph/traverse/${entityId}/`, {
          max_depth: 2,
          direction: 'both'
        });
        const newElements = neo4jToCytoscape(response);
        setElements(newElements);
      } else {
        // Show a default view or empty state
        setElements([]);
      }
    } catch (err) {
      setError(err.message);
      setElements([]);
    } finally {
      setLoading(false);
    }
  };

  // Listen for entity selection from sidebar (in a real app, this would be via context/state management)
  // For now, we'll simulate by checking if there's a selected entity in localStorage or props
  // In a full implementation, we'd use React Context or a state management library
  useEffect(() => {
    // Check for selected entity from storage or props
    const storedEntityId = localStorage.getItem('selectedEntityId');
    if (storedEntityId) {
      loadGraphData(storedEntityId);
    } else {
      // Load a default view to avoid blank graph
      loadDefaultView();
    }
  }, []);

  const loadDefaultView = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get some entities to show in the graph
      const response = await apiService.get('/entities/', { limit: 50 });

      // If we have entities, show connections for the first one
      if (response.entities && response.entities.length > 0) {
        const firstEntityId = getNeo4jId(response.entities[0].id);
        loadGraphData(firstEntityId);
        // Store this as the default selected entity
        localStorage.setItem('selectedEntityId', firstEntityId);
      } else {
        setElements([]);
      }
    } catch (err) {
      console.error('Error loading default view:', err);
      setElements([]);
    } finally {
      setLoading(false);
    }
  };

  // Store selected edge ID to localStorage for RightPanel to access
  useEffect(() => {
    if (selectedEdgeId) {
      localStorage.setItem('selectedEdgeId', selectedEdgeId);
    } else {
      localStorage.removeItem('selectedEdgeId');
    }
  }, [selectedEdgeId]);

  return (
    <section className={`${styles['graph-panel']} flex-1 flex-col relative`}>
      <GraphToolbar
        onLayoutChange={handleLayoutChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        onFitToView={handleFitToView}
        onCenterSelected={handleCenterSelected}
        onExpandNeighbors={handleExpandNeighbors}
        onToggleLabels={handleToggleLabels}
        onToggleAnimation={handleToggleAnimation}
        layoutName={layoutName}
        zoomLevel={zoomLevel}
        showLabels={showLabels}
        animationEnabled={animationEnabled}
        selectedNodeId={selectedNodeId}
        selectedEdgeId={selectedEdgeId}
      />
      <div className={`flex-1 relative ${styles['graph-canvas']}`} ref={containerRef}>
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-base/80">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-secondary">Loading graph...</span>
            </div>
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-base/80">
            <div className="text-center text-anomaly">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="text-sm">Error loading graph: {error}</div>
              <button
                onClick={loadDefaultView}
                className="mt-3 px-4 py-2 bg-elevated border border-border rounded-md text-sm hover:bg-accent/20"
              >
                Retry
              </button>
            </div>
          </div>
        )}
        {(loading || error) && elements.length === 0 ? null : (
          <div className="absolute inset-0 pointer-events-none">
            {/* Cytoscape container */}
          </div>
        )}
        {!loading && !error && elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-base/60">
            <div className="text-center text-secondary">
              <div className="text-3xl mb-4">🕸️</div>
              <div className="text-lg mb-2">No graph data to display</div>
              <div className="text-sm">
                Select an entity from the sidebar to visualize its connections
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

// Mock API service for now - in reality, this would be imported from utils/api
const apiService = {
  get: async (endpoint, params) => {
    // This is a mock - in reality, we'd use the actual apiService
    // For now, we'll return empty data to avoid errors
    if (endpoint.includes('/graph/traverse/')) {
      return { paths: [], starting_entity: {} };
    }
    return { entities: [] };
  }
};

export default GraphPanel;