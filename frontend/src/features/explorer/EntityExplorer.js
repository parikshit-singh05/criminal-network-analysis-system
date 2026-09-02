import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, ChevronLeft, User, Phone, Car, Landmark, Building2, MapPin, CircleDot } from 'lucide-react';
import api from '../../api/client';
import { getEntityType, getEntityDisplayName, getEntitySubtitle, getEntityColor, getEntityTypeDisplay, ENTITY_TYPE_FILTERS } from '../../utils/normalize';
import { LoadingState, ErrorState, EmptyState } from '../../components/common/States';
import { useDebounce } from '../../hooks/useApi';

const ICON_MAP = { User, Phone, Car, Landmark, Building2, MapPin, CircleDot };

function getIcon(name) {
  return ICON_MAP[name] || CircleDot;
}

export default function EntityExplorer({ searchQuery, onEntitySelect, selectedEntityId, isOpen, onToggle, dbStats }) {
  const [localSearch, setLocalSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(null);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const searchRef = useRef(null);
  const debouncedSearch = useDebounce(localSearch, 300);

  // Sync parent search query
  useEffect(() => {
    if (searchQuery && searchQuery !== localSearch) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchEntities = useCallback(async (query, entityType) => {
    setLoading(true);
    setError(null);
    try {
      let result;
      if (query && query.length >= 2) {
        const params = { q: query, limit: 50 };
        if (entityType) params.entity_type = entityType;
        result = await api.searchEntities(params);
        setEntities(result.entities || []);
      } else {
        const params = { limit: 50 };
        if (entityType) params.entity_type = entityType;
        result = await api.getEntities(params);
        setEntities(result.entities || []);
      }
      setInitialLoaded(true);
    } catch (err) {
      setError(err.message || 'Failed to load entities');
      setEntities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntities(debouncedSearch, typeFilter);
  }, [debouncedSearch, typeFilter, fetchEntities]);

  const handleFilterClick = (filterValue) => {
    setTypeFilter(prev => prev === filterValue ? null : filterValue);
  };

  const clearFilters = () => {
    setLocalSearch('');
    setTypeFilter(null);
  };

  const hasFilters = localSearch || typeFilter;

  const totalStr = dbStats && !hasFilters ? ` of ${dbStats.total_nodes}` : '';

  if (!isOpen) {
    return (
      <button onClick={onToggle} style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: 24, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-panel)', border: '1px solid var(--color-border)',
        borderLeft: 'none', borderRadius: '0 4px 4px 0',
        color: 'var(--color-text-secondary)', cursor: 'pointer', zIndex: 10,
      }}>
        <ChevronLeft size={14} style={{ transform: 'rotate(180deg)' }} />
      </button>
    );
  }

  return (
    <div style={{
      width: 280, height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--color-panel)', borderRight: '1px solid var(--color-border)',
      flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px', borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--color-text-secondary)' }}>
          Entity Explorer
        </span>
        <button onClick={onToggle} style={{ display: 'flex', padding: 2, color: 'var(--color-text-muted)' }}>
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--color-base)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)', padding: '0 8px', height: 30,
        }}>
          <Search size={13} color="var(--color-text-muted)" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && entities.length > 0) {
                onEntitySelect(entities[0]);
              }
            }}
            style={{
              flex: 1, padding: '0 4px', fontSize: 12,
              background: 'transparent', color: 'var(--color-text-primary)',
            }}
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')} style={{ display: 'flex', padding: 1 }}>
              <X size={12} color="var(--color-text-muted)" />
            </button>
          )}
        </div>
      </div>

      {/* Type Filters */}
      <div style={{
        display: 'flex', gap: 4, padding: '6px 10px',
        overflowX: 'auto', borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        {ENTITY_TYPE_FILTERS.map(f => {
          const IconComp = getIcon(f.icon);
          const active = typeFilter === f.value;
          return (
            <button key={f.value} onClick={() => handleFilterClick(f.value)} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', fontSize: 10, whiteSpace: 'nowrap',
              border: `1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
              borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              background: active ? 'var(--color-accent-dim)' : 'transparent',
              color: active ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              transition: 'all var(--transition-fast)',
            }}>
              <IconComp size={11} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Result Count & Clear */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '4px 12px', fontSize: 11, color: 'var(--color-text-muted)',
        fontFamily: 'var(--font-mono)', flexShrink: 0,
      }}>
        <span>{entities.length}{totalStr} entities</span>
        {hasFilters && (
          <button onClick={clearFilters} style={{
            fontSize: 10, color: 'var(--color-accent)', cursor: 'pointer',
            padding: '1px 6px', border: '1px solid var(--color-accent)',
            borderRadius: 2, background: 'transparent',
          }}>
            Clear
          </button>
        )}
      </div>

      {/* Entity List */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {loading && <LoadingState message="Searching..." size="sm" />}
        {error && <ErrorState message={error} onRetry={() => fetchEntities(debouncedSearch, typeFilter)} compact />}
        {!loading && !error && entities.length === 0 && initialLoaded && (
          <EmptyState
            icon={Search}
            title="No entities found"
            description={localSearch ? `No results for "${localSearch}"` : 'No entities available'}
          />
        )}
        {!loading && entities.map(entity => {
          const type = getEntityType(entity);
          const displayName = getEntityDisplayName(entity);
          const subtitle = getEntitySubtitle(entity);
          const color = getEntityColor(type);
          const isSelected = entity.id === selectedEntityId;
          const filterObj = ENTITY_TYPE_FILTERS.find(f => f.label === type || f.value === type.toUpperCase());
          const IconComp = filterObj ? getIcon(filterObj.icon) : CircleDot;

          return (
            <div
              key={entity.id}
              onClick={() => onEntitySelect(entity)}
              style={{
                display: 'flex', gap: 10, alignItems: 'flex-start',
                padding: '9px 12px', cursor: 'pointer',
                borderBottom: '1px solid var(--color-border)',
                borderLeft: isSelected ? `3px solid var(--color-accent)` : '3px solid transparent',
                background: isSelected ? 'var(--color-accent-dim)' : 'transparent',
                transition: 'background var(--transition-fast)',
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--color-elevated)'; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `${color}22`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <IconComp size={14} color={color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {displayName}
                </div>
                <div style={{
                  fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5,
                  color: color, marginTop: 1,
                }}>
                  {getEntityTypeDisplay(type)}
                </div>
                {subtitle && (
                  <div style={{
                    fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2,
                    fontFamily: 'var(--font-mono)', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {subtitle}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
