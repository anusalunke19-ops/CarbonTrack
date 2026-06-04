import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Lightbulb, 
  Target, 
  Users, 
  Settings, 
  LogOut,
  Leaf,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

const navItems = [
  { label: 'Main', items: [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/activity', label: 'Activity Log', icon: Activity },
  ]},
  { label: 'Insights', items: [
    { path: '/recommendations', label: 'Recommendations', icon: Lightbulb },
    { path: '/goals', label: 'Goals & Budget', icon: Target },
  ]},
  { label: 'Community', items: [
    { path: '/household', label: 'Household / Org', icon: Users },
  ]},
  { label: 'System', items: [
    { path: '/settings', label: 'Settings', icon: Settings },
  ]},
];

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'CT';

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onToggle} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)', zIndex: 99,
        display: 'none'
      }} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">🌍</div>
          <span className="sidebar-brand">CarbonTrack</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <item.icon className="nav-item-icon" size={20} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={() => navigate('/settings')}>
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role">{user?.role || 'Individual'}</div>
            </div>
          </div>
          <button 
            className="btn btn-ghost w-full mt-12" 
            onClick={handleLogout}
            style={{ justifyContent: 'flex-start', gap: '12px', padding: '10px 12px' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
