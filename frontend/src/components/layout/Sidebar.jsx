import React, { useState, useEffect } from 'react';
import { getEntities } from '../../utils/api';
import { getEntityTypeConfig, getEntityDisplayValue, getEntityTypeLabel } from '../../utils/constants';
import { getConnectionCount, getNeo4jId } from '../../utils/normalization';
import styles from '../../styles/components.css';

const Sidebar = () => {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [edges, setEdges] = useState([]); // For connection counts

  // Entity type options
  const entityTypeOptions = [
    { value: 'PERSON', label: 'Persons' },
    { value: 'PHONE', label: 'Phones' },
    { value: 'VEHICLE', label: 'Vehicles' },
    { value: 'ACCOUNT', label: 'Accounts' },
    { value: 'LOCATION', label: 'Locations' },
    { value: 'ORGANIZATION', label: 'Organizations' },
    { value: 'CASE', label: 'Cases' },
    { value: 'DOCUMENT', label: 'Documents' }
  ];

  // Sort options
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'type', label: 'Type' },
    { value: 'connections', label: 'Connections' },
    { value: 'id', label: 'ID' }
  ];

  // Load entities on mount and when filters/search/sort change
  useEffect(() => {
    const loadEntities = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          limit: 1000,
          ...(searchTerm && { q: searchTerm }),
          ...(filters.entityType && { entity_type: filters.entityType })
        };
        const response = await getEntities(params);
        setEntities(response.entities);
      } catch (err) {
        setError(err.message);
        setEntities([]);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [searchTerm, filters]);

  // Load edges for connection counts (optional - could be expensive)
  useEffect(() => {
    // In a real implementation, we might fetch connection counts separately
    // For now, we'll calculate from a sample or leave as 0
    // This would be enhanced when we have selected entity graph data
  }, [selectedEntityId]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        [name]: checked ? value : undefined
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortDirectionChange = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleEntitySelect = (entityId) => {
    setSelectedEntityId(entityId === selectedEntityId ? null : entityId);
  };

  // Filter entities based on search and filters
  const filteredEntities = entities.filter(entity => {
    // Text search
    if (searchTerm) {
      const searchableText = `${getEntityDisplayValue(entity)} ${JSON.stringify(entity.properties)}`.toLowerCase();
      if (!searchableText.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Entity type filter
    if (filters.entityType) {
      const entityType = getEntityType(entity);
      if (entityType !== filters.entityType) {
        return false;
      }
    }

    return true;
  });

  // Sort entities
  const sortedEntities = [...filteredEntities].sort((a, b) => {
    let comparison = 0;
    const typeA = getEntityTypeLabel(a);
    const typeB = getEntityTypeLabel(b);

    switch (sortBy) {
      case 'name':
        comparison = getEntityDisplayValue(a).localeCompare(getEntityDisplayValue(b));
        break;
      case 'type':
        comparison = typeA.localeCompare(typeB);
        if (comparison === 0) {
          comparison = getEntityDisplayValue(a).localeCompare(getEntityDisplayValue(b));
        }
        break;
      case 'connections': {
        // For connection count, we'd need to calculate it - placeholder for now
        const connA = getConnectionCount(a, edges);
        const connB = getConnectionCount(b, edges);
        comparison = connB - connA; // Descending by default for connections
        break;
      }
      case 'id':
        comparison = getNeo4jId(a.id).localeCompare(getNeo4jId(b.id));
        break;
      default:
        comparison = getEntityDisplayValue(a).localeCompare(getEntityDisplayValue(b));
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Group entities by type for display
  const groupedEntities = {};
  sortedEntities.forEach(entity => {
    const type = getEntityTypeLabel(entity);
    if (!groupedEntities[type]) {
      groupedEntities[type] = [];
    }
    groupedEntities[type].push(entity);
  });

  return (
    <aside className={`${styles['sidebar']} w-72 flex-col overflow-y-auto bg-panel border-r`}>
      <div className="p-6">
        {/* Header with search and sort */}
        <div className="flex flex-col mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-secondary uppercase">Entity Explorer</h3>
            <button
              onClick={handleSortDirectionChange}
              className="p-1 bg-elevated hover:bg-accent/20 rounded-md text-xs"
              title="Toggle sort direction"
            >
              {sortDirection === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Search */}
          <div className="mb-3">
            <label className="block text-xs font-medium text-secondary mb-1">
              Search Entities
            </label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by name, ID, etc."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-3 py-2 bg-elevated border border-border rounded-md text-primary placeholder-secondary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-secondary mb-1">
              Sort by:
            </label>
            <div className="flex flex-wrap gap-2">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="bg-elevated border border-border rounded-md text-primary placeholder-secondary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 px-3 py-1"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-secondary uppercase mb-2">Filters</h3>
            <div className="space-y-2">
              {/* Entity Type Filter */}
              {entityTypeOptions.map(option => (
                <label key={option.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="entityType"
                    value={option.value}
                    checked={filters.entityType === option.value}
                    onChange={handleFilterChange}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Entity List */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-sm font-semibold text-secondary uppercase mb-3">
            Entities ({sortedEntities.length})
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-sm text-secondary">Loading...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-anomaly/10 text-anomaly rounded-md text-sm">
              Error loading entities: {error}
            </div>
          ) : sortedEntities.length === 0 ? (
            <div className="text-center py-6 text-secondary">
              No entities match the current filters
            </div>
          ) : (
            <div className="space-y-1">
              {Object.keys(groupedEntities).map((type) => {
                const config = getEntityTypeConfig(type);
                return (
                  <div key={type} className="mb-4">
                    <h4 className="text-xs font-medium text-secondary mb-1">
                      {config.label} ({groupedEntities[type].length})
                    </h4>
                    <div className="space-y-0.5">
                      {groupedEntities[type]
                        .slice(0, 20)
                        .map(entity => {
                          const isSelected = selectedEntityId === getNeo4jId(entity.id);
                          const entityType = getEntityTypeLabel(entity);
                          const typeConfig = getEntityTypeConfig(entityType);
                          const displayValue = getEntityDisplayValue(entity);
                          const connectionCount = getConnectionCount(entity, edges);

                          return (
                            <div
                              key={`${type}-${getNeo4jId(entity.id)}`}
                              onClick={() => handleEntitySelect(getNeo4jId(entity.id))}
                              className={`flex items-center gap-3 p-3 rounded-md cursor-pointer hover:bg-border transition-colors ${isSelected ? 'bg-elevated' : ''}`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${typeConfig.color.replace('var(--)', 'bg-').replace(')', '')} text-white text-xs font-medium`}>
                                {config.icon}
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="text-sm font-medium truncate max-w-xs">
                                  {displayValue}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-secondary">
                                  <span className="flex items-center gap-1">
                                    <div className={`w-2 h-2 rounded-full ${typeConfig.color.replace('var(--)', 'bg-').replace(')', '')}`}></div>
                                    <span>{typeConfig.label}</span>
                                  </span>
                                  {connectionCount > 0 && (
                                    <span className="flex items-center gap-1">
                                      <div className="w-2 h-2 rounded-full bg-accent/20 text-accent">
                                        🔗
                                      </div>
                                      <span>{connectionCount}</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-secondary truncate max-w-xs font-mono">
                                  ID: {getNeo4jId(entity.id)}
                                </div>
                              </div>

                              {isSelected && (
                                <div className="absolute inset-0 rounded-md bg-accent/20 pointer-events-none" />
                              )}
                            </div>
                          );
                        })}

                      {groupedEntities[type].length > 20 && (
                        <div className="text-xs text-secondary text-center italic mt-1">
                          +{groupedEntities[type].length - 20} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="mt-6 pt-4 border-t">
          <div className="space-y-3">
            <button
              onClick={() => console.log('Refresh entity list')}
              className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            <button
              onClick={() => console.log('Show all entities')}
              className="w-full flex items-center justify-start gap-2 px-4 py-2 bg-elevated hover:bg-accent/20 rounded-md text-sm text-left"
            >
              <span>👁️</span>
              <span>Show All</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
