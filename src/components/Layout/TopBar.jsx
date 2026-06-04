import { Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function TopBar({ title, subtitle, onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const [notifications] = useState([
    { id: 1, message: 'You reached 80% of your monthly carbon budget!', type: 'warning' },
    { id: 2, message: 'New recommendation: Switch to LED bulbs', type: 'info' },
  ]);
  const [showNotifs, setShowNotifs] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="hamburger" onClick={onMenuClick}>
          <span /><span /><span />
        </button>
        <div>
          <h1 className="topbar-title">{title}</h1>
          {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <Search size={16} color="#6e7681" />
          <input type="text" placeholder="Search activities, tips..." />
        </div>
        
        <button 
          className="notification-btn" 
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          style={{ marginRight: '8px' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div style={{ position: 'relative' }}>
          <button 
            className="notification-btn" 
            onClick={() => setShowNotifs(!showNotifs)}
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="notification-badge" />}
          </button>

          {showNotifs && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              width: '320px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              overflow: 'hidden'
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem' }}>Notifications</h4>
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{
                  padding: '12px 20px',
                  borderBottom: '1px solid rgba(48, 54, 61, 0.3)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.02)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {n.type === 'warning' ? '⚠️' : 'ℹ️'} {n.message}
                </div>
              ))}
              {notifications.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
