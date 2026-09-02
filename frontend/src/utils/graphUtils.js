import { getEntityTypeConfig, getRelationshipCategory, getEntityDisplayValue, getEntityType, getNeo4jId } from './constants';
import { getConnectionCount } from './normalization';

/**
 * Convert Neo4j graph data to Cytoscape elements
 * @param {Object} data - Graph data from backend API
 * @returns {Array} Cytoscape elements (nodes and edges)
 */
export const neo4jToCytoscape = (data) => {
  const nodes = [];
  const edges = [];
  const nodeIds = new Set();

  // Handle different data formats from various endpoints
  let paths = [];
  let startingEntity = null;

  if (data.paths) {
    // From /graph/traverse/ endpoint
    paths = data.paths;
    startingEntity = data.starting_entity;
  } else if (data.path) {
    // From /graph/path/ endpoint
    paths = [data.path];
  } else if (data.nodes && data.relationships) {
    // Alternative format
    paths = [{ nodes: data.nodes, relationships: data.relationships }];
  }

  // First pass: collect all nodes
  paths.forEach(path => {
    path.nodes.forEach(node => {
      const nodeId = getNeo4jId(node.id);
      if (!nodeIds.has(nodeId)) {
        nodeIds.add(nodeId);
      }
    });
  });

  // Second pass: create nodes with proper sizing
  // We'll need to calculate degrees for sizing, so we need to know connections
  // For now, we'll use a placeholder degree and update later if we have edge data
  const nodeDegrees = {};

  // Initialize degrees
  nodeIds.forEach(id => {
    nodeDegrees[id] = 0;
  });

  // Calculate degrees from relationships
  paths.forEach(path => {
    path.relationships.forEach(rel => {
      const sourceId = getNeo4jId(rel.startNode);
      const targetId = getNeo4jId(rel.endNode);
      if (nodeDegrees[sourceId] !== undefined) nodeDegrees[sourceId]++;
      if (nodeDegrees[targetId] !== undefined) nodeDegrees[targetId]++;
    });
  });

  // Create nodes
  paths.forEach(path => {
    path.nodes.forEach(node => {
      const nodeId = getNeo4jId(node.id);
      if (!nodeIds.has(nodeId)) {
        nodeIds.add(nodeId);
        nodes.push(createCytoscapeNode(node, nodeDegrees[nodeId] || 0));
      }
    });
  });

  // Create edges
  paths.forEach(path => {
    path.relationships.forEach(rel => {
      const edgeId = getNeo4jId(rel.id) || `${rel.startNode}-${rel.endNode}`;
      const sourceId = getNeo4jId(rel.startNode);
      const targetId = getNeo4jId(rel.endNode);

      // Only add edge if both nodes exist
      if (nodeIds.has(sourceId) && nodeIds.has(targetId)) {
        edges.push(createCytoscapeEdge(rel, edgeId, sourceId, targetId));
      }
    });
  });

  // Handle starting entity if provided separately
  if (startingEntity && !nodeIds.has(getNeo4jId(startingEntity.id))) {
    nodes.push(createCytoscapeNode(startingEntity, 0)); // Degree will be calculated if edges exist
  }

  return [...nodes, ...edges];
};

/**
 * Create a Cytoscape node from Neo4j node data
 * @param {Object} node - Neo4j node data
 * @param {Number} degree - Connection count for sizing
 * @returns {Object} Cytoscape node
 */
const createCytoscapeNode = (node, degree = 0) => {
  const nodeId = getNeo4jId(node.id);
  const nodeType = getEntityType(node);
  const config = getEntityTypeConfig(nodeType);
  const displayValue = getEntityDisplayValue(node);

  // Calculate size using the formula: size = clamp(18, 14 + sqrt(degree) * 3, 46)
  const baseSize = 14 + Math.sqrt(Math.max(0, degree)) * 3;
  const size = Math.min(Math.max(baseSize, 18), 46);

  return {
    data: {
      id: nodeId,
      label: displayValue || 'Unknown',
      type: nodeType,
      degree: degree,
      ...node.properties
    }
  };
};

/**
 * Create a Cytoscape edge from Neo4j relationship data
 * @param {Object} rel - Neo4j relationship data
 * @param {String} edgeId - Unique ID for the edge
 * @param {String} sourceId - Source node ID
 * @param {String} targetId - Target node ID
 * @returns {Object} Cytoscape edge
 */
const createCytoscapeEdge = (rel, edgeId, sourceId, targetId) => {
  const relType = rel.type || 'RELATED_TO';
  const category = getRelationshipCategory(relType);

  return {
    data: {
      id: edgeId,
      source: sourceId,
      target: targetId,
      label: relType,
      type: relType,
      category: category,
      ...rel.properties
    }
  };
};

/**
 * Get node style based on entity type, properties, and degree
 * @param {String} nodeType - Entity type
 * @param {Object} nodeProperties - Node properties
 * @param {Number} degree - Connection count for sizing
 * @returns {Object} Cytoscape style object
 */
export const getNodeStyle = (nodeType, nodeProperties, degree = 0) => {
  const config = getEntityTypeConfig(nodeType);

  // Calculate size using the formula: size = clamp(18, 14 + sqrt(degree) * 3, 46)
  const baseSize = 14 + Math.sqrt(Math.max(0, degree)) * 3;
  const size = Math.min(Math.max(baseSize, 18), 46);

  // Base node style
  const style = {
    'background-color': config.color,
    'label': 'data(label)',
    'text-valign': 'center',
    'color': '#fff',
    'text-outline-width': 1,
    'text-outline-color': config.color,
    'font-size': 10,
    'width': size,
    'height': size,
    'min-width': 18,
    'min-height': 18
  };

  // Special styling for verified/connections
  if (nodeProperties.verified) {
    style.borderWidth = 2;
    style.borderColor = 'var(--color-verified)';
    style.borderStyle = 'solid';
  }

  // Special styling for anomalies
  if (nodeProperties.anomaly) {
    style.borderWidth = 2;
    style.borderColor = 'var(--color-anomaly)';
    style.borderStyle = 'dashed';
  }

  // Highlight nodes with high degree (potential anomalies)
  if (degree > 10) {
    style['background-opacity'] = 0.9;
  }

  return style;
};

/**
 * Get edge style based on relationship type and properties
 * @param {String} relType - Relationship type
 * @param {Object} relProperties - Relationship properties
 * @returns {Object} Cytoscape style object
 */
export const getEdgeStyle = (relType, relProperties) => {
  const category = getRelationshipCategory(relType);

  // Base edge style
  const style = {
    'width': 2,
    'line-color': '#ccc',
    'target-arrow-color': '#ccc',
    'target-arrow-shape': 'triangle',
    'curve-style': 'bezier',
    'line-style': 'solid',
    'opacity': 0.7
  };

  // Adjust based on category
  switch (category) {
    case 'financial':
      style['line-color'] = 'var(--color-accent)';
      style['target-arrow-color'] = 'var(--color-accent)';
      style['width'] = 2.5;
      break;
    case 'communication':
      style['line-color'] = 'var(--color-informational)';
      style['target-arrow-color'] = 'var(--color-informational)';
      style['width'] = 2;
      style['line-style'] = 'dashed';
      break;
    case 'physical':
      style['line-color'] = 'var(--color-verified)';
      style['target-arrow-color'] = 'var(--color-verified)';
      style['width'] = 2;
      break;
    case 'transportation':
      style['line-color'] = '#9B59B6'; // Purple
      style['target-arrow-color'] = '#9B59B6';
      style['width'] = 2;
      style['line-style'] = 'dotted';
      break;
    case 'criminal':
      style['line-color'] = 'var(--color-anomaly)';
      style['target-arrow-color'] = 'var(--color-anomaly)';
      style['width'] = 2.5;
      break;
    case 'location':
      style['line-color'] = 'var(--color-location)';
      style['target-arrow-color'] = 'var(--color-location)';
      style['width'] = 2;
      break;
    case 'provenance':
      style['line-color'] = 'var(--color-document)';
      style['target-arrow-color'] = 'var(--color-document)';
      style['width'] = 1.5;
      style['line-style'] = 'dashed';
      style['opacity'] = 0.5;
      break;
    case 'case':
      style['line-color'] = 'var(--color-case)';
      style['target-arrow-color'] = 'var(--color-case)';
      style['width'] = 2;
      break;
    default:
      style['line-color'] = '#ccc';
      style['target-arrow-color'] = '#ccc';
  }

  // Adjust width based on confidence or count if available
  if (relProperties.confidence !== undefined) {
    // Scale confidence (0-1) to width multiplier (1-3)
    const widthMultiplier = 1 + (relProperties.confidence * 2);
    style.width = parseFloat(style.width) * widthMultiplier;
  }

  if (relProperties.count !== undefined) {
    // Scale count logarithmically for width
    const countFactor = Math.min(Math.log(relProperties.count + 1) / Math.log(10), 2);
    style.width = parseFloat(style.width) * (1 + countFactor * 0.5);
  }

  return style;
};

/**
 * Get default stylesheet for Cytoscape
 * @returns {Array} Cytoscape stylesheet
 */
export const getDefaultStylesheet = () => [
  {
    selector: 'node',
    style: {
      'background-color': '#6FB1FC',
      'label': 'data(label)',
      'text-valign': 'center',
      'color': '#fff',
      'text-outline-width': 1,
      'text-outline-color': '#6FB1FC',
      'font-size': 10,
      'min-width': 18,
      'min-height': 18
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
      'source-arrow-color': '#0000FF',
      'border-width': 3,
      'border-color': '#FFFF00'
    }
  },
  {
    selector: 'node[type="PERSON"]',
    style: {
      'background-color': 'var(--color-person)'
    }
  },
  {
    selector: 'node[type="PHONE"]',
    style: {
      'background-color': 'var(--color-phone)'
    }
  },
  {
    selector: 'node[type="VEHICLE"]',
    style: {
      'background-color': 'var(--color-vehicle)'
    }
  },
  {
    selector: 'node[type="ACCOUNT"]',
    style: {
      'background-color': 'var(--color-account)'
    }
  },
  {
    selector: 'node[type="ORGANIZATION"]',
    style: {
      'background-color': 'var(--color-organization)'
    }
  },
  {
    selector: 'node[type="LOCATION"]',
    style: {
      'background-color': 'var(--color-location)'
    }
  },
  {
    selector: 'node[type="CASE"]',
    style: {
      'background-color': 'var(--color-case)'
    }
  },
  {
    selector: 'node[type="DOCUMENT"]',
    style: {
      'background-color': 'var(--color-document)'
    }
  },
  {
    selector: 'edge[category="financial"]',
    style: {
      'line-color': 'var(--color-accent)',
      'target-arrow-color': 'var(--color-accent)',
      'width': 2.5
    }
  },
  {
    selector: 'edge[category="communication"]',
    style: {
      'line-color': 'var(--color-informational)',
      'target-arrow-color': 'var(--color-informational)',
      'width': 2,
      'line-style': 'dashed'
    }
  },
  {
    selector: 'edge[category="physical"]',
    style: {
      'line-color': 'var(--color-verified)',
      'target-arrow-color': 'var(--color-verified)',
      'width': 2
    }
  },
  {
    selector: 'edge[category="transportation"]',
    style: {
      'line-color': '#9B59B6',
      'target-arrow-color': '#9B59B6',
      'width': 2,
      'line-style': 'dotted'
    }
  },
  {
    selector: 'edge[category="criminal"]',
    style: {
      'line-color': 'var(--color-anomaly)',
      'target-arrow-color': 'var(--color-anomaly)',
      'width': 2.5
    }
  },
  {
    selector: 'edge[category="location"]',
    style: {
      'line-color': 'var(--color-location)',
      'target-arrow-color': 'var(--color-location)',
      'width': 2
    }
  },
  {
    selector: 'edge[category="provenance"]',
    style: {
      'line-color': 'var(--color-document)',
      'target-arrow-color': 'var(--color-document)',
      'width': 1.5,
      'line-style': 'dashed',
      'opacity': 0.5
    }
  },
  {
    selector: 'edge[category="case"]',
    style: {
      'line-color': 'var(--color-case)',
      'target-arrow-color': 'var(--color-case)',
      'width': 2
    }
  }
];

/**
 * Calculate layout options for different algorithms
 * @param {String} layoutName - Name of the layout algorithm
 * @returns {Object} Layout options for Cytoscape
 */
export const getLayoutOptions = (layoutName) => {
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
        name: 'breadthfirst',
        directed: true
      };
  }
};

export default {
  neo4jToCytoscape,
  getNodeStyle,
  getEdgeStyle,
  getDefaultStylesheet,
  getLayoutOptions
};