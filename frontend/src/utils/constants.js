// Entity types mapping from Neo4j labels to UI representation
export const ENTITY_TYPES = {
  PERSON: {
    label: 'Person',
    color: 'var(--color-person)',
    icon: '👤',
    properties: ['person_name', 'normalized_name', 'person_id']
  },
  PHONE: {
    label: 'Phone',
    color: 'var(--color-phone)',
    icon: '📱',
    properties: ['phone_number', 'normalized_number', 'subscriber_name', 'phone_id']
  },
  VEHICLE: {
    label: 'Vehicle',
    color: 'var(--color-vehicle)',
    icon: '🚗',
    properties: ['registration_number', 'normalized_number', 'make_model', 'color', 'vehicle_id']
  },
  ACCOUNT: {
    label: 'Bank Account',
    color: 'var(--color-account)',
    icon: '🏦',
    properties: ['account_number', 'normalized_number', 'holder_name', 'account_id']
  },
  LOCATION: {
    label: 'Location',
    color: 'var(--color-location)',
    icon: '📍',
    properties: ['name', 'normalized_name', 'address', 'location_id']
  },
  ORGANIZATION: {
    label: 'Organization',
    color: 'var(--color-organization)',
    icon: '🏢',
    properties: ['name', 'normalized_name', 'org_type', 'organization_id']
  },
  CASE: {
    label: 'Case',
    color: 'var(--color-case)',
    icon: '📁',
    properties: ['case_id']
  },
  DOCUMENT: {
    label: 'Document',
    color: 'var(--color-document)',
    icon: '📄',
    properties: ['document_id', 'case_id']
  }
};

// Relationship types and their visual styling
export const RELATIONSHIP_TYPES = {
  // Financial
  RECEIVED_MONEY_FROM: { label: 'Received Money From', category: 'financial' },
  MADE_PAYMENT_TO: { label: 'Made Payment To', category: 'financial' },
  USING_HAWALA_CHANNEL_OF: { label: 'Using Hawala Channel Of', category: 'financial' },

  // Communication
  COMMUNICATED_WITH: { label: 'Communicated With', category: 'communication' },
  MAINTAINED_CONTACT_WITH: { label: 'Maintained Contact With', category: 'communication' },

  // Physical
  MET_WITH: { label: 'Met With', category: 'physical' },
  SEEN_WITH: { label: 'Seen With', category: 'physical' },
  VISITED: { label: 'Visited', category: 'physical' },
  RESIDED_AT: { label: 'Resided At', category: 'physical' },

  // Transportation
  TRANSPORTED_IN_VEHICLE: { label: 'Transported In Vehicle', category: 'transportation' },
  DRVE_VEHICLE: { label: 'Drove Vehicle', category: 'transportation' },

  // Criminal
  SUPPLIED_TO: { label: 'Supplied To', category: 'criminal' },
  RECEIVED_FROM: { label: 'Received From', category: 'criminal' },
  CONSPIRED_WITH: { label: 'Conspired With', category: 'criminal' },

  // Location-based
  WAS_AT_LOCATION: { label: 'Was At Location', category: 'location' },
  INCIDENT_AT_LOCATION: { label: 'Incident At Location', category: 'location' },

  // Document provenance
  MENTIONED_IN: { label: 'Mentioned In', category: 'provenance' },

  // Case connections
  INVOLVED_IN: { label: 'Involved In', category: 'case' },
  RELATED_TO: { label: 'Related To', category: 'case' },

  // Default
  RELATED_TO: { label: 'Related To', category: 'default' }
};

// Get relationship category for styling
export const getRelationshipCategory = (type) => {
  return RELATIONSHIP_TYPES[type]?.category || 'default';
};

// Get entity type config
export const getEntityTypeConfig = (type) => {
  return ENTITY_TYPES[type] || {
    label: type || 'Unknown',
    color: 'var(--color-text-secondary)',
    icon: '❓',
    properties: []
  };
};

// Get entity display value from properties
export const getEntityDisplayValue = (entity) => {
  if (!entity || !entity.properties) return 'Unknown';

  const type = Array.isArray(entity.types) ? entity.types[0] : entity.types;
  const config = getEntityTypeConfig(type);

  // Try to get the primary property for this type
  for (const prop of config.properties) {
    if (entity.properties[prop] !== undefined && entity.properties[prop] !== null && entity.properties[prop] !== '') {
      return String(entity.properties[prop]);
    }
  }

  // Fallback to any available property
  const props = Object.values(entity.properties);
  for (const prop of props) {
    if (prop !== undefined && prop !== null && prop !== '' && typeof prop === 'string') {
      return prop;
    }
  }

  return 'Unknown';
};

// Get entity type from labels array
export const getEntityType = (entity) => {
  if (!entity || !entity.types) return 'UNKNOWN';

  const types = Array.isArray(entity.types) ? entity.types : [entity.types];
  // Map Neo4j labels to our entity types
  const typeMap = {
    Person: 'PERSON',
    Phone: 'PHONE',
    Vehicle: 'VEHICLE',
    BankAccount: 'ACCOUNT',
    Location: 'LOCATION',
    Organization: 'ORGANIZATION',
    Case: 'CASE',
    Document: 'DOCUMENT'
  };

  for (const type of types) {
    if (typeMap[type]) return typeMap[type];
  }

  return 'UNKNOWN';
};

// Neo4j ID helper
export const getNeo4jId = (id) => {
  // Neo4j returns elementId as a string, sometimes with colon prefix
  return String(id).replace(/^:/, '');
};

// Date formatting utility
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Truncate text utility
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

// Debounce utility
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};