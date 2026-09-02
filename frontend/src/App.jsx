import React from 'react';
import './styles/base.css';
import './styles/components.css';
import './styles/responsive.css';
import MainLayout from './components/layout/MainLayout';

// Import the CSS variables to ensure they're loaded
import './styles/variables.css';

function App() {
  return (
    <div className="min-h-screen bg-base text-primary">
      <MainLayout>
        {/* The main content will be loaded here from other components */}
        {/* For now, we'll leave it empty as the GraphPanel handles its own state */}
      </MainLayout>
    </div>
  );
}

export default App;