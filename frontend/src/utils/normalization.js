// Entity normalization utilities to ensure meaningful display values
import { getEntityTypeConfig, getEntityType } from './constants';

/**
 * Get the best display value for an entity, never returning "Unknown"
 * when a meaningful property exists
 * @param {Object} entity - Entity object from API
 * @returns {String} Best display value for the entity
 */
export const getEntityDisplayValue = (entity) => {
  if (!entity || !entity.properties) {
    // Fallback to any available text or id
    if (entity.text) return String(entity.text);
    if (entity.id) return `Entity ${getNeo4jId(entity.id)}`;
    return 'Unknown Entity';
  }

  const type = getEntityType(entity);
  const config = getEntityTypeConfig(type);

  // Try to get the primary display property for this type in order of preference
  const displayProperties = getDisplayPropertiesByType(type);

  for (const prop of displayProperties) {
    const value = entity.properties[prop];
    if (value !== undefined && value !== null && value !== '' && String(value).trim() !== '') {
      return String(value);
    }
  }

  // Fallback to any non-empty string property
  const props = Object.entries(entity.properties);
  for (const [key, value] of props) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value;
    }
    if (typeof value === 'number' && !isNaN(value)) {
      return String(value);
    }
  }

  // Last resort: use the entity's text or id if available
  if (entity.text && String(entity.text).trim() !== '') {
    return String(entity.text);
  }

  if (entity.id) {
    return `Entity ${getNeo4jId(entity.id)}`;
  }

  // Only return "Unknown" as absolute last resort
  return 'Unknown';
};

/**
 * Get display properties in order of preference for each entity type
 * @param {String} type - Entity type (PERSON, PHONE, etc.)
 * @returns {Array} Array of property names in order of preference
 */
export const getDisplayPropertiesByType = (type) => {
  const propertyMap = {
    PERSON: ['person_name', 'normalized_name'],
    PHONE: ['phone_number', 'normalized_number', 'subscriber_name'],
    VEHICLE: ['registration_number', 'normalized_number', 'make_model'],
    ACCOUNT: ['account_number', 'normalized_number', 'holder_name'],
    LOCATION: ['name', 'normalized_name', 'address'],
    ORGANIZATION: ['name', 'normalized_name', 'org_type'],
    CASE: ['case_id'], // Cases might have more properties from case_metadata_service
    DOCUMENT: ['document_id', 'case_id'],
    EMAIL: ['email_id', 'subject', 'sender'], // If email service exists
    // Add more types as discovered
  };

  return propertyMap[type] || ['name', 'id']; // Generic fallback
};

/**
 * Get a simplified entity type string for UI display
 * @param {Object} entity - Entity object from API
 * @returns {String} Simplified entity type
 */
export const getEntityTypeLabel = (entity) => {
  if (!entity || !entity.types) return 'Unknown';

  const types = Array.isArray(entity.types) ? entity.types : [entity.types];
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

  return types[0] || 'Unknown';
};

/**
 * Get connection count for an entity (number of relationships)
 * This would typically be computed from graph data or fetched via API
 * @param {Object} entity - Entity object
 * @param {Array} edges - Array of edges from graph data
 * @returns {Number} Number of connections
 */
export const getConnectionCount = (entity, edges = []) => {
  if (!entity || !entity.id) return 0;

  const entityId = getNeo4jId(entity.id);
  return edges.reduce((count, edge) => {
    const sourceId = getNeo4jId(edge.data?.source || edge.source);
    const targetId = getNeo4jId(edge.data?.target || edge.target);
    return count + (sourceId === entityId || targetId === entityId ? 1 : 0);
  }, 0);
};

/**
 * Neo4j ID helper - clean up Neo4j IDs
 * @param {String|Number} id - Raw ID from Neo4j
 * @returns {String} Cleaned ID
 */
export const getNeo4jId = (id) => {
  if (!id) return '';
  return String(id).replace(/^:/, '');
};

/**
 * Check if two entities are the same (by ID)
 * @param {Object} entity1 - First entity
 * @param {Object} entity2 - Second entity
 * @returns {Boolean} True if same entity
 */
export const entitiesAreEqual = (entity1, entity2) => {
  if (!entity1 || !entity2) return false;
  return getNeo4jId(entity1.id) === getNeo4jId(entity2.id);
};

/**
 * Extract actual labels from Neo4j labels array
 * @param {Array} labels - Neo4j labels array
 * @returns {Array} Cleaned labels
 */
export const extractEntityLabels = (labels) => {
  if (!labels || !Array.isArray(labels)) return [];
  return labels.filter(label => label && typeof label === 'string');
};

export default {
  getEntityDisplayValue,
  getDisplayPropertiesByType,
  getEntityTypeLabel,
  getConnectionCount,
  getNeo4jId,
  entitiesAreEqual,
  extractEntityLabels
};