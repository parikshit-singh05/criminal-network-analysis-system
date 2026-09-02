import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Route } from 'lucide-react';
import { getEntityDisplayName, getEntityType, getEntityColor, getEntityTypeDisplay } from '../../utils/normalize';

export default function ConnectionStory({ pathData, fromEntity, toEntity, onClose, onStepClick, onClearPath }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!pathData || !pathData.path) return null;

  const { nodes, relationships, hops } = pathData.path;
  if (!nodes || nodes.length === 0) return null;

  const steps = [];
  for (let i = 0; i < nodes.length; i++) {
    steps.push({ type: 'node', data: nodes[i], index: i });
    if (i < relationships.length) {
      steps.push({ type: 'edge', data: relationships[i], index: i });
    }
  }

  const totalNodes = nodes.length;
  const canPrev = currentStep > 0;
  const canNext = currentStep < totalNodes - 1;

  const goToStep = (idx) => {
    setCurrentStep(idx);
    if (onStepClick) onStepClick(nodes[idx]);
  };

  return (
    <div style={{
      position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)',
      zIndex: 50, maxWidth: 600, width: '90%',
      background: 'var(--color-panel)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Route size={14} color="var(--color-accent)" />
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Connection Story
          </span>
          <span style={{
            fontSize: 10, color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            padding: '1px 6px', background: 'var(--color-elevated)',
            borderRadius: 2,
          }}>
            {hops} hop{hops !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={onClearPath} style={{
            fontSize: 10, padding: '3px 8px', color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
            background: 'transparent', cursor: 'pointer',
          }}>
            Clear
          </button>
          <button onClick={onClose} style={{ display: 'flex', padding: 3, color: 'var(--color-text-muted)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Path Visualization */}
      <div style={{
        display: 'flex', alignItems: 'center', padding: '12px 14px',
        overflowX: 'auto', gap: 0,
      }}>
        {steps.map((step, i) => {
          if (step.type === 'node') {
            const type = (step.data.labels || [])[0] || 'Unknown';
            const name = step.data.properties?.person_name ||
              step.data.properties?.phone_number ||
              step.data.properties?.registration_number ||
              step.data.properties?.account_number ||
              step.data.properties?.name ||
              step.data.properties?.document_id || 'Unknown';
            const color = getEntityColor(type);
            const isActive = step.index === currentStep;

            return (
              <div key={`node-${i}`} onClick={() => goToStep(step.index)} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '4px 8px', cursor: 'pointer', flexShrink: 0,
                borderRadius: 'var(--radius-sm)',
                background: isActive ? 'var(--color-accent-dim)' : 'transparent',
                border: isActive ? '1px solid var(--color-accent)' : '1px solid transparent',
                transition: 'all var(--transition-fast)', minWidth: 70,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `${color}33`, border: `2px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color,
                  marginBottom: 4,
                }}>
                  {step.index + 1}
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 500, color: 'var(--color-text-primary)',
                  maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', textAlign: 'center',
                }}>
                  {name}
                </div>
                <div style={{
                  fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.3,
                  color: 'var(--color-text-muted)',
                }}>
                  {getEntityTypeDisplay(type)}
                </div>
              </div>
            );
          } else {
            return (
              <div key={`edge-${i}`} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '0 2px', flexShrink: 0,
              }}>
                <div style={{
                  width: 40, height: 1, background: 'var(--color-accent)', opacity: 0.5,
                }} />
                <div style={{
                  fontSize: 8, color: 'var(--color-accent)', marginTop: 2,
                  whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)',
                }}>
                  {step.data.type}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Navigation */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '8px 14px', borderTop: '1px solid var(--color-border)',
      }}>
        <button onClick={() => canPrev && goToStep(currentStep - 1)} disabled={!canPrev} style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 10px', fontSize: 10,
          color: canPrev ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
          background: 'transparent', cursor: canPrev ? 'pointer' : 'default',
          opacity: canPrev ? 1 : 0.4,
        }}>
          <ChevronLeft size={12} /> Previous
        </button>
        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
          Step {currentStep + 1} of {totalNodes}
        </span>
        <button onClick={() => canNext && goToStep(currentStep + 1)} disabled={!canNext} style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '3px 10px', fontSize: 10,
          color: canNext ? 'var(--color-text-secondary)' : 'var(--color-text-muted)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
          background: 'transparent', cursor: canNext ? 'pointer' : 'default',
          opacity: canNext ? 1 : 0.4,
        }}>
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
