import React, { useMemo } from 'react';
import { CircleDot, Eye, Tag } from 'lucide-react';
import { getEntityColor, getRelColor } from '../../utils/normalize';

const TYPES = ['Person', 'Phone', 'Vehicle', 'BankAccount', 'Organization', 'Location', 'Document'];

export default function GraphLegend({ elements = [], hideRelationships = false }) {
  const relTypes = useMemo(() => {
    const types = new Set();
    for (const el of elements) {
      if (el.data.source && el.data.label) {
        types.add(el.data.label);
      }
    }
    return Array.from(types).sort();
  }, [elements]);

  return (
    <div style={{
      position: 'absolute', bottom: 44, left: 16, zIndex: 10,
      background: 'var(--color-overlay)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)', backdropFilter: 'blur(4px)',
      maxHeight: 'calc(100vh - 120px)', overflowY: 'auto'
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
        Entity Types
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
        {TYPES.map(type => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: getEntityColor(type) }} />
            <span style={{ fontSize: 11, color: 'var(--color-text-primary)' }}>{type}</span>
          </div>
        ))}
      </div>
      
      {!hideRelationships && relTypes.length > 0 && (
        <>
          <div style={{ height: 1, background: 'var(--color-border)', margin: '10px 0' }} />
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Relationship Types
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
            {relTypes.map(type => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 2, background: getRelColor(type) }} />
                <span style={{ fontSize: 10, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{type}</span>
              </div>
            ))}
          </div>
        </>
      )}
      
      <div style={{ height: 1, background: 'var(--color-border)', margin: '10px 0' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <LegendRow icon={CircleDot} label="Double-click to expand" />
        <LegendRow icon={Eye} label="Hover node for details" />
        <LegendRow icon={Tag} label="Hover edge for relationship type" />
      </div>
    </div>
  );
}

function LegendRow({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Icon size={11} color="var(--color-text-muted)" />
      <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>{label}</span>
    </div>
  );
}
