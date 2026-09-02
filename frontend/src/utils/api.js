// API service for communicating with the backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString
      ? `${API_BASE_URL}${endpoint}?${queryString}`
      : `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API PUT error for ${endpoint}:`, error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API DELETE error for ${endpoint}:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
export const apiService = new ApiService();

// Convenience functions for common endpoints
export const api = {
  // Entities
  getEntities: (params) => apiService.get('/entities/', params),
  getEntity: (id) => apiService.get(`/entities/${id}/`),
  searchEntities: (query, params) => apiService.get('/entities/search/', { q: query, ...params }),

  // Graph
  traverseGraph: (entityId, params) => apiService.get(`/graph/traverse/${entityId}/`, params),
  findShortestPath: (fromId, toId, params) => apiService.get(`/graph/path/${fromId}/${toId}/`, params),
  getNeighbors: (entityId, params) => apiService.get(`/graph/neighbors/${entityId}/`, params),

  // Analytics
  getDegreeCentrality: (params) => apiService.get('/analytics/degree-centrality/', params),
  getClusteringCoefficient: (params) => apiService.get('/analytics/clustering-coefficient/', params),
  getConnectedComponents: (params) => apiService.get('/analytics/connected-components/', params),

  // Anomalies
  getHighDegreeEntities: (params) => apiService.get('/anomalies/high-degree-entities/', params),
  getIsolates: (params) => apiService.get('/anomalies/isolates/', params),
  getMutuallyExclusivePairs: (params) => apiService.get('/anomalies/mutually-exclusive-pairs/', params),

  // Evidence
  getEntityProvenance: (entityId) => apiService.get(`/evidence/entity-provenance/${entityId}/`),
  getDocumentEntities: (documentId) => apiService.get(`/evidence/document-entities/${documentId}/`),

  // Health
  checkHealth: () => apiService.get('/health/')
};

export default apiService;