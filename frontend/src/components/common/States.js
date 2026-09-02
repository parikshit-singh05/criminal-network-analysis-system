import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function LoadingState({ message = 'Loading...', size = 'md' }) {
  const s = size === 'sm' ? 16 : size === 'lg' ? 32 : 22;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: size === 'sm' ? '8px' : '24px',
      color: 'var(--color-text-secondary)', fontSize: 12,
    }}>
      <div style={{
        width: s, height: s,
        border: '2px solid var(--color-border)',
        borderTopColor: 'var(--color-accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong', detail, onRetry, compact }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: compact ? 6 : 12,
      padding: compact ? '12px' : '24px', textAlign: 'center',
    }}>
      <AlertTriangle size={compact ? 18 : 24} color="var(--color-anomaly)" />
      <div style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{message}</div>
      {detail && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', maxWidth: 280 }}>{detail}</div>}
      {onRetry && (
        <button onClick={onRetry} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 12px', fontSize: 11, color: 'var(--color-text-secondary)',
          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-elevated)', cursor: 'pointer', marginTop: 4,
        }}>
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title = 'No data', description, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 10, padding: '32px 16px', textAlign: 'center',
    }}>
      {Icon && <Icon size={28} color="var(--color-text-muted)" strokeWidth={1.5} />}
      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{title}</div>
      {description && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', maxWidth: 220 }}>{description}</div>}
      {action && (
        <button onClick={action.onClick} style={{
          padding: '5px 14px', fontSize: 11, color: 'var(--color-accent)',
          border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-accent-dim)', cursor: 'pointer', marginTop: 4,
        }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
