import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useActivities } from '../context/ActivityContext';
import { useToast } from '../context/ToastContext';
import { exportAPI } from '../services/api';
import { Download, Trash2, ShieldAlert, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { user } = useAuth();
  const { clearAllActivities, loadSampleData } = useActivities();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  const handleLoadSampleData = async () => {
    try {
      await loadSampleData();
      addToast('30-day activity database prepopulated successfully!', 'success');
    } catch (e) {
      addToast('Failed to prepopulate sample data.', 'error');
    }
  };

  const [notif1, setNotif1] = useState(true);
  const [notif2, setNotif2] = useState(true);
  const [notif3, setNotif3] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    try {
      const blob = await exportAPI.generateCSV(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CarbonTrack_MyData_${user.name.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast('Your activity database export is ready!', 'success');
    } catch (e) {
      addToast('Data export failed.', 'error');
    }
  };

  const handleWipeData = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete all logged activity entries? This action cannot be undone.')) {
      await clearAllActivities();
      addToast('All carbon activity logs have been wiped from memory.', 'info');
    }
  };

  return (
    <div className="settings-view" style={{ maxWidth: '800px' }}>
      {/* Profile summary */}
      <div className="settings-section">
        <h3 className="settings-section-title">User Account Specifications</h3>
        <div className="glass-card-static" style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span className="form-label" style={{ display: 'block', fontSize: '0.78rem' }}>Name / Organisation</span>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{user?.name || 'Ananya Salunke'}</span>
            </div>
            <div>
              <span className="form-label" style={{ display: 'block', fontSize: '0.78rem' }}>Register Email</span>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{user?.email || 'demo@carbontrack.com'}</span>
            </div>
            <div>
              <span className="form-label" style={{ display: 'block', fontSize: '0.78rem' }}>Account Role Class</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{user?.role || 'Individual'}</span>
            </div>
            <div>
              <span className="form-label" style={{ display: 'block', fontSize: '0.78rem' }}>Calculation Unit</span>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>Metric (kg CO₂e)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="settings-section">
        <h3 className="settings-section-title">Threshold Alert Specifications</h3>
        <div className="glass-card-static" style={{ padding: '0 20px' }}>
          <div className="settings-row">
            <div>
              <div className="settings-label">80% Budget Notifications</div>
              <div className="settings-desc">Alert immediately via toast/mail when approaching budget targets.</div>
            </div>
            <div 
              className={`toggle ${notif1 ? 'active' : ''}`} 
              onClick={() => setNotif1(!notif1)} 
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Ecosystem Target Milestone Alerts</div>
              <div className="settings-desc">Acquire gamification badges and environmental targets metrics.</div>
            </div>
            <div 
              className={`toggle ${notif2 ? 'active' : ''}`} 
              onClick={() => setNotif2(!notif2)} 
            />
          </div>

          <div className="settings-row">
            <div>
              <div className="settings-label">Dual-Path Weekly Carbon Reports</div>
              <div className="settings-desc">Weekly summaries of your total ecological footprints.</div>
            </div>
            <div 
              className={`toggle ${notif3 ? 'active' : ''}`} 
              onClick={() => setNotif3(!notif3)} 
            />
          </div>
        </div>
      </div>

      {/* Preferences display */}
      <div className="settings-section">
        <h3 className="settings-section-title">Visual Layout Preferences</h3>
        <div className="glass-card-static" style={{ padding: '0 20px' }}>
          <div className="settings-row">
            <div>
              <div className="settings-label">Dark Theme Display</div>
              <div className="settings-desc">Optimise interface rendering for OLED and dark panels.</div>
            </div>
            <div 
              className={`toggle ${theme === 'dark' ? 'active' : ''}`} 
              onClick={toggleTheme} 
            />
          </div>
        </div>
      </div>

      {/* Data wiping and deletions */}
      <div className="settings-section">
        <h3 className="settings-section-title" style={{ color: 'var(--accent-danger)' }}>Ecosystem Operations</h3>
        <div className="glass-card-static" style={{ padding: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Operations in this section permanently alter stored databases. Download backup sets before executing.
          </p>
          <div className="flex gap-12" style={{ gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleExport}>
              <Download size={16} /> Export My Database
            </button>
            <button className="btn btn-primary" onClick={handleLoadSampleData}>
              ⚡ Prepopulate Sample Data
            </button>
            <button className="btn btn-danger" onClick={handleWipeData}>
              <Trash2 size={16} /> Wipe Log Database
            </button>
          </div>
        </div>
      </div>

      {/* Team Details & SEPM Credits */}
      <div className="settings-section" style={{ marginTop: '40px' }}>
        <h3 className="settings-section-title">Academic & SEPM Specifications</h3>
        <div className="glass-card-static" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div className="stat-icon purple" style={{ flexShrink: 0 }}><Award /></div>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>
                Course: Software Engineering and Project Management
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                Project developed and submitted in June 2026 for Sprint Batch C1.
              </p>
              <div style={{
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px 20px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)'
              }}>
                <div>• Ananya Salunke (24B-CO-006)</div>
                <div>• Dellia Souza (24-CO-018)</div>
                <div>• Gangavarapu Kaarthikeya (24B-CO-022)</div>
                <div>• Herluino Carvalho (24B-CO-026)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
