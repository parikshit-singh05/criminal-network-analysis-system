import React from 'react';
import styles from '../../styles/components.css';

const GraphToolbar = ({
  onLayoutChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToView,
  layoutName,
  zoomLevel
}) => {
  const layoutOptions = [
    { value: 'breadthfirst', label: 'Breadth First' },
    { value: 'circle', label: 'Circle' },
    { value: 'concentric', label: 'Concentric' },
    { value: 'cose', label: 'COSE (Force-directed)' },
    { value: 'grid', label: 'Grid' },
    { value: 'preset', label: 'Preset' }
  ];

  return (
    <div className={`${styles['graph-toolbar']} flex items-center bg-panel border-b`}>
      <div className="flex-1 flex items-center space-x-4">
        <span className="text-xs text-secondary">Layout:</span>
        <select
          value={layoutName}
          onChange={onLayoutChange}
          className="bg-elevated border border-border rounded-md text-primary placeholder-secondary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 px-3 py-1"
        >
          {layoutOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onZoomIn}
          className="p-2 bg-elevated hover:bg-accent/20 rounded-md text-secondary"
          title="Zoom In"
        >
          +</button>
        <button
          onClick={onZoomOut}
          className="p-2 bg-elevated hover:bg-accent/20 rounded-md text-secondary"
          title="Zoom Out"
        >
          −</button>
        <button
          onClick={onResetZoom}
          className="p-2 bg-elevated hover:bg-accent/20 rounded-md text-secondary"
          title="Reset Zoom"
        >
          1:1</button>
        <button
          onClick={onFitToView}
          className="p-2 bg-elevated hover:bg-accent/20 rounded-md text-secondary"
          title="Fit to View"
        >
          ⤢</button>
        <span className="text-xs text-secondary">
          Zoom: {(zoomLevel * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

export default GraphToolbar;