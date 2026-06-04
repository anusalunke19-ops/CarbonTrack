import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useState } from 'react';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your carbon footprint overview' },
  '/activity': { title: 'Activity Log', subtitle: 'Track and manage your activities' },
  '/recommendations': { title: 'Recommendations', subtitle: 'AI-powered carbon reduction tips' },
  '/goals': { title: 'Goals & Budget', subtitle: 'Set and track your carbon targets' },
  '/household': { title: 'Household & Organisation', subtitle: 'Team carbon management' },
  '/settings': { title: 'Settings', subtitle: 'Manage your account and preferences' },
};

export default function AppLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPage = pageTitles[location.pathname] || { title: 'CarbonTrack', subtitle: '' };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <main className="main-content">
        <TopBar 
          title={currentPage.title} 
          subtitle={currentPage.subtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
