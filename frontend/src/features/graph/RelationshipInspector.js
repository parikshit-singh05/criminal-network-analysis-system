import React from 'react';
import { X, ArrowRight } from 'lucide-react';
import { formatPropKey, formatPropValue } from '../../utils/normalize';

export default function RelationshipInspector({ edge, graphElements, onClose }) {
  if (!edge) return null;

  const sourceName = findNodeLabel(edge.source, graphElements);
  const targetName = findNodeLabel(edge.target, graphElements);

  const properties = Object.entries(edge).filter(
    ([k]) => !['id', 'source', 'target', 'label'].includes(k)
  );

  return (
    <div style={{
      position: 'absolute', bottom: 44, left: 16, zIndex: 50,
      width: 320, background: 'var(--color-panel)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', borderBottom: '1px solid var(--color-border)',
      }}>
        <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-secondary)' }}>
          Relationship
        </span>
        <button onClick={onClose} style={{ display: 'flex', padding: 2, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
          <X size={13} />
        </button>
      </div>

      <div style={{ padding: '10px 12px' }}>
        {/* Direction */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginBottom: 10,
        }}>
          <span style={{
            fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 500,
            maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {sourceName}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
            <div style={{ width: 16, height: 1, background: 'var(--color-accent)' }} />
            <ArrowRight size={11} color="var(--color-accent)" />
          </div>
          <span style={{
            fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 500,
            maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {targetName}
          </span>
        </div>

        {/* Type */}
        <div style={{
          display: 'inline-block', padding: '2px 8px', fontSize: 10,
          fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
          color: 'var(--color-accent)', background: 'var(--color-accent-dim)',
          borderRadius: 2, marginBottom: 10, fontFamily: 'var(--font-mono)',
        }}>
          {edge.label}
        </div>

        {/* Properties */}
        {properties.length > 0 ? (
          properties.map(([k, v]) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', gap: 8,
              padding: '3px 0', fontSize: 11,
              borderBottom: '1px solid var(--color-border)',
            }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>{formatPropKey(k)}</span>
              <span style={{
                color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {formatPropValue(k, v)}
              </span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>No additional properties</div>
        )}
      </div>
    </div>
  );
}

function findNodeLabel(nodeId, elements) {
  if (!elements) return nodeId;
  const node = elements.find(e => e.data.id === nodeId && !e.data.source);
  return node?.data?.label || nodeId;
}
