import React from 'react';
import { Shield, Search, Network, ArrowRight, Activity } from 'lucide-react';

export default function LandingOverlay({ onExploreNetwork, onSearch, loading, apiStatus }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-base)',
    }}>
      <div style={{
        maxWidth: 440, width: '100%', padding: '0 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Shield size={28} color="var(--color-accent)" strokeWidth={1.5} />
          <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 2, color: 'var(--color-text-primary)' }}>
            CNAS
          </span>
        </div>
        <div style={{
          fontSize: 12, color: 'var(--color-text-secondary)', letterSpacing: 0.5,
          marginBottom: 32, textTransform: 'uppercase',
        }}>
          Criminal Network Analysis System
        </div>

        {/* Status */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 28,
          fontSize: 11, color: apiStatus === 'healthy' ? 'var(--color-verified)' : 'var(--color-text-muted)',
        }}>
          <Activity size={12} />
          {apiStatus === 'healthy' ? 'System Online — Neo4j Connected' :
            apiStatus === 'unhealthy' ? 'System Offline — Check Backend' : 'Connecting...'}
        </div>

        {/* Actions */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onExploreNetwork} disabled={loading} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', width: '100%',
            background: 'var(--color-panel)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', cursor: loading ? 'wait' : 'pointer',
            transition: 'border-color var(--transition-fast)',
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Network size={16} color="var(--color-accent)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  {loading ? 'Loading Network...' : 'Explore Network'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Load and visualize the criminal network graph
                </div>
              </div>
            </div>
            <ArrowRight size={14} color="var(--color-text-muted)" />
          </button>

          <button onClick={onSearch} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', width: '100%',
            background: 'var(--color-panel)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', cursor: 'pointer',
            transition: 'border-color var(--transition-fast)',
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Search size={16} color="var(--color-info)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Search Entity
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                  Find persons, phones, vehicles, accounts
                </div>
              </div>
            </div>
            <ArrowRight size={14} color="var(--color-text-muted)" />
          </button>
        </div>

        {/* Capabilities */}
        <div style={{
          marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 10, width: '100%',
        }}>
          {[
            { label: 'Network Mapping', desc: 'Visualize entity relationships' },
            { label: 'Path Analysis', desc: 'Trace connections between entities' },
            { label: 'Anomaly Detection', desc: 'Identify suspicious patterns' },
            { label: 'Evidence Linking', desc: 'Connect documents to entities' },
          ].map(item => (
            <div key={item.label} style={{
              padding: '8px 10px', background: 'var(--color-elevated)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                {item.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
