const ENTITY_COLORS = {
  Person: '#C98A3B',
  Phone: '#5B7FA6',
  Vehicle: '#8B6DB0',
  BankAccount: '#4C8C7D',
  Organization: '#B5544B',
  Location: '#6B9E78',
  Case: '#C98A3B',
  Document: '#838C99',
  Email: '#5B7FA6',
};

export const REL_COLORS = {
  CALLS: '#5B7FA6', 
  TRANSFERS: '#4C8C7D', 
  TRANSFERRED_VALUE_TO: '#4C8C7D', 
  ASSOCIATED_WITH: '#8B6DB0', 
  INVOLVED_IN: '#B5544B', 
  RELATED_TO: '#C98A3B', 
  RESIDED_AT: '#6B9E78', 
  POSSESSED: '#838C99', 
  MENTIONED_IN: '#9DA6B2',
};

export function getRelColor(type) {
  return REL_COLORS[type] || '#5A6270';
}

const ENTITY_ICONS = {
  Person: 'User',
  Phone: 'Phone',
  Vehicle: 'Car',
  BankAccount: 'Landmark',
  Organization: 'Building2',
  Location: 'MapPin',
  Case: 'FolderOpen',
  Document: 'FileText',
  Email: 'Mail',
};

const TYPE_DISPLAY = {
  Person: 'Person',
  Phone: 'Phone',
  Vehicle: 'Vehicle',
  BankAccount: 'Bank Account',
  Organization: 'Organization',
  Location: 'Location',
  Case: 'Case',
  Document: 'Document',
  Email: 'Email',
};

const PRIMARY_PROPS = {
  Person: 'person_name',
  Phone: 'phone_number',
  Vehicle: 'registration_number',
  BankAccount: 'account_number',
  Organization: 'name',
  Location: 'name',
  Document: 'document_id',
  Email: 'email_address',
};

const SUBTITLE_PROPS = {
  Person: ['age', 'gender', 'alias', 'address'],
  Phone: ['owner', 'carrier', 'phone_type'],
  Vehicle: ['owner', 'make', 'model', 'vehicle_type'],
  BankAccount: ['bank_name', 'holder_name', 'account_type'],
  Organization: ['org_type', 'type', 'address'],
  Location: ['type', 'city', 'state', 'address'],
  Document: ['document_type', 'case_id'],
};

export const ENTITY_TYPE_FILTERS = [
  { value: 'PERSON', label: 'Person', icon: 'User' },
  { value: 'PHONE', label: 'Phone', icon: 'Phone' },
  { value: 'VEHICLE', label: 'Vehicle', icon: 'Car' },
  { value: 'ACCOUNT', label: 'Account', icon: 'Landmark' },
  { value: 'ORGANIZATION', label: 'Organization', icon: 'Building2' },
  { value: 'LOCATION', label: 'Location', icon: 'MapPin' },
];

export function getEntityType(entity) {
  const types = entity.types || entity.labels || [];
  for (const t of types) {
    if (t !== 'Entity' && t !== '_Entity') return t;
  }
  return types[0] || 'Unknown';
}

export function getEntityDisplayName(entity) {
  if (entity.value && entity.value !== 'Unknown') return entity.value;
  const type = getEntityType(entity);
  const prop = PRIMARY_PROPS[type];
  if (prop && entity.properties && entity.properties[prop]) {
    return String(entity.properties[prop]);
  }
  if (entity.properties) {
    for (const key of Object.values(PRIMARY_PROPS)) {
      if (entity.properties[key]) return String(entity.properties[key]);
    }
    if (entity.properties.name) return entity.properties.name;
  }
  return entity.label || entity.id || 'Unknown';
}

export function getEntitySubtitle(entity) {
  const type = getEntityType(entity);
  const props = SUBTITLE_PROPS[type] || [];
  if (!entity.properties) return null;
  for (const key of props) {
    if (entity.properties[key] != null && entity.properties[key] !== '') {
      return `${formatPropKey(key)}: ${entity.properties[key]}`;
    }
  }
  return null;
}

export function getEntityColor(typeOrEntity) {
  const type = typeof typeOrEntity === 'string' ? typeOrEntity : getEntityType(typeOrEntity);
  return ENTITY_COLORS[type] || '#838C99';
}

export function getEntityIconName(typeOrEntity) {
  const type = typeof typeOrEntity === 'string' ? typeOrEntity : getEntityType(typeOrEntity);
  return ENTITY_ICONS[type] || 'CircleDot';
}

export function getEntityTypeDisplay(typeOrEntity) {
  const type = typeof typeOrEntity === 'string' ? typeOrEntity : getEntityType(typeOrEntity);
  return TYPE_DISPLAY[type] || type;
}

export function normalizeEntity(raw) {
  const id = raw.id || raw.elementId;
  const entityType = getEntityType(raw);
  const displayName = getEntityDisplayName(raw);
  const subtitle = getEntitySubtitle(raw);
  const properties = raw.properties || {};
  return { id, displayName, entityType, subtitle, properties, raw };
}

export function formatPropKey(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPropValue(key, value) {
  if (value == null) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function getKeyProperties(entity) {
  const type = getEntityType(entity);
  const props = entity.properties || {};
  const primary = PRIMARY_PROPS[type];
  const exclude = new Set(['elementId', 'id', primary]);
  const entries = Object.entries(props).filter(
    ([k, v]) => !exclude.has(k) && v != null && v !== ''
  );
  return entries.slice(0, 8);
}
