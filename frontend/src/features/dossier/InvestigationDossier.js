import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronRight, X, Expand, Route, Focus, FileText,
  AlertTriangle, ExternalLink, User, Phone, Car, Landmark, Building2,
  MapPin, CircleDot, FolderOpen, Mail,
} from 'lucide-react';
import api from '../../api/client';
import {
  getEntityType, getEntityDisplayName, getEntityColor,
  getEntityTypeDisplay, getKeyProperties, formatPropKey, formatPropValue,
} from '../../utils/normalize';
import { LoadingState, ErrorState } from '../../components/common/States';

const ICON_MAP = { User, Phone, Car, Landmark, Building2, MapPin, CircleDot, FolderOpen, FileText, Mail };

function EntityIcon({ type, size = 18 }) {
  const iconMap = { Person: 'User', Phone: 'Phone', Vehicle: 'Car', BankAccount: 'Landmark', Organization: 'Building2', Location: 'MapPin', Case: 'FolderOpen', Document: 'FileText', Email: 'Mail' };
  const Comp = ICON_MAP[iconMap[type]] || CircleDot;
  return <Comp size={size} />;
}

export default function InvestigationDossier({
  entity, onClose, onExpandNeighbors, onTraceConnection, onFocusMode,
  onSelectEntity, selectedEntityId, isOpen, onToggle,
}) {
  const [activeTab, setActiveTab] = useState('details');
  const [neighbors, setNeighbors] = useState(null);
  const [neighborsLoading, setNeighborsLoading] = useState(false);
  const [evidence, setEvidence] = useState(null);
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [traceTarget, setTraceTarget] = useState('');
  const [traceSearch, setTraceSearch] = useState([]);
  const [traceSearchLoading, setTraceSearchLoading] = useState(false);

  const loadNeighbors = useCallback(async () => {
    if (!entity) return;
    setNeighborsLoading(true);
    try {
      const data = await api.getNeighbors(entity.id, { limit: 30 });
      setNeighbors(data);
    } catch (err) {
      setNeighbors({ error: err.message });
    } finally {
      setNeighborsLoading(false);
    }
  }, [entity]);

  const loadEvidence = useCallback(async () => {
    if (!entity) return;
    setEvidenceLoading(true);
    try {
      const data = await api.getEntityProvenance(entity.id);
      setEvidence(data);
    } catch (err) {
      setEvidence({ error: err.message });
    } finally {
      setEvidenceLoading(false);
    }
  }, [entity]);

  const loadAnalytics = useCallback(async () => {
    if (!entity) return;
    setAnalyticsLoading(true);
    try {
      const data = await api.getClusteringCoefficient(entity.id);
      setAnalytics(data);
    } catch (err) {
      setAnalytics({ error: err.message });
    } finally {
      setAnalyticsLoading(false);
    }
  }, [entity]);

  useEffect(() => {
    if (entity) {
      setNeighbors(null);
      setEvidence(null);
      setAnalytics(null);
      setTraceTarget('');
      setTraceSearch([]);
      setActiveTab('details');
      loadNeighbors();
    }
  }, [entity, loadNeighbors]);

  useEffect(() => {
    if (activeTab === 'evidence' && !evidence && entity) loadEvidence();
    if (activeTab === 'analytics' && !analytics && entity) loadAnalytics();
  }, [activeTab, evidence, analytics, entity, loadEvidence, loadAnalytics]);

  const handleTraceSearch = useCallback(async (q) => {
    setTraceTarget(q);
    if (q.length < 2) { setTraceSearch([]); return; }
    setTraceSearchLoading(true);
    try {
      const data = await api.searchEntities({ q, limit: 8 });
      setTraceSearch((data.entities || []).filter(e => e.id !== entity?.id));
    } catch { setTraceSearch([]); }
    finally { setTraceSearchLoading(false); }
  }, [entity]);

  if (!isOpen || !entity) {
    if (!isOpen) return null;
    return (
      <div style={{
        width: 340, height: '100%', background: 'var(--color-panel)',
        borderLeft: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-muted)', fontSize: 12, padding: 24, textAlign: 'center',
      }}>
        Select an entity to begin investigation
      </div>
    );
  }

  const type = getEntityType(entity);
  const displayName = getEntityDisplayName(entity);
  const color = getEntityColor(type);
  const keyProps = getKeyProperties(entity);

  const tabs = [
    { id: 'details', label: 'Details' },
    { id: 'connections', label: 'Connections' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'trace', label: 'Trace' },
  ];

  return (
    <div style={{
      width: 340, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--color-panel)', borderLeft: '1px solid var(--color-border)',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Entity Header */}
      <div style={{
        padding: '12px 14px', borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: `${color}22`, display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          color: color,
        }}>
          <EntityIcon type={type} size={18} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {displayName}
          </div>
          <div style={{
            fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5,
            color: color, marginTop: 2,
          }}>
            {getEntityTypeDisplay(type)}
          </div>
          <div style={{
            fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)',
            marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {entity.id}
          </div>
        </div>
        <button onClick={onClose} style={{ display: 'flex', padding: 2, color: 'var(--color-text-muted)', flexShrink: 0 }}>
          <X size={14} />
        </button>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex', gap: 4, padding: '8px 14px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <ActionBtn icon={Expand} label="Expand" onClick={() => onExpandNeighbors(entity.id)} />
        <ActionBtn icon={Focus} label="Focus" onClick={() => onFocusMode(true)} />
        <ActionBtn icon={Route} label="Trace" onClick={() => setActiveTab('trace')} />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--color-border)', flexShrink: 0,
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '7px 0', fontSize: 10, fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: 0.4,
            color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
            borderBottom: activeTab === tab.id ? '2px solid var(--color-accent)' : '2px solid transparent',
            background: 'transparent', cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {activeTab === 'details' && (
          <DetailsTab keyProps={keyProps} entity={entity} />
        )}
        {activeTab === 'connections' && (
          <ConnectionsTab
            neighbors={neighbors}
            loading={neighborsLoading}
            onSelect={onSelectEntity}
            onRetry={loadNeighbors}
          />
        )}
        {activeTab === 'evidence' && (
          <EvidenceTab evidence={evidence} loading={evidenceLoading} onRetry={loadEvidence} />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab analytics={analytics} loading={analyticsLoading} neighborCount={neighbors?.count} onRetry={loadAnalytics} />
        )}
        {activeTab === 'trace' && (
          <TraceTab
            entity={entity}
            traceTarget={traceTarget}
            traceSearch={traceSearch}
            traceSearchLoading={traceSearchLoading}
            onSearch={handleTraceSearch}
            onTrace={onTraceConnection}
          />
        )}
      </div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', fontSize: 10, fontWeight: 500,
      color: 'var(--color-text-secondary)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-sm)', cursor: 'pointer',
      background: 'var(--color-elevated)',
      transition: 'all var(--transition-fast)',
    }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
      letterSpacing: 0.8, color: 'var(--color-text-muted)',
      marginBottom: 8, marginTop: 16,
    }}>
      {children}
    </div>
  );
}

function PropRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', gap: 12,
      padding: '4px 0', fontSize: 12, borderBottom: '1px solid var(--color-border)',
    }}>
      <span style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>
        {formatPropKey(label)}
      </span>
      <span style={{
        color: 'var(--color-text-primary)', textAlign: 'right',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: typeof value === 'number' || /^\d/.test(String(value)) ? 'var(--font-mono)' : 'inherit',
      }}>
        {formatPropValue(label, value)}
      </span>
    </div>
  );
}

function DetailsTab({ keyProps, entity }) {
  return (
    <div>
      <SectionLabel>Properties</SectionLabel>
      {keyProps.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '8px 0' }}>No additional properties</div>
      ) : (
        keyProps.map(([k, v]) => <PropRow key={k} label={k} value={v} />)
      )}
    </div>
  );
}

function ConnectionsTab({ neighbors, loading, onSelect, onRetry }) {
  if (loading) return <LoadingState message="Loading connections..." size="sm" />;
  if (neighbors?.error) return <ErrorState message={neighbors.error} onRetry={onRetry} compact />;
  if (!neighbors || !neighbors.neighbors) return <LoadingState message="Loading..." size="sm" />;

  const byType = {};
  for (const n of neighbors.neighbors) {
    const rt = n.relationship_type || 'RELATED';
    if (!byType[rt]) byType[rt] = [];
    byType[rt].push(n);
  }

  return (
    <div>
      <div style={{
        fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 12,
        fontFamily: 'var(--font-mono)',
      }}>
        {neighbors.count} connection{neighbors.count !== 1 ? 's' : ''}
      </div>
      {Object.entries(byType).map(([relType, items]) => (
        <div key={relType} style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: 0.5, color: 'var(--color-info)',
            padding: '4px 0', borderBottom: '1px solid var(--color-border)',
            marginBottom: 4,
          }}>
            {relType} ({items.length})
          </div>
          {items.map(n => {
            const nType = getEntityType(n);
            const nName = getEntityDisplayName(n);
            const nColor = getEntityColor(nType);
            return (
              <div key={n.id} onClick={() => onSelect(n)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '5px 4px', cursor: 'pointer', fontSize: 12,
                borderRadius: 'var(--radius-sm)',
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-elevated)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: nColor, flexShrink: 0,
                }} />
                <span style={{
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  color: 'var(--color-text-primary)',
                }}>
                  {nName}
                </span>
                <span style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  {getEntityTypeDisplay(nType)}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function EvidenceTab({ evidence, loading, onRetry }) {
  if (loading) return <LoadingState message="Loading evidence..." size="sm" />;
  if (evidence?.error) return <ErrorState message={evidence.error} onRetry={onRetry} compact />;
  if (!evidence) return <LoadingState message="Loading..." size="sm" />;

  if (!evidence.documents || evidence.documents.length === 0) {
    return (
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '16px 0', textAlign: 'center' }}>
        {evidence.message || 'No evidence documents linked to this entity'}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 10,
        fontFamily: 'var(--font-mono)',
      }}>
        {evidence.count} document{evidence.count !== 1 ? 's' : ''}
      </div>
      {evidence.documents.map(doc => (
        <div key={doc.id || doc.document_id} style={{
          padding: '8px 10px', marginBottom: 6,
          background: 'var(--color-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <FileText size={12} color="var(--color-info)" />
            <span style={{ fontSize: 12, fontWeight: 500, fontFamily: 'var(--font-mono)' }}>
              {doc.document_id}
            </span>
          </div>
          {doc.document_type && (
            <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
              Type: {doc.document_type}
            </div>
          )}
          {doc.case_id && (
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Case: {doc.case_id}
            </div>
          )}
          {doc.mention_count && (
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
              Mentioned {doc.mention_count} time{doc.mention_count !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AnalyticsTab({ analytics, loading, neighborCount, onRetry }) {
  if (loading) return <LoadingState message="Computing analytics..." size="sm" />;
  if (analytics?.error) return <ErrorState message={analytics.error} onRetry={onRetry} compact />;
  if (!analytics) return <LoadingState message="Loading..." size="sm" />;

  return (
    <div>
      <SectionLabel>Graph Metrics</SectionLabel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <MetricCard label="Neighbors" value={analytics.total_neighbors} />
        <MetricCard label="Inter-connections" value={analytics.connections_between_neighbors} />
        <MetricCard label="Clustering Coeff." value={analytics.clustering_coefficient?.toFixed(4)} />
        {neighborCount != null && <MetricCard label="Total Connections" value={neighborCount} />}
      </div>
      <div style={{
        marginTop: 12, padding: '8px 10px', fontSize: 11,
        color: 'var(--color-text-secondary)', background: 'var(--color-elevated)',
        borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)',
        lineHeight: 1.5,
      }}>
        {analytics.clustering_coefficient > 0.5
          ? 'High clustering coefficient indicates a tightly connected local network.'
          : analytics.clustering_coefficient > 0.1
            ? 'Moderate clustering suggests some interconnection between neighbors.'
            : 'Low clustering coefficient — neighbors are not well connected to each other.'
        }
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div style={{
      padding: '8px 10px',
      background: 'var(--color-elevated)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-sm)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
        {value ?? 'N/A'}
      </div>
    </div>
  );
}

function TraceTab({ entity, traceTarget, traceSearch, traceSearchLoading, onSearch, onTrace }) {
  const entityName = getEntityDisplayName(entity);
  return (
    <div>
      <SectionLabel>Trace Connection</SectionLabel>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 10 }}>
        Find path from <strong style={{ color: 'var(--color-accent)' }}>{entityName}</strong> to another entity
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--color-base)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)', padding: '0 8px', height: 30, marginBottom: 8,
      }}>
        <Route size={13} color="var(--color-text-muted)" />
        <input
          type="text"
          placeholder="Search target entity..."
          value={traceTarget}
          onChange={(e) => onSearch(e.target.value)}
          style={{
            flex: 1, padding: '0 4px', fontSize: 12,
            background: 'transparent', color: 'var(--color-text-primary)',
          }}
        />
      </div>
      {traceSearchLoading && <LoadingState message="Searching..." size="sm" />}
      {traceSearch.map(target => (
        <div key={target.id}
          onClick={() => onTrace(entity.id, target.id, entity, target)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 8px', cursor: 'pointer', fontSize: 12,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)', marginBottom: 4,
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
        >
          <Route size={12} color="var(--color-accent)" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {getEntityDisplayName(target)}
            </div>
            <div style={{ fontSize: 9, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {getEntityTypeDisplay(getEntityType(target))}
            </div>
          </div>
          <ExternalLink size={11} color="var(--color-text-muted)" />
        </div>
      ))}
    </div>
  );
}
