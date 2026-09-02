import React from 'react';
import { getElementCounts } from '../../utils/graphHelpers';
import { getEntityDisplayName, getEntityType, getEntityTypeDisplay } from '../../utils/normalize';

export default function BottomStrip({ graphElements, selectedEntity, pathData, focusMode }) {
  const counts = getElementCounts(graphElements || []);

  return (
    <div style={{
      height: 32, display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 16, flexShrink: 0,
      background: 'var(--color-panel)',
      borderTop: '1px solid var(--color-border)',
      fontSize: 11, color: 'var(--color-text-muted)',
      fontFamily: 'var(--font-mono)',
    }}>
      {/* Graph stats */}
      <span>
        Nodes: {counts.nodes}
        <span style={{ margin: '0 6px', opacity: 0.3 }}>|</span>
        Edges: {counts.edges}
      </span>

      <div style={{ width: 1, height: 14, background: 'var(--color-border)' }} />

      {/* Selected entity */}
      {selectedEntity ? (
        <span style={{ color: 'var(--color-text-secondary)' }}>
          <span style={{ color: 'var(--color-accent)' }}>
            {getEntityDisplayName(selectedEntity)}
          </span>
          <span style={{ margin: '0 4px' }}>&middot;</span>
          {getEntityTypeDisplay(getEntityType(selectedEntity))}
        </span>
      ) : (
        <span>No selection</span>
      )}

      <div style={{ flex: 1 }} />

      {/* Path info */}
      {pathData && pathData.path && (
        <span style={{ color: 'var(--color-info)' }}>
          Path: {pathData.path.hops} hop{pathData.path.hops !== 1 ? 's' : ''}
        </span>
      )}

      {/* Focus mode */}
      {focusMode && (
        <span style={{
          color: 'var(--color-accent)',
          padding: '1px 6px',
          border: '1px solid var(--color-accent)',
          borderRadius: 2, fontSize: 9,
        }}>
          FOCUS
        </span>
      )}
    </div>
  );
}
