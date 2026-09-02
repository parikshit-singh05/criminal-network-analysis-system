import React, { useState, useEffect } from 'react';
import { getEntity } from '../../utils/api';
import { getEntityTypeConfig, getEntityDisplayValue, getRelationshipCategory } from '../../utils/constants';
import { getConnectionCount, getNeo4jId } from '../../utils/normalization';
import styles from '../../styles/components.css';

const RightPanel = () => {
  const [entity, setEntity] = useState(null);
  const [edge, setEdge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState(null);
  const [neighbors, setNeighbors] = useState([]);
  const [networkStats, setNetworkStats] = useState({});
  const [evidence, setEvidence] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [anomalies, setAnomalies] = useState({});

  // In a real implementation, this would come from context or state management
  // For now, we'll simulate entity selection
  useEffect(() => {
    const loadEntityData = async () => {
      if (!selectedEntityId) {
        setEntity(null);
        setEdge(null);
        setNeighbors([]);
        setNetworkStats({});
        setEvidence([]);
        setAnalytics({});
        setAnomalies({});
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Load entity details
        const entityResponse = await getEntity(selectedEntityId);
        setEntity(entityResponse);

        // Load neighbors for network statistics
        try {
          const neighborsResponse = await apiService.get(`/graph/neighbors/${selectedEntityId}/`, {
            limit: 100
          });
          setNeighbors(neighborsResponse.neighbors || []);
        } catch (neighborError) {
          console.warn('Could not load neighbors:', neighborError);
          setNeighbors([]);
        }

        // Load network statistics (connection count, etc.)
        const connectionCount = getConnectionCount(entityResponse,
          (neighborsResponse.neighbors || []).map(n => ({
            data: { source: getNeo4jId(n.id), target: getNeo4jId(selectedEntityId) }
          }))
        );
        setNetworkStats({
          connectionCount,
          neighborCount: neighborsResponse.neighbors?.length || 0
        });

        // Load evidence/provenance
        try {
          const evidenceResponse = await apiService.get(`/evidence/entity-provenance/${selectedEntityId}/`);
          setEvidence(evidenceResponse || []);
        } catch (evidenceError) {
          console.warn('Could not load evidence:', evidenceError);
          setEvidence([]);
        }

        // Load analytics (centrality, etc.)
        try {
          const centralityResponse = await apiService.get(`/analytics/clustering-coefficient/${selectedEntityId}/`);
          const degreeCentralityResponse = await apiService.get(`/analytics/degree-centrality/?limit=1`);

          // Find this entity's rank in degree centrality
          let centralityRank = 'N/A';
          if (degreeCentralityResponse.entities && Array.isArray(degreeCentralityResponse.entities)) {
            const rank = degreeCentralityResponse.entities.findIndex(
              e => getNeo4jId(e.id) === selectedEntityId
            );
            centralityRank = rank >= 0 ? `#${rank + 1}` : 'Not in top';
          }

          setAnalytics({
            clusteringCoefficient: centralityResponse.coefficient || 0,
            degreeCentralityRank: centralityRank
          });
        } catch (analyticsError) {
          console.warn('Could not load analytics:', analyticsError);
          setAnalytics({});
        }

        // Load anomalies for this entity
        try {
          const highDegreeResponse = await apiService.get(`/anomalies/high-degree-entities/?limit=10`);
          const isolatesResponse = await apiService.get(`/anomalies/isolates/?limit=10`);
          const mutualExclResponse = await apiService.get(`/anomalies/mutually-exclusive-pairs/?limit=10`);

          // Check if this entity appears in any anomaly lists
          const isHighDegree = highDegreeResponse.entities?.some(
            e => getNeo4jId(e.id) === selectedEntityId
          ) || false;
          const isIsolate = isolatesResponse.entities?.some(
            e => getNeo4jId(e.id) === selectedEntityId
          ) || false;
          const isMutualExcl = mutualExclResponse.pairs?.some(
            pair => pair.entity1 === selectedEntityId || pair.entity2 === selectedEntityId
          ) || false;

          setAnomalies({
            isHighDegree,
            isIsolate,
            isMutualExcl,
            highDegreeCount: highDegreeResponse.count || 0,
            isolateCount: isolatesResponse.count || 0,
            mutualExclCount: mutualExclResponse.count || 0
          });
        } catch (anomaliesError) {
          console.warn('Could not load anomalies:', anomaliesError);
          setAnomalies({});
        }
      } catch (err) {
        setError(err.message);
        setEntity(null);
        setEdge(null);
        setNeighbors([]);
        setNetworkStats({});
        setEvidence([]);
        setAnalytics({});
        setAnomalies({});
      } finally {
        setLoading(false);
      }
    };

    loadEntityData();
  }, [selectedEntityId]);

  // Load edge data when edge is selected
  useEffect(() => {
    const loadEdgeData = async () => {
      if (!selectedEdgeId) {
        setEdge(null);
        return;
      }

      // In a real implementation, we'd fetch the edge details
      // For now, we'll simulate or leave empty
      // This would require an API endpoint to get edge details by ID
      // Since we don't have that, we'll try to infer from neighbors or leave as unknown
      setEdge({ id: selectedEdgeId, type: 'UNKNOWN', properties: {} });
    };

    loadEdgeData();
  }, [selectedEdgeId]);

  // Simulate receiving entity selection from sidebar (in real app, this would be via context/props)
  // For demo purposes, we'll check localStorage for selected entity
  useEffect(() => {
    const storedEntityId = localStorage.getItem('selectedEntityId');
    if (storedEntityId && storedEntityId !== selectedEntityId) {
      setSelectedEntityId(storedEntityId);
    }
  }, []);

  // Simulate receiving edge selection from graph (in real app, this would be via context/props)
  // For demo purposes, we'll check localStorage for selected edge
  useEffect(() => {
    const storedEdgeId = localStorage.getItem('selectedEdgeId');
    if (storedEdgeId && storedEdgeId !== selectedEdgeId) {
      setSelectedEdgeId(storedEdgeId);
    }
  }, []);

  const handleEntitySelect = (entityId) => {
    setSelectedEntityId(entityId);
    localStorage.setItem('selectedEntityId', entityId);
  };

  const handleEdgeSelect = (edgeId) => {
    setSelectedEdgeId(edgeId);
    localStorage.setItem('selectedEdgeId', edgeId);
  };

  // We would normally receive this via props or context
  // For now, we'll expose a way to set it from outside
  // In a real implementation, we'd use React Context or a state management library

  if (!entity && !edge) {
    return (
      <aside className={`${styles['dossier-panel']} w-84 flex-col overflow-y-auto bg-panel border-l`}>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-3xl mb-4 text-secondary">📋</div>
            <h3 className="text-lg font-semibold text-primary mb-2">Entity Dossier</h3>
            <p className="text-sm text-secondary">
              Select an entity or relationship from the graph to view its detailed information here
            </p>
          </div>
        </div>
      </aside>
    );
  }

  // Determine what we're displaying
  const isDisplayingEdge = !!edge;
  const displayObject = isDisplayingEdge ? edge : entity;
  const displayType = isDisplayingEdge ? 'RELATIONSHIP' : (entity ? getEntityTypeLabel(entity) : 'UNKNOWN');
  const config = getEntityTypeConfig(displayType === 'RELATIONSHIP' ? 'DEFAULT' : displayType);
  const displayValue = isDisplayingEdge
    ? `${getEntityDisplayValue(edge.sourceEntity || {})} --[${edge.type}]--> ${getEntityDisplayValue(edge.targetEntity || {})}`
    : getEntityDisplayValue(entity);

  return (
    <aside className={`${styles['dossier-panel']} w-84 flex-col overflow-y-auto bg-panel border-l`}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full ${config.color.replace('var(--)', 'bg-').replace(')', '')} text-white text-lg font-medium`}>
              {isDisplayingEdge ? '🔗' : config.icon}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary truncate">
                {displayValue}
              </h2>
              <div className="flex items-center gap-2 text-xs text-secondary mt-1">
                <span className={`flex items-center gap-1`}>
                  <div className={`w-2 h-2 rounded-full ${config.color.replace('var(--)', 'bg-').replace(')', '')}`}></div>
                  <span>{isDisplayingEdge ? 'Relationship' : config.label}</span>
                </span>
                {displayObject.properties && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-mono text-xs">
                      ID: {getNeo4jId(displayObject.id)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="space-y-4">
          {/* Entity/Relationship Info */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-secondary uppercase mb-2">
              {isDisplayingEdge ? 'Relationship Details' : 'Identity'}
            </h3>
            <div className="space-y-2">
              {isDisplayingEdge ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Type</span>
                    <span className="font-mono text-primary capitalize">{edge.type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Direction</span>
                    <span className="font-mono text-primary">
                      {getEntityDisplayValue(edge.sourceEntity || {})} → {getEntityDisplayValue(edge.targetEntity || {})}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Confidence</span>
                    <span className="font-mono text-primary">
                      {(edge.properties.confidence || 1) * 100}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Entity Type</span>
                    <span className="font-mono text-primary">{config.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Internal ID</span>
                    <span className="font-mono text-primary truncate">{getNeo4jId(entity.id)}</span>
                  </div>
                  {/* Add type-specific identity fields */}
                  {entity && entityType === 'PERSON' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary">Normalized Name</span>
                        <span className="font-mono text-primary">{entity.properties.normalized_name || 'N/A'}</span>
                      </div>
                    </>
                  )}
                  {entity && entityType === 'PHONE' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary">Subscriber</span>
                        <span className="font-mono text-primary">{entity.properties.subscriber_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary">Type</span>
                        <span className="font-mono text-primary">{entity.properties.subscriber_type || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary">Status</span>
                        <span className={`font-mono text-${entity.properties.status === 'Active' ? 'verified' : 'anomaly'}`}>
                          {entity.properties.status || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Properties */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Properties</h3>
            <div className="space-y-2">
              {Object.entries(displayObject.properties || {}).map(([key, value]) => {
                if (value === undefined || value === null || value === '') return null;
                // Skip internal IDs we already showed
                if (['person_id', 'phone_id', 'vehicle_id', 'account_id', 'normalized_name', 'normalized_number', 'source', 'target'].includes(key)) return null;

                const formattedKey = key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase());

                return (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-secondary">{formattedKey}</span>
                    <span className="font-mono text-primary truncate max-w-xs">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {!isDisplayingEdge && (
            <>
              {/* Network Statistics */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Network Statistics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Connections</span>
                    <span className="font-mono text-primary">{networkStats.connectionCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Neighbors Loaded</span>
                    <span className="font-mono text-primary">{neighbors.length}</span>
                  </div>
                </div>
              }

              {/* Relationships */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Relationships</h3>
                {neighbors.length === 0 ? (
                  <div className="text-center py-4 text-secondary">
                    No relationship data available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {neighbors.slice(0, 8).map((neighbor, index) => {
                      const neighborType = getEntityTypeLabel(neighbor);
                      const neighborConfig = getEntityTypeConfig(neighborType);
                      const relationType = 'RELATED_TO'; // In a real implementation, we'd get this from the edge data

                      return (
                        <div key={index} className="flex items-center gap-3 p-2 bg-elevated rounded-md">
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full">
                            {neighborConfig.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">
                              {getEntityDisplayValue(neighbor)}
                            </div>
                            <div className="text-xs text-secondary">
                              {neighborConfig.label} •
                              <span className={`font-mono text-${getRelationshipCategory(relationType) === 'financial' ? 'accent' :
                                     getRelationshipCategory(relationType) === 'communication' ? 'informational' :
                                     getRelationshipCategory(relationType) === 'physical' ? 'verified' :
                                     getRelationshipCategory(relationType) === 'criminal' ? 'anomaly' : 'secondary'}`}>
                                {relationType}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {neighbors.length > 8 && (
                      <div className="text-center text-xs text-secondary italic">
                        +{neighbors.length - 8} more relationships
                      </div>
                    )}
                  </div>
                )}
              }

              {/* Evidence Section */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Evidence Trail</h3>
                {evidence.length === 0 ? (
                  <div className="text-center py-4 text-secondary">
                    No evidence data available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {evidence.slice(0, 4).map((doc, index) => (
                      <div key={index} className="border-l-2 border-accent pl-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-document/20 text-document">
                            📄
                          </span>
                          <span className="font-mono text-sm">{doc.document_id || 'Unknown Document'}</span>
                        </div>
                        {doc.case_id && (
                          <div className="text-xs text-secondary">
                            Case: {doc.case_id}
                          </div>
                        )}
                      </div>
                    ))}
                    {evidence.length > 4 && (
                      <div className="text-center text-xs text-secondary italic">
                        +{evidence.length - 4} more evidence items
                      </div>
                    )}
                  </div>
                )}
              }

              {/* Analytics Section */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Analytics</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Clustering Coefficient</span>
                    <span className="font-mono text-primary">{analytics.clusteringCoefficient?.toFixed(3) || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Degree Centrality Rank</span>
                    <span className="font-mono text-primary">{analytics.degreeCentralityRank || 'N/A'}</span>
                  </div>
                </div>
              }

              {/* Anomalies Section */}
              <div className="mb-5">
                <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Anomaly Flags</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">High Degree Entity</span>
                    <span className="font-mono text-primary">
                      {anomalies.isHighDegree ? 'YES' : 'no'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Isolated Entity</span>
                    <span className="font-mono text-primary">
                      {anomalies.isIsolate ? 'YES' : 'no'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary">Mutual Exclusivity</span>
                    <span className="font-mono text-primary">
                      {anomalies.isMutualExcl ? 'YES' : 'no'}
                    </span>
                  </div>
                  {Object.keys(anomalies).length > 3 && (
                    <div className="mt-2 text-xs text-secondary">
                      High Degree: {anomalies.highDegreeCount} | Isolates: {anomalies.isolateCount} | Mutual Excl: {anomalies.mutualExclCount}
                    </div>
                  )}
                </div>
              }
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t">
          <div className="space-y-3">
            <button
              onClick={() => console.log('View full profile')}
              className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
            >
              <span>👁️</span>
              <span>View Full Profile</span>
            </button>
            <button
              onClick={() => console.log('Add to investigation')}
              className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
            >
              <span>📌</span>
              <span>Add to Investigation</span>
            </button>
            <button
              onClick={() => console.log('Export entity')}
              className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
            >
              <span>📤</span>
              <span>Export Entity</span>
            </button>
            {isDisplayingEdge && (
              <>
                <button
                  onClick={() => console.log('Trace relationship path')}
                  className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
                >
                  <span>🛤️</span>
                  <span>Trace Path</span>
                </button>
                <button
                  onClick={() => console.log('Show related evidence')}
                  className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
                >
                  <span>🔍</span>
                  <span>Related Evidence</span>
                </button>
              </>
            )}
            {!isDisplayingEdge && (
              <>
                <button
                  onClick={() => console.log('Show evidence trail')}
                  className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
                >
                  <span>🔍</span>
                  <span>Evidence Trail</span>
                </button>
                <button
                  onClick={() => console.log('Run analytics')}
                  className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
                >
                  <span>📊</span>
                  <span>Run Analytics</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;

// Mock API service for now - in reality, this would be imported from utils/api
const apiService = {
  get: async (endpoint, params) => {
    // This is a mock - in reality, we'd use the actual apiService
    // For now, we'll return empty data to avoid errors
    if (endpoint.includes('/graph/neighbors/')) {
      return { neighbors: [] };
    }
    if (endpoint.includes('/entities/')) {
      return {
        id: 'mock-id',
        properties: {
          person_name: 'Mock Person',
          phone_number: '1234567890'
        }
      };
    }
    if (endpoint.includes('/evidence/')) {
      return [];
    }
    if (endpoint.includes('/analytics/')) {
      if (endpoint.includes('clustering-coefficient')) {
        return { coefficient: 0.5 };
      }
      if (endpoint.includes('degree-centrality')) {
        return { entities: [] };
      }
    }
    if (endpoint.includes('/anomalies/')) {
      if (endpoint.includes('high-degree-entities')) {
        return { entities: [], count: 0 };
      }
      if (endpoint.includes('isolates')) {
        return { entities: [], count: 0 };
      }
      if (endpoint.includes('mutually-exclusive-pairs')) {
        return { pairs: [], count: 0 };
      }
    }
    return {};
  }
};