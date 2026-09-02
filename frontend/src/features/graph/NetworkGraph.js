import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle, useState } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { getEntityColor, getRelColor } from '../../utils/normalize';
import { Network } from 'lucide-react';
import { EmptyState } from '../../components/common/States';

let extensionRegistered = false;
if (!extensionRegistered) {
  cytoscape.use(coseBilkent);
  extensionRegistered = true;
}

const LAYOUT_OPTIONS = {
  name: 'cose-bilkent',
  quality: 'default',
  nodeRepulsion: 6500,
  idealEdgeLength: 100,
  edgeElasticity: 0.45,
  nestingFactor: 0.1,
  gravity: 0.25,
  numIter: 2500,
  tile: true,
  animate: 'end',
  animationDuration: 400,
  randomize: true,
  fit: true,
  padding: 40,
};

const NODE_COLORS = {
  Person: '#C98A3B',
  Phone: '#5B7FA6',
  Vehicle: '#8B6DB0',
  BankAccount: '#4C8C7D',
  Organization: '#B5544B',
  Location: '#6B9E78',
  Document: '#838C99',
  Email: '#5B7FA6',
  Case: '#C98A3B',
};

function getNodeColor(type) {
  return NODE_COLORS[type] || '#838C99';
}

function getCyStyle(theme) {
  const isLight = theme === 'light';
  
  const textColor = isLight ? '#4B5563' : '#E4E7EC';
  const textOutlineColor = isLight ? '#FFFFFF' : '#0E1116';
  const mutedColor = isLight ? '#6B7280' : '#838C99';
  const focusEdgeColor = isLight ? '#111827' : '#E4E7EC';
  const highlightColor = '#C98A3B'; // same in both

  return [
    // ── NODES ──
    {
      selector: 'node',
      style: {
        'shape': 'ellipse',
        'width': function (ele) { return Math.min(50, 24 + (ele.data('degree') || 1) * 2); },
        'height': function (ele) { return Math.min(50, 24 + (ele.data('degree') || 1) * 2); },
        'background-color': function (ele) { return getNodeColor(ele.data('type')); },
        'background-opacity': 0.85,
        'border-width': 2,
        'border-color': function (ele) { return getNodeColor(ele.data('type')); },
        'border-opacity': 0.6,
        'label': function (ele) {
          const label = ele.data('label') || '';
          return label.length > 18 ? label.substring(0, 16) + '...' : label;
        },
        'font-size': 8,
        'font-weight': 400,
        'font-family': 'Inter, sans-serif',
        'color': textColor,
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 4,
        'text-outline-color': textOutlineColor,
        'text-outline-width': 1.5,
        'text-max-width': '70px',
        'text-wrap': 'ellipsis',
        'overlay-opacity': 0,
        'transition-property': 'opacity, border-width, border-color, width, height',
        'transition-duration': '200ms',
      },
    },

    // ── EDGES (default) ──
    {
      selector: 'edge',
      style: {
        'width': 1.5,
        'line-color': function (ele) { return getRelColor(ele.data('label')); },
        'target-arrow-color': function (ele) { return getRelColor(ele.data('label')); },
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.8,
        'curve-style': 'bezier',
        'label': '',
        'text-opacity': 0,
        'font-size': 8,
        'font-weight': 400,
        'font-family': 'Inter, sans-serif',
        'color': mutedColor,
        'text-rotation': 'autorotate',
        'text-outline-color': textOutlineColor,
        'text-outline-width': 1.5,
        'overlay-opacity': 0,
      },
    },

    // ── EDGE: global "show all labels" toggle ──
    {
      selector: 'edge.show-labels',
      style: {
        'label': function (ele) { return ele.data('label') || ''; },
        'text-opacity': 1,
      }
    },

    // ── EDGE: hover ──
    {
      selector: 'edge:active',
      style: {
        'label': function (ele) { return ele.data('label') || ''; },
        'width': 2.5,
        'line-color': focusEdgeColor,
        'target-arrow-color': focusEdgeColor,
        'text-opacity': 1,
        'z-index': 99,
      }
    },

    // ── NODE: selected ──
    {
      selector: 'node:selected',
      style: {
        'border-width': 4,
        'border-color': function (ele) { return getNodeColor(ele.data('type')); },
        'border-opacity': 1,
        'underlay-color': focusEdgeColor,
        'underlay-padding': 4,
        'underlay-opacity': 0.15,
        'width': function (ele) { return Math.min(56, 30 + (ele.data('degree') || 1) * 2); },
        'height': function (ele) { return Math.min(56, 30 + (ele.data('degree') || 1) * 2); },
        'z-index': 999,
      },
    },

    // ── EDGE: selected ──
    {
      selector: 'edge:selected',
      style: {
        'label': function (ele) { return ele.data('label') || ''; },
        'width': 2.5,
        'line-color': focusEdgeColor,
        'target-arrow-color': focusEdgeColor,
        'text-opacity': 1,
        'color': focusEdgeColor,
        'z-index': 998,
      },
    },

    // ── NODE: highlighted (path tracing) ──
    {
      selector: 'node.highlighted',
      style: {
        'border-width': 4,
        'border-color': function (ele) { return getNodeColor(ele.data('type')); },
        'border-opacity': 1,
        'underlay-color': highlightColor,
        'underlay-padding': 4,
        'underlay-opacity': 0.2,
        'z-index': 999,
      },
    },

    // ── EDGE: highlighted (path tracing) ──
    {
      selector: 'edge.highlighted',
      style: {
        'label': function (ele) { return ele.data('label') || ''; },
        'width': 2.5,
        'line-color': highlightColor,
        'target-arrow-color': highlightColor,
        'text-opacity': 1,
        'z-index': 998,
      },
    },

    // ── DIMMED (unrelated elements) ──
    {
      selector: '.dimmed',
      style: {
        'opacity': 0.15,
      },
    },
    {
      selector: 'edge.dimmed',
      style: {
        'opacity': 0.1,
        'label': '',
        'text-opacity': 0,
      },
    },

    // ── NODE: focused (investigation neighborhood) ──
    {
      selector: 'node.focused',
      style: {
        'border-width': 3,
        'border-color': function (ele) { return getNodeColor(ele.data('type')); },
        'underlay-color': focusEdgeColor,
        'underlay-padding': 3,
        'underlay-opacity': 0.1,
        'z-index': 100,
      }
    },

    // ── EDGE: focused ──
    {
      selector: 'edge.focused',
      style: {
        'label': function (ele) { return ele.data('label') || ''; },
        'width': 2.5,
        'line-color': focusEdgeColor,
        'target-arrow-color': focusEdgeColor,
        'text-opacity': 1,
        'color': focusEdgeColor,
        'z-index': 100,
      }
    },

    // ── EDGE: show-labels-local (selected node's edges) ──
    {
      selector: 'edge.show-labels-local',
      style: {
        'label': function (ele) { return ele.data('label') || ''; },
        'width': 2.5,
        'line-color': focusEdgeColor,
        'target-arrow-color': focusEdgeColor,
        'text-opacity': 1,
        'color': focusEdgeColor,
        'z-index': 99,
      }
    },

    // ── NODE: hub ──
    {
      selector: 'node.hub',
      style: {
        'border-width': 3,
        'border-color': function (ele) { return getNodeColor(ele.data('type')); },
        'border-style': 'double',
      }
    }
  ];
}

const NetworkGraph = forwardRef(function NetworkGraph({
  elements, selectedEntityId, pathHighlight, focusMode,
  importantMode, showLabels, theme,
  onNodeSelect, onEdgeSelect, onNodeDoubleClick, onBackgroundClick,
}, ref) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const tooltipRef = useRef(null);
  const prevElementsRef = useRef([]);
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize Cytoscape once
  useEffect(() => {
    if (!containerRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      style: getCyStyle(theme),
      elements: [],
      minZoom: 0.1,
      maxZoom: 5,
      wheelSensitivity: 0.2,
      boxSelectionEnabled: false,
    });

    cyRef.current = cy;

    // Tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute; pointer-events: none; z-index: 9999;
      background: var(--color-elevated); border: 1px solid var(--color-border);
      padding: 8px 10px; border-radius: var(--radius-sm); font-size: 12px;
      font-family: var(--font-sans); color: var(--color-text-primary);
      max-width: 220px; display: none; line-height: 1.4;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `;
    containerRef.current.appendChild(tooltip);
    tooltipRef.current = tooltip;

    // Event handlers
    cy.on('tap', 'node', (e) => {
      const data = e.target.data();
      onNodeSelect?.(data);
    });

    cy.on('tap', 'edge', (e) => {
      const data = e.target.data();
      onEdgeSelect?.(data);
    });

    cy.on('tap', (e) => {
      if (e.target === cy) onBackgroundClick?.();
    });

    cy.on('dbltap', 'node', (e) => {
      const data = e.target.data();
      onNodeDoubleClick?.(data);
    });

    cy.on('mouseover', 'node', (e) => {
      const node = e.target;
      const data = node.data();
      const pos = node.renderedPosition();
      const label = data.label || 'Unknown';
      const type = data.type || 'Unknown';
      const props = [];
      if (data.person_name && data.age) props.push(`Age: ${data.age}`);
      if (data.phone_number) props.push(data.phone_number);
      if (data.registration_number) props.push(data.registration_number);
      if (data.account_number) props.push(data.account_number);
      const degree = node.degree();

      tooltip.innerHTML = `
        <div style="font-weight:600;margin-bottom:3px">${label}</div>
        <div style="font-size:10px;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px">${type}</div>
        ${props.map(p => `<div style="font-size:11px;color:var(--color-text-secondary);font-family:var(--font-mono)">${p}</div>`).join('')}
        <div style="font-size:10px;color:var(--color-text-muted);margin-top:3px">${degree} connection${degree !== 1 ? 's' : ''}</div>
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = (pos.x + 20) + 'px';
      tooltip.style.top = (pos.y - 10) + 'px';
    });

    cy.on('mouseout', 'node', () => {
      tooltip.style.display = 'none';
    });

    // Edge hover tooltip
    cy.on('mouseover', 'edge', (e) => {
      const edge = e.target;
      const data = edge.data();
      const relColor = getRelColor(data.label);
      const pos = e.renderedPosition;
      tooltip.innerHTML = `
        <div style="font-size:10px;font-weight:600;color:${relColor};text-transform:uppercase;letter-spacing:0.5px">${data.label}</div>
      `;
      tooltip.style.display = 'block';
      tooltip.style.left = (pos.x + 15) + 'px';
      tooltip.style.top = (pos.y - 15) + 'px';
    });

    cy.on('mouseout', 'edge', () => {
      tooltip.style.display = 'none';
    });

    cy.on('pan zoom', () => {
      tooltip.style.display = 'none';
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update Cytoscape style when theme changes
  useEffect(() => {
    if (cyRef.current) {
      cyRef.current.style(getCyStyle(theme));
      
      // We must re-apply imperative styles for focus/labels if they are active
      // because re-assigning the stylesheet resets inline styles.
      // But actually cy.style() updates the *stylesheet*, which shouldn't override inline styles...
      // Let's just update the stylesheet.
    }
  }, [theme]);

  // Update elements
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || !elements) return;

    setIsEmpty(elements.length === 0);

    const prevIds = new Set(prevElementsRef.current.map(e => e.data.id));
    const newIds = new Set(elements.map(e => e.data.id));

    // Remove elements no longer present
    const toRemove = [];
    cy.elements().forEach(ele => {
      if (!newIds.has(ele.data('id'))) {
        toRemove.push(ele);
      }
    });

    // Add new elements
    const toAdd = elements.filter(e => !prevIds.has(e.data.id));

    if (toRemove.length > 0) cy.remove(cy.collection(toRemove));
    if (toAdd.length > 0) {
      cy.add(toAdd);
    }

    // ── FORCE edge styling after add ──
    // This guarantees colors and hidden labels regardless of stylesheet evaluation
    cy.edges().forEach(edge => {
      const relType = edge.data('label');
      const color = getRelColor(relType);
      edge.style({
        'line-color': color,
        'target-arrow-color': color,
        'label': '',
        'text-opacity': 0,
      });
    });

    // Update degrees for all nodes so sizes adjust
    cy.nodes().forEach(n => {
      n.data('degree', n.degree());
    });

    // Compute hubs (top 5% by degree, min 3)
    const nodes = cy.nodes();
    if (nodes.length > 0) {
      nodes.removeClass('hub');
      const degrees = nodes.map(n => n.degree()).sort((a, b) => a - b);
      const p95Idx = Math.floor(degrees.length * 0.95);
      const hubThreshold = Math.max(3, degrees[p95Idx]);
      nodes.filter(n => n.degree() >= hubThreshold).addClass('hub');
    }

    // Run layout if significant changes
    if (toAdd.length > 3 || (prevElementsRef.current.length === 0 && elements.length > 0)) {
      try {
        cy.layout({ ...LAYOUT_OPTIONS, animate: elements.length < 100 ? 'end' : false }).run();
      } catch (err) {
        cy.layout({ name: 'cose', animate: false }).run();
      }
    }

    prevElementsRef.current = elements;
  }, [elements]);

  // Handle selection & focus
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().unselect();
    cy.elements().removeClass('dimmed focused show-labels-local');

    // Reset ALL edges back to their relationship-type colors and hide labels
    cy.edges().forEach(edge => {
      const relType = edge.data('label');
      const color = getRelColor(relType);
      edge.style({
        'line-color': color,
        'target-arrow-color': color,
        'label': '',
        'text-opacity': 0,
        'width': 1.5,
      });
    });

    const focusEdgeColor = theme === 'light' ? '#111827' : '#E4E7EC';

    if (selectedEntityId) {
      const node = cy.getElementById(selectedEntityId);
      if (node.length > 0) {
        node.select();

        const neighborhood = node.neighborhood().add(node);

        // Show labels and highlight connected edges with SINGLE focus color
        node.connectedEdges().forEach(edge => {
          edge.style({
            'line-color': focusEdgeColor,
            'target-arrow-color': focusEdgeColor,
            'label': edge.data('label') || '',
            'text-opacity': 1,
            'color': focusEdgeColor,
            'width': 2.5,
          });
        });
        node.connectedEdges().addClass('show-labels-local');

        // Dim unrelated elements
        cy.elements().not(neighborhood).addClass('dimmed');

        if (focusMode) {
          neighborhood.addClass('focused');
          cy.animate({ center: { eles: node }, zoom: 1.5 }, { duration: 400 });
        }
      }
    }
  }, [selectedEntityId, focusMode, theme]);

  // Handle important mode and global labels
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (showLabels) {
      cy.edges().forEach(edge => {
        edge.style({
          'label': edge.data('label') || '',
          'text-opacity': 1,
        });
      });
    } else if (!selectedEntityId) {
      // Only hide labels if no node is selected
      cy.edges().forEach(edge => {
        edge.style({
          'label': '',
          'text-opacity': 0,
        });
      });
    }

    if (importantMode) {
      const lowDegree = cy.nodes().filter(n => n.degree() === 1 && n.id() !== selectedEntityId);
      const relatedEdges = lowDegree.connectedEdges();
      lowDegree.union(relatedEdges).addClass('dimmed');
    } else if (!focusMode && !pathHighlight) {
      cy.elements().removeClass('dimmed');
    }

  }, [showLabels, importantMode, focusMode, pathHighlight, selectedEntityId]);

  // Handle path highlight
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    if (pathHighlight) {
      cy.elements().removeClass('highlighted dimmed focused');

      const { nodeIds, edgeIds } = pathHighlight;
      const pathNodes = cy.collection();
      const pathEdges = cy.collection();

      nodeIds?.forEach(id => {
        const n = cy.getElementById(id);
        if (n.length) pathNodes.merge(n);
      });
      edgeIds?.forEach(id => {
        const e = cy.getElementById(id);
        if (e.length) pathEdges.merge(e);
      });

      const pathElements = pathNodes.union(pathEdges);
      pathElements.addClass('highlighted');
      cy.elements().not(pathElements).addClass('dimmed');

      if (pathNodes.length > 0) {
        cy.animate({ fit: { eles: pathNodes, padding: 60 } }, { duration: 500 });
      }
    } else if (!focusMode && !importantMode) {
      cy.elements().removeClass('highlighted dimmed focused');
    }
  }, [pathHighlight, focusMode, importantMode]);

  // Expose methods
  useImperativeHandle(ref, () => ({
    fitGraph: () => {
      cyRef.current?.fit(undefined, 40);
    },
    centerOnNode: (nodeId) => {
      const cy = cyRef.current;
      if (!cy) return;
      const node = cy.getElementById(nodeId);
      if (node.length > 0) {
        cy.animate({ center: { eles: node }, zoom: 1.8 }, { duration: 400 });
      }
    },
    zoomIn: () => {
      const cy = cyRef.current;
      if (cy) cy.zoom({ level: cy.zoom() * 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    },
    zoomOut: () => {
      const cy = cyRef.current;
      if (cy) cy.zoom({ level: cy.zoom() / 1.3, renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 } });
    },
    runLayout: () => {
      cyRef.current?.layout(LAYOUT_OPTIONS).run();
    },
    resetView: () => {
      const cy = cyRef.current;
      if (cy) {
        cy.elements().removeClass('dimmed highlighted focused show-labels-local');
        // Restore default edge colors
        cy.edges().forEach(edge => {
          const relType = edge.data('label');
          const color = getRelColor(relType);
          edge.style({
            'line-color': color,
            'target-arrow-color': color,
            'label': '',
            'text-opacity': 0,
            'width': 1.5,
          });
        });
        cy.fit(undefined, 40);
      }
    },
    getCy: () => cyRef.current,
  }));

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'var(--color-base)' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {isEmpty && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <EmptyState icon={Network} title="No graph data" description="Search for an entity or load the network to begin investigation" />
        </div>
      )}
    </div>
  );
});

export default NetworkGraph;
