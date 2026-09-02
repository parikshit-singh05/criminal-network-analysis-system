import { getEntityDisplayName, getEntityType, getEntityColor } from './normalize';

export function convertWholeGraphElements(elements) {
  if (!Array.isArray(elements)) return [];
  return elements;
}

export function convertTraversalToElements(data) {
  if (!data || !data.paths || data.paths.length === 0) {
    if (data && data.starting_entity) {
      const se = data.starting_entity;
      const type = getEntityType(se);
      return [{
        data: {
          id: se.id,
          label: getEntityDisplayName(se),
          type,
          ...se.properties,
        }
      }];
    }
    return [];
  }

  const nodeMap = new Map();
  const edgeMap = new Map();

  for (const path of data.paths) {
    if (path.nodes) {
      for (const node of path.nodes) {
        if (!nodeMap.has(node.id)) {
          const type = (node.labels || [])[0] || 'Unknown';
          nodeMap.set(node.id, {
            data: {
              id: node.id,
              label: getNodeLabel(node),
              type,
              ...node.properties,
            }
          });
        }
      }
    }
    if (path.relationships) {
      for (const rel of path.relationships) {
        if (!edgeMap.has(rel.id)) {
          edgeMap.set(rel.id, {
            data: {
              id: rel.id,
              source: rel.startNode,
              target: rel.endNode,
              label: rel.type,
              ...rel.properties,
            }
          });
        }
      }
    }
  }

  return [...nodeMap.values(), ...edgeMap.values()];
}

export function convertPathToElements(data) {
  if (!data || !data.path) return [];
  const elements = [];
  const path = data.path;

  if (path.nodes) {
    for (const node of path.nodes) {
      const type = (node.labels || [])[0] || 'Unknown';
      elements.push({
        data: {
          id: node.id,
          label: getNodeLabel(node),
          type,
          ...node.properties,
        }
      });
    }
  }

  if (path.relationships) {
    for (const rel of path.relationships) {
      elements.push({
        data: {
          id: rel.id,
          source: rel.startNode,
          target: rel.endNode,
          label: rel.type,
          ...rel.properties,
        }
      });
    }
  }

  return elements;
}

export function convertNeighborsToElements(centerEntity, neighborsData) {
  if (!neighborsData || !neighborsData.neighbors) return [];
  const elements = [];
  const centerType = getEntityType(centerEntity);

  elements.push({
    data: {
      id: centerEntity.id,
      label: getEntityDisplayName(centerEntity),
      type: centerType,
      ...(centerEntity.properties || {}),
    }
  });

  for (const neighbor of neighborsData.neighbors) {
    const nType = getEntityType(neighbor);
    elements.push({
      data: {
        id: neighbor.id,
        label: getEntityDisplayName(neighbor),
        type: nType,
        ...neighbor.properties,
      }
    });
    const edgeId = `edge-${centerEntity.id}-${neighbor.id}-${neighbor.relationship_type}`;
    elements.push({
      data: {
        id: edgeId,
        source: centerEntity.id,
        target: neighbor.id,
        label: neighbor.relationship_type,
      }
    });
  }

  return elements;
}

export function mergeElements(existing, incoming) {
  const map = new Map();
  for (const el of existing) {
    map.set(el.data.id, el);
  }
  for (const el of incoming) {
    map.set(el.data.id, el);
  }
  return [...map.values()];
}

export function getPathNodeIds(pathData) {
  if (!pathData || !pathData.path || !pathData.path.nodes) return [];
  return pathData.path.nodes.map(n => n.id);
}

export function getPathEdgeIds(pathData) {
  if (!pathData || !pathData.path || !pathData.path.relationships) return [];
  return pathData.path.relationships.map(r => r.id);
}

function getNodeLabel(node) {
  const p = node.properties || {};
  return p.person_name || p.phone_number || p.registration_number ||
    p.account_number || p.name || p.document_id || p.email_address || 'Unknown';
}

export function getElementCounts(elements) {
  let nodes = 0, edges = 0;
  for (const el of elements) {
    if (el.data.source && el.data.target) edges++;
    else nodes++;
  }
  return { nodes, edges };
}
