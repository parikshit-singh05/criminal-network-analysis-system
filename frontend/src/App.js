import React, { useState, useEffect } from 'react';
import InvestigationWorkspace from './components/layout/InvestigationWorkspace';

function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return <InvestigationWorkspace theme={theme} toggleTheme={toggleTheme} />;
}

export default App;
