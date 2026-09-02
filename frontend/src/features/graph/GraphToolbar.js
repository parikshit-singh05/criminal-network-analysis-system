import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, RotateCcw, Focus, LayoutGrid, Tag, Filter } from 'lucide-react';

const btnStyle = (active) => ({
  width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: active ? 'var(--color-accent-dim)' : 'transparent',
  border: active ? '1px solid var(--color-accent)' : '1px solid transparent',
  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
  color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
  transition: 'all var(--transition-fast)',
});

export default function GraphToolbar({ 
  onZoomIn, onZoomOut, onFit, onReset, 
  onToggleFocus, focusActive, 
  onToggleLabels, labelsActive,
  onToggleImportant, importantActive,
  onRerunLayout 
}) {
  return (
    <div style={{
      position: 'absolute', top: 12, right: 12, zIndex: 10,
      display: 'flex', flexDirection: 'column', gap: 2,
      background: 'rgba(22,26,32,0.92)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: 3,
    }}>
      <button style={btnStyle(false)} onClick={onZoomIn} title="Zoom In">
        <ZoomIn size={15} />
      </button>
      <button style={btnStyle(false)} onClick={onZoomOut} title="Zoom Out">
        <ZoomOut size={15} />
      </button>
      <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 4px' }} />
      <button style={btnStyle(false)} onClick={onFit} title="Fit Graph">
        <Maximize2 size={15} />
      </button>
      <button style={btnStyle(false)} onClick={onReset} title="Reset View">
        <RotateCcw size={15} />
      </button>
      <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 4px' }} />
      <button style={btnStyle(labelsActive)} onClick={onToggleLabels} title="Toggle Relationship Labels">
        <Tag size={15} />
      </button>
      <button style={btnStyle(importantActive)} onClick={onToggleImportant} title="Important Connections Mode">
        <Filter size={15} />
      </button>
      <button style={btnStyle(focusActive)} onClick={onToggleFocus} title="Investigation Focus">
        <Focus size={15} />
      </button>
      <div style={{ height: 1, background: 'var(--color-border)', margin: '2px 4px' }} />
      <button style={btnStyle(false)} onClick={onRerunLayout} title="Rerun Layout">
        <LayoutGrid size={15} />
      </button>
    </div>
  );
}
