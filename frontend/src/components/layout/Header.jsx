import React from 'react';
import { useState } from 'react';
import styles from '../../styles/components.css';
import { checkHealth } from '../../utils/api';

const Header = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [caseId, setCaseId] = useState('FIR-2024-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);

  // Check backend status on mount
  React.useEffect(() => {
    const checkStatus = async () => {
      setBackendStatus('checking');
      try {
        await checkHealth();
        setBackendStatus('connected');
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // In a real implementation, this would trigger a search
    console.log('Searching for:', searchQuery);
    setGlobalSearchOpen(false);
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    // Trigger global search (Ctrl/Cmd+K)
    console.log('Global search for:', searchQuery);
    setGlobalSearchOpen(false);
    // In a real implementation, this would focus the search in the sidebar
    // and perform the search
  };

  // Handle Ctrl/Cmd+K for global search
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
        // Focus the search input after a short delay
        setTimeout(() => {
          const searchInput = document.getElementById('global-search-input');
          if (searchInput) searchInput.focus();
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className={`${styles['header']} flex items-center justify-between bg-panel border`}>
      <div className={`${styles['header-left']} flex items-center gap-6`}>
        <div className="text-lg font-semibold text-primary">
          Criminal Network Investigation
        </div>
        <div className="text-sm text-secondary">
          Case: <span className="font-data text-primary">{caseId}</span>
        </div>
      </div>

      <div className={`${styles['header-center']} flex items-center`}>
        <form onSubmit={handleSearch} className="relative w-full max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search entities, cases, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-elevated border border-border rounded-md text-primary placeholder-secondary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </form>
      </div>

      <div className={`${styles['header-right']} flex items-center gap-4`}>
        {/* Global Search Trigger (Ctrl/Cmd+K) */}
        <button
          onClick={() => setGlobalSearchOpen(true)}
          className="p-2 bg-elevated hover:bg-accent/20 rounded-md text-secondary"
          title="Global Search (Ctrl+K)"
        >
          <span className="font-mono">🔍</span>
        </button>

        <div className="flex items-center gap-2 text-sm">
          <div className={`flex items-center gap-1 ${backendStatus === 'connected' ? 'text-verified' : backendStatus === 'disconnected' ? 'text-anomaly' : 'text-accent'}`}>
            <div className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-verified' : backendStatus === 'disconnected' ? 'bg-anomaly' : 'bg-accent'} animate-pulse`}></div>
            <span>{backendStatus === 'connected' ? 'Online' : backendStatus === 'disconnected' ? 'Offline' : 'Checking...'}</span>
          </div>
        </div>
      </div>

      {/* Global Search Modal */}
      {globalSearchOpen && (
        <div className="fixed inset-0 bg-base/90 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-panel rounded-lg border w-96 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Global Search</h3>
              <button
                onClick={() => setGlobalSearchOpen(false)}
                className="p-1 bg-elevated hover:bg-accent/20 rounded-md text-xs"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleGlobalSearch} className="mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
                🔍
              </span>
              <input
                id="global-search-input"
                type="text"
                placeholder="Search across all entities..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-elevated border border-border rounded-md text-primary placeholder-secondary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/25 text-lg"
              />
            </form>
            <div className="text-xs text-secondary">
              Press Enter to search or Esc to cancel
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;