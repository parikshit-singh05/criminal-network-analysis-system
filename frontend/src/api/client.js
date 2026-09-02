import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);
    const message = error.response?.data?.detail || error.message || 'Network error';
    const enhanced = new Error(message);
    enhanced.status = error.response?.status;
    enhanced.originalError = error;
    return Promise.reject(enhanced);
  }
);

function enc(id) {
  return encodeURIComponent(id);
}

// === Health ===
export const checkHealth = () => client.get('/health').then(r => r.data);
export const checkNeo4jHealth = () => client.get('/health/neo4j').then(r => r.data);

// === Entities ===
export const getEntities = (params = {}) =>
  client.get('/entities/', { params }).then(r => r.data);

export const getEntity = (entityId) =>
  client.get(`/entities/${enc(entityId)}`).then(r => r.data);

export const searchEntities = (params = {}) =>
  client.get('/entities/search/', { params }).then(r => r.data);

// === Graph ===
export const getGraphStats = () =>
  client.get('/graph/stats').then(r => r.data);

export const getWholeGraph = (params = {}) =>
  client.get('/graph/whole', { params }).then(r => r.data);

export const traverseGraph = (entityId, params = {}) =>
  client.get(`/graph/traverse/${enc(entityId)}`, { params }).then(r => r.data);

export const findPath = (fromId, toId, params = {}) =>
  client.get(`/graph/path/${enc(fromId)}/${enc(toId)}`, { params }).then(r => r.data);

export const getNeighbors = (entityId, params = {}) =>
  client.get(`/graph/neighbors/${enc(entityId)}`, { params }).then(r => r.data);

// === Analytics ===
export const getDegreeCentrality = (params = {}) =>
  client.get('/analytics/degree-centrality', { params }).then(r => r.data);

export const getConnectedComponents = (params = {}) =>
  client.get('/analytics/connected-components', { params }).then(r => r.data);

export const getClusteringCoefficient = (entityId) =>
  client.get(`/analytics/clustering-coefficient/${enc(entityId)}`).then(r => r.data);

// === Anomalies ===
export const getHighDegreeEntities = (params = {}) =>
  client.get('/anomalies/high-degree-entities', { params }).then(r => r.data);

export const getIsolatedEntities = (params = {}) =>
  client.get('/anomalies/isolated-entities', { params }).then(r => r.data);

export const getMutualExclusivity = (params = {}) =>
  client.get('/anomalies/mutual-exclusivity', { params }).then(r => r.data);

// === Evidence ===
export const getDocuments = (params = {}) =>
  client.get('/evidence/documents', { params }).then(r => r.data);

export const getDocument = (documentId) =>
  client.get(`/evidence/documents/${enc(documentId)}`).then(r => r.data);

export const getDocumentEntities = (documentId, params = {}) =>
  client.get(`/evidence/documents/${enc(documentId)}/entities`, { params }).then(r => r.data);

export const getEntityProvenance = (entityId) =>
  client.get(`/evidence/entity-provenance/${enc(entityId)}`).then(r => r.data);

const api = {
  checkHealth, checkNeo4jHealth,
  getEntities, getEntity, searchEntities,
  getGraphStats, getWholeGraph, traverseGraph, findPath, getNeighbors,
  getDegreeCentrality, getConnectedComponents, getClusteringCoefficient,
  getHighDegreeEntities, getIsolatedEntities, getMutualExclusivity,
  getDocuments, getDocument, getDocumentEntities, getEntityProvenance,
};

export default api;
