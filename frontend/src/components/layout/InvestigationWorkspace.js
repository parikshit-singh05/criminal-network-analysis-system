import React, { useState, useEffect, useCallback, useRef } from 'react';
import TopBar from '../../components/layout/TopBar';
import BottomStrip from '../../components/layout/BottomStrip';
import EntityExplorer from '../../features/explorer/EntityExplorer';
import NetworkGraph from '../../features/graph/NetworkGraph';
import GraphToolbar from '../../features/graph/GraphToolbar';
import RelationshipInspector from '../../features/graph/RelationshipInspector';
import GraphLegend from '../../features/graph/GraphLegend';
import NetworkInsights from '../../features/graph/NetworkInsights';
import InvestigationDossier from '../../features/dossier/InvestigationDossier';
import ConnectionStory from '../../features/investigation/ConnectionStory';
import LandingOverlay from '../../features/investigation/LandingOverlay';
import api from '../../api/client';
import { convertNeighborsToElements, convertPathToElements, mergeElements, getPathNodeIds, getPathEdgeIds } from '../../utils/graphHelpers';
import { getEntityDisplayName } from '../../utils/normalize';

export default function InvestigationWorkspace() {
  const graphRef = useRef(null);

  // Core state
  const [graphElements, setGraphElements] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Panel state
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // Investigation state
  const [focusMode, setFocusMode] = useState(false);
  const [importantMode, setImportantMode] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [pathData, setPathData] = useState(null);
  const [pathHighlight, setPathHighlight] = useState(null);
  const [connectionStory, setConnectionStory] = useState(null);

  // API state
  const [apiStatus, setApiStatus] = useState('unknown');
  const [graphLoading, setGraphLoading] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const [dbStats, setDbStats] = useState(null);

  // Check API health and stats
  useEffect(() => {
    const check = async () => {
      try {
        await api.checkHealth();
        setApiStatus('healthy');
        
        try {
          const stats = await api.getGraphStats();
          setDbStats(stats);
        } catch (e) {
          console.error('Failed to fetch graph stats:', e);
        }
      } catch {
        setApiStatus('unhealthy');
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load initial graph
  const loadGraph = useCallback(async () => {
    setGraphLoading(true);
    try {
      const data = await api.getWholeGraph({ limit: 200, relationship_limit: 500 });
      
      const elements = data || [];
      const nodeIds = new Set();
      const validElements = [];
      
      // First pass: collect valid nodes
      for (const el of elements) {
        if (!el.data.source) {
          nodeIds.add(el.data.id);
          validElements.push(el);
        }
      }
      
      // Second pass: only add edges if both endpoints exist
      for (const el of elements) {
        if (el.data.source && el.data.target) {
          if (nodeIds.has(el.data.source) && nodeIds.has(el.data.target)) {
            validElements.push(el);
          } else {
            console.warn(`Filtered invalid edge ${el.data.id} missing source or target`);
          }
        }
      }
      
      setGraphElements(validElements);
      setShowLanding(false);
    } catch (err) {
      console.error('Failed to load graph:', err.message);
    } finally {
      setGraphLoading(false);
    }
  }, []);

  // Entity selection
  const handleEntitySelect = useCallback((entity) => {
    setSelectedEntity(entity);
    setSelectedEdge(null);
    setRightPanelOpen(true);
    setShowLanding(false);

    // If entity is in graph, center on it
    if (graphRef.current) {
      setTimeout(() => graphRef.current.centerOnNode(entity.id), 100);
    }
  }, []);

  // Node click from graph
  const handleNodeSelect = useCallback((nodeData) => {
    const entity = {
      id: nodeData.id,
      value: nodeData.label,
      types: [nodeData.type],
      properties: { ...nodeData },
    };
    // Clean graph-internal props
    delete entity.properties.id;
    delete entity.properties.label;
    delete entity.properties.type;
    setSelectedEntity(entity);
    setSelectedEdge(null);
    setRightPanelOpen(true);
  }, []);

  // Edge click
  const handleEdgeSelect = useCallback((edgeData) => {
    setSelectedEdge(edgeData);
  }, []);

  // Double click to expand
  const handleNodeDoubleClick = useCallback(async (nodeData) => {
    try {
      const data = await api.getNeighbors(nodeData.id, { limit: 20 });
      const entity = {
        id: nodeData.id,
        value: nodeData.label,
        types: [nodeData.type],
        properties: nodeData,
      };
      const newElements = convertNeighborsToElements(entity, data);
      setGraphElements(prev => mergeElements(prev, newElements));
    } catch (err) {
      console.error('Failed to expand:', err.message);
    }
  }, []);

  // Background click
  const handleBackgroundClick = useCallback(() => {
    setSelectedEdge(null);
    setSelectedEntity(null);
    setRightPanelOpen(false);
    if (focusMode) {
      setFocusMode(false);
    }
  }, [focusMode]);

  // Expand neighbors
  const handleExpandNeighbors = useCallback(async (entityId) => {
    try {
      const data = await api.getNeighbors(entityId, { limit: 30 });
      const entity = selectedEntity || { id: entityId, types: [], properties: {} };
      const newElements = convertNeighborsToElements(entity, data);
      setGraphElements(prev => mergeElements(prev, newElements));
    } catch (err) {
      console.error('Expand failed:', err.message);
    }
  }, [selectedEntity]);

  // Trace connection
  const handleTraceConnection = useCallback(async (fromId, toId, fromEntity, toEntity) => {
    try {
      const data = await api.findPath(fromId, toId);
      setPathData(data);

      // Add path elements to graph
      const pathElements = convertPathToElements(data);
      setGraphElements(prev => mergeElements(prev, pathElements));

      // Highlight path
      const nodeIds = getPathNodeIds(data);
      const edgeIds = getPathEdgeIds(data);
      setPathHighlight({ nodeIds, edgeIds });

      // Open connection story
      setConnectionStory({
        pathData: data,
        fromEntity: fromEntity,
        toEntity: toEntity,
      });
    } catch (err) {
      alert(`No path found: ${err.message}`);
    }
  }, []);

  // Clear path
  const handleClearPath = useCallback(() => {
    setPathData(null);
    setPathHighlight(null);
    setConnectionStory(null);
    if (graphRef.current) graphRef.current.resetView();
  }, []);

  // Focus mode
  const handleFocusMode = useCallback((enable) => {
    setFocusMode(enable);
  }, []);

  // Search
  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
  }, []);

  const handleSearchSubmit = useCallback((value) => {
    setSearchQuery(value);
    setLeftPanelOpen(true);
    setShowLanding(false);
  }, []);

  // Start investigation from landing
  const handleStartInvestigation = useCallback(() => {
    loadGraph();
  }, [loadGraph]);

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: 'var(--color-base)', overflow: 'hidden',
    }}>
      {/* Top Bar */}
      <TopBar
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        apiStatus={apiStatus}
      />

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left Panel - Entity Explorer */}
        <EntityExplorer
          searchQuery={searchQuery}
          onEntitySelect={handleEntitySelect}
          selectedEntityId={selectedEntity?.id}
          isOpen={leftPanelOpen}
          onToggle={() => setLeftPanelOpen(prev => !prev)}
          dbStats={dbStats}
        />

        {/* Center - Graph */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0, overflow: 'hidden' }}>
          {showLanding && graphElements.length === 0 ? (
            <LandingOverlay
              onExploreNetwork={handleStartInvestigation}
              onSearch={() => { setLeftPanelOpen(true); }}
              loading={graphLoading}
              apiStatus={apiStatus}
            />
          ) : (
            <>
              <NetworkInsights elements={graphElements} dbStats={dbStats} />
              <GraphLegend elements={graphElements} hideRelationships={!!selectedEntity} />
              <NetworkGraph
                ref={graphRef}
                elements={graphElements}
                selectedEntityId={selectedEntity?.id}
                pathHighlight={pathHighlight}
                focusMode={focusMode}
                importantMode={importantMode}
                showLabels={showLabels}
                onNodeSelect={handleNodeSelect}
                onEdgeSelect={handleEdgeSelect}
                onNodeDoubleClick={handleNodeDoubleClick}
                onBackgroundClick={handleBackgroundClick}
              />
              <GraphToolbar
                onZoomIn={() => graphRef.current?.zoomIn()}
                onZoomOut={() => graphRef.current?.zoomOut()}
                onFit={() => graphRef.current?.fitGraph()}
                onReset={() => {
                  graphRef.current?.resetView();
                  setFocusMode(false);
                  setImportantMode(false);
                  setShowLabels(false);
                  handleClearPath();
                }}
                onToggleFocus={() => setFocusMode(prev => !prev)}
                focusActive={focusMode}
                onToggleLabels={() => setShowLabels(prev => !prev)}
                labelsActive={showLabels}
                onToggleImportant={() => setImportantMode(prev => !prev)}
                importantActive={importantMode}
                onRerunLayout={() => graphRef.current?.runLayout()}
              />
              {/* Relationship Inspector */}
              {selectedEdge && (
                <RelationshipInspector
                  edge={selectedEdge}
                  graphElements={graphElements}
                  onClose={() => setSelectedEdge(null)}
                />
              )}
              {/* Connection Story */}
              {connectionStory && (
                <ConnectionStory
                  pathData={connectionStory.pathData}
                  fromEntity={connectionStory.fromEntity}
                  toEntity={connectionStory.toEntity}
                  onClose={() => setConnectionStory(null)}
                  onStepClick={(node) => {
                    if (graphRef.current) graphRef.current.centerOnNode(node.id);
                  }}
                  onClearPath={handleClearPath}
                />
              )}
            </>
          )}
        </div>

        {/* Right Panel - Investigation Dossier */}
        {rightPanelOpen && (
          <InvestigationDossier
            entity={selectedEntity}
            onClose={() => {
              setRightPanelOpen(false);
              setSelectedEntity(null);
            }}
            onExpandNeighbors={handleExpandNeighbors}
            onTraceConnection={handleTraceConnection}
            onFocusMode={handleFocusMode}
            onSelectEntity={handleEntitySelect}
            selectedEntityId={selectedEntity?.id}
            isOpen={rightPanelOpen}
            onToggle={() => setRightPanelOpen(prev => !prev)}
          />
        )}
      </div>

      {/* Bottom Strip */}
      <BottomStrip
        graphElements={graphElements}
        selectedEntity={selectedEntity}
        pathData={pathData}
        focusMode={focusMode}
      />
    </div>
  );
}
