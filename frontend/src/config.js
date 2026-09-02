// Configuration for the frontend application
export const config = {
  // API endpoints
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:8000',

  // Application settings
  appName: 'Criminal Network Investigation Workstation',
  version: '1.0.0',

  // Feature flags
  features: {
    enableNotes: true,
    enableBookmarks: true,
    enablePathAnalysis: true,
    enableTemporalAnalysis: false, // Future feature
    enableGeospatial: false // Future feature
  },

  // UI settings
  ui: {
    defaultLayout: 'breadthfirst',
    autoRefreshInterval: 30000, // 30 seconds
    maxEntitiesInList: 1000,
    maxRelationshipsInView: 5000
  },

  // Cytoscape settings
  cytoscape: {
    defaultZoom: 1,
    minZoom: 0.3,
    maxZoom: 3,
    zoomStep: 0.2
  }
};

export default config;