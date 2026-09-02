import React, { useRef, useEffect } from 'react';
import { Shield, Search, X, Activity } from 'lucide-react';

export default function TopBar({ searchValue, onSearchChange, onSearchSubmit, apiStatus }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        inputRef.current.blur();
        onSearchChange('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onSearchChange]);

  const statusColor = apiStatus === 'healthy' ? 'var(--color-verified)' :
    apiStatus === 'unhealthy' ? 'var(--color-anomaly)' : 'var(--color-text-muted)';

  return (
    <header style={{
      height: 48, display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 16,
      background: 'var(--color-panel)',
      borderBottom: '1px solid var(--color-border)',
      zIndex: 100, flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <Shield size={18} color="var(--color-accent)" />
        <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: 'var(--color-text-primary)' }}>
          CNAS
        </span>
        <span style={{
          fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: 0.3,
          display: 'none',
        }} className="brand-sub">
          Criminal Network Analysis
        </span>
      </div>

      {/* Search */}
      <div style={{
        flex: 1, maxWidth: 480, display: 'flex', alignItems: 'center',
        background: 'var(--color-base)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)', padding: '0 10px', height: 32,
        transition: 'border-color var(--transition-fast)',
      }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-accent)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
      >
        <Search size={14} color="var(--color-text-muted)" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search entities... (Ctrl+K)"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearchSubmit(searchValue);
          }}
          style={{
            flex: 1, padding: '0 8px', fontSize: 12,
            background: 'transparent', color: 'var(--color-text-primary)',
          }}
        />
        {searchValue && (
          <button onClick={() => onSearchChange('')}
            style={{ display: 'flex', padding: 2 }}>
            <X size={13} color="var(--color-text-muted)" />
          </button>
        )}
        <kbd style={{
          fontSize: 10, color: 'var(--color-text-muted)',
          padding: '1px 4px', border: '1px solid var(--color-border)',
          borderRadius: 2, fontFamily: 'var(--font-mono)',
          marginLeft: 4, lineHeight: '14px',
        }}>
          /
        </kbd>
      </div>

      {/* Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--color-text-secondary)' }}>
          <Activity size={13} color={statusColor} />
          <span style={{ color: statusColor }}>
            {apiStatus === 'healthy' ? 'Connected' : apiStatus === 'unhealthy' ? 'Offline' : 'Checking...'}
          </span>
        </div>
      </div>
    </header>
  );
}
