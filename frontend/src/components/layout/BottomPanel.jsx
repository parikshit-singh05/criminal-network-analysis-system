import React, { useState } from 'react';
import { apiService } from '../../utils/api';
import { getEntityDisplayValue, getNeo4jId } from '../../utils/normalization';
import styles from '../../styles/components.css';

const BottomPanel = () => {
  const [pathData, setPathData] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);
  const [pathError, setPathError] = useState(null);
  const [fromEntityId, setFromEntityId] = useState('');
  const [toEntityId, setToEntityId] = useState('');
  const [timelineData, setTimelineData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  // In a real implementation, these would come from state management
  // For now, we'll use defaults or empty state

  const handleTraceConnection = async () => {
    if (!fromEntityId || !toEntityId) {
      setPathError('Please enter both entity IDs');
      return;
    }

    setPathLoading(true);
    setPathError(null);
    try {
      const response = await apiService.get(`/graph/path/${fromEntityId}/${toEntityId}/`);
      setPathData(response.path);
    } catch (err) {
      setPathError(err.message || 'Failed to find path');
      setPathData(null);
    } finally {
      setPathLoading(false);
    }
  };

  const handleClearPath = () => {
    setPathData(null);
    setPathError(null);
    setFromEntityId('');
    setToEntityId('');
  };

  // Load timeline and activity data (mock data for now)
  useEffect(() => {
    // In a real implementation, this would fetch actual timeline data
    setTimelineData([
      { time: '10:30', event: 'Entity selected', details: 'Rajesh Kumar' },
      { time: '10:29', event: 'Path traced', details: 'Rajesh Kumar → Vikram Singh' },
      { time: '10:25', event: 'Note added', details: 'Suspected hawala operator' }
    ]);

    setActivityData([
      { type: 'search', query: 'hawala', time: '10:30' },
      { type: 'filter', filter: 'PHONE', time: '10:28' },
      { type: 'select', entity: 'Rajesh Kumar', time: '10:25' }
    ]);
  }, []);

  return (
    <header className={`${styles['bottom-panel']} flex items-center bg-panel border-t`}>
      <div className="flex-1 space-x-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono">Entities:</span>
          <span className="text-primary">1,247</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">Relationships:</span>
          <span className="text-primary">8,932</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">Mode:</span>
          <span className="text-accent">Investigate</span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-mono">Filter:</span>
          <span className="text-secondary">Active Cases Only</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">Zoom:</span>
          <span className="text-primary">100%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">Layout:</span>
          <span className="text-secondary">Cose (Force-directed)</span>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-6 text-sm">
        {/* Trace Connection Section */}
        <div className="relative">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono">Trace Connection:</span>
              <button
                onClick={handleClearPath}
                className="p-1 bg-elevated hover:bg-accent/20 rounded-md text-xs"
                title="Clear path"
              >
                ✕
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="From Entity ID"
                value={fromEntityId}
                onChange={(e) => setFromEntityId(e.target.value)}
                className="w-24 pl-2 pr-1 py-0.5 bg-elevated border border-border rounded-md text-xs font-mono placeholder-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <span className="text-xs text-secondary">→</span>
              <input
                type="text"
                placeholder="To Entity ID"
                value={toEntityId}
                onChange={(e) => setToEntityId(e.target.value)}
                className="w-24 pl-2 pr-1 py-0.5 bg-elevated border border-border rounded-md text-xs font-mono placeholder-secondary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
              <button
                onClick={handleTraceConnection}
                disabled={pathLoading}
                className="ml-2 px-3 py-0.5 bg-elevated hover:bg-accent/20 rounded-md text-xs font-mono"
              >
                {pathLoading ? 'Tracing...' : 'Trace'}
              </button>
            </div>
          </div>

          {/* Path Results */}
          {pathError && (
            <div className="absolute left-0 right-0 bottom-full mb-1 bg-anomaly/90 text-anomaly text-xs rounded-md p-1 z-10">
              {pathError}
            </div>
          )}
          {pathData && !pathLoading && (
            <div className="absolute left-0 right-0 bottom-full mb-1 bg-base/90 text-primary text-xs rounded-md p-1 z-10 max-w-xs">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-medium">Path Found:</span>
                <span className="text-xs">{pathData.hops} hops</span>
              </div>
              <div className="text-xs">
                {pathData.entities?.map((entityId, index) => {
                  const separator = index < pathData.entities.length - 1 ? ' → ' : '';
                  return `${getEntityDisplayValue({ id: entityId })}${separator}`;
                }).join('')}
              </div>
            </div>
          )}
        </div>

        {/* Timeline Section */}
        <div className="flex-1 flex items-center gap-4 border-l pl-4">
          <div className="relative">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono">Timeline:</span>
            </div>
            <div className="h-4 w-1 bg-border/50 mx-2"></div>
            <div className="flex-1 overflow-x-auto space-x-2">
              {timelineData.map((item, index) => (
                <div key={index} className="flex-shrink-0 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-accent/20 text-accent font-mono">
                    ⏰
                  </span>
                  <div className="text-xs">
                    <div className="text-xs font-medium">{item.time}</div>
                    <div className="text-xs text-secondary">{item.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="flex-1 flex items-center gap-4 border-l pl-4">
          <div className="relative">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono">Activity:</span>
            </div>
            <div className="h-4 w-1 bg-border/50 mx-2"></div>
            <div className="flex-1 overflow-x-auto space-x-2">
              {activityData.map((item, index) => (
                <div key={index} className="flex-shrink-0 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-accent/20 text-accent font-mono">
                    📝
                  </span>
                  <div className="text-xs">
                    <div className="text-xs font-mono">{item.type}</span>
                    <div className="text-xs">{item.query || item.filter || item.entity || ''}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-3 py-1 bg-elevated hover:bg-accent/20 rounded-md text-sm"
          >
            <span>📎</span>
            <span>Attachments</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 bg-elevated hover:bg-accent/20 rounded-md text-sm"
          >
            <span>📝</span>
            <span>Notes</span
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 bg-elevated hover:bg-accent/20 rounded-md text-sm"
          >
            <span>🔖</span>
            <span>Bookmarks</span>
          </button>
          <button
            className="flex items-center gap-2 px-3 py-1 bg-elevated hover:bg-accent/20 rounded-md text-sm"
          >
            <span>▶️</span>
            <span>Playback</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default BottomPanel;