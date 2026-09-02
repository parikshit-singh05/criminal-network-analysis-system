import React, { useMemo } from 'react';
import { Network, Users, ArrowRightLeft, Target, GitMerge } from 'lucide-react';
import { getEntityDisplayName } from '../../utils/normalize';

export default function NetworkInsights({ elements, dbStats }) {
  const stats = useMemo(() => {
    if (!elements || elements.length === 0) return null;
    
    let nodes = 0;
    let edges = 0;
    const nodeMap = new Map();
    const typeCount = {};
    const relCount = {};
    
    // First pass to map nodes
    for (const el of elements) {
      if (!el.data.source) {
        nodes++;
        nodeMap.set(el.data.id, { ...el.data, degree: 0 });
        const type = el.data.type || 'Unknown';
        typeCount[type] = (typeCount[type] || 0) + 1;
      }
    }
    
    // Second pass to count edges and degrees
    for (const el of elements) {
      if (el.data.source && el.data.target) {
        edges++;
        const relType = el.data.label || 'RELATED';
        relCount[relType] = (relCount[relType] || 0) + 1;
        
        const src = nodeMap.get(el.data.source);
        const tgt = nodeMap.get(el.data.target);
        if (src) src.degree++;
        if (tgt) tgt.degree++;
      }
    }
    
    // Find most connected
    let maxDegree = -1;
    let mostConnected = null;
    for (const node of nodeMap.values()) {
      if (node.degree > maxDegree) {
        maxDegree = node.degree;
        mostConnected = node;
      }
    }
    
    // Top relationship
    let topRel = null;
    let maxRelCount = -1;
    for (const [rel, count] of Object.entries(relCount)) {
      if (count > maxRelCount) {
        maxRelCount = count;
        topRel = rel;
      }
    }
    
    return {
      nodes,
      edges,
      mostConnected,
      maxDegree,
      topRel,
      hubCount: Array.from(nodeMap.values()).filter(n => n.degree >= 3).length
    };
  }, [elements]);

  if (!stats) return null;

  return (
    <div style={{
      position: 'absolute', top: 12, left: 16, zIndex: 10,
      width: 250, background: 'var(--color-overlay)',
      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
      padding: '12px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Network size={14} color="var(--color-info)" />
        <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--color-text-primary)' }}>
          Network Insights
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {dbStats && (
          <InsightRow icon={Users} label="Database Total" value={`${dbStats.total_nodes} nodes · ${dbStats.total_relationships} rels`} />
        )}
        <InsightRow icon={GitMerge} label="Visible Graph" value={`${stats.nodes} nodes · ${stats.edges} rels`} />
        
        {stats.mostConnected && (
          <InsightRow 
            icon={Target} 
            label="Most Connected" 
            value={stats.mostConnected.label || 'Unknown'} 
            subValue={`${stats.maxDegree} connections`}
            highlight
          />
        )}
        
        {stats.topRel && (
          <InsightRow 
            icon={ArrowRightLeft} 
            label="Primary Relationship" 
            value={stats.topRel} 
          />
        )}
        
        {stats.hubCount > 0 && (
          <InsightRow 
            icon={GitMerge} 
            label="Structural Hubs" 
            value={`${stats.hubCount} entities (degree ≥ 3)`} 
          />
        )}
      </div>
    </div>
  );
}

function InsightRow({ icon: Icon, label, value, subValue, highlight }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <Icon size={12} color={highlight ? "var(--color-accent)" : "var(--color-text-muted)"} style={{ marginTop: 2 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginBottom: 2 }}>{label}</div>
        <div style={{ 
          fontSize: 11, fontWeight: 500, 
          color: highlight ? 'var(--color-accent)' : 'var(--color-text-primary)',
          fontFamily: 'var(--font-mono)',
          wordBreak: 'break-word',
        }}>
          {value}
        </div>
        {subValue && (
          <div style={{ fontSize: 9, color: 'var(--color-text-muted)', marginTop: 2 }}>{subValue}</div>
        )}
      </div>
    </div>
  );
}
