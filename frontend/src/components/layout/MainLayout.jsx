import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import GraphPanel from './GraphPanel';
import RightPanel from './RightPanel';
import BottomPanel from './BottomPanel';
import styles from '../../styles/components.css';

const MainLayout = ({ children }) => {
  return (
    <div className={`${styles['main-layout']} flex flex-col min-h-screen`}>
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <GraphPanel>{children}</GraphPanel>
          <RightPanel />
        </div>
      </div>
      <BottomPanel />
    </div>
  );
};

export default MainLayout;