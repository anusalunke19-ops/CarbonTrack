import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Calendar, Plus, Award, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useActivities } from '../context/ActivityContext';
import { useToast } from '../context/ToastContext';
import { goalsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Goals() {
  const { activities } = useActivities();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();

  const [goals, setGoals] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // New goal form states
  const [name, setName] = useState('');
  const [type, setType] = useState('Monthly Budget');
  const [targetValue, setTargetValue] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');

  const fetchGoals = async () => {
    if (!user) return;
    try {
      const data = await goalsAPI.getAll(user.id);
      setGoals(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  // Calculate dynamic progress for each goal based on overlapping activities
  const goalsWithProgress = useMemo(() => {
    return goals.map(g => {
      const start = new Date(g.startDate);
      const end = new Date(g.endDate);
      
      const totalInPeriod = activities
        .filter(a => {
          const d = new Date(a.date);
          return d >= start && d <= end;
        })
        .reduce((sum, a) => sum + (a.co2e || 0), 0);

      const percent = g.targetValue > 0 ? (totalInPeriod / g.targetValue) * 100 : 0;
      
      // Determine status
      let status = 'on-track';
      if (percent >= 80 && percent < 100) status = 'at-risk';
      else if (percent >= 100) status = 'exceeded';

      return {
        ...g,
        currentValue: totalInPeriod,
        percent: Number(percent.toFixed(1)),
        status
      };
    });
  }, [goals, activities]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !targetValue || !startDate || !endDate) {
      addToast('Please fill out all required fields', 'warning');
      return;
    }

    try {
      await goalsAPI.create({
        userId: user.id,
        name,
        type,
        targetValue: Number(targetValue),
        startDate,
        endDate,
        description
      });
      addToast('Ecosystem Goal established!', 'success');
      setModalOpen(false);
      fetchGoals();
      
      // Clear forms
      setName('');
      setDescription('');
      setTargetValue('');
    } catch (err) {
      addToast('Error establishing target.', 'error');
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await goalsAPI.delete(id);
      addToast('Goal deleted', 'success');
      fetchGoals();
    } catch (e) {
      addToast('Error removing goal', 'error');
    }
  };

  return (
    <div className="goals-view">
      {/* Top Banner */}
      <div className="flex justify-between items-center mb-24">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Ecosystem Targets & Goals</h2>
          <p className="topbar-subtitle">Configure carbon budgets and analyze consumption thresholds</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Establish Target
        </button>
      </div>

      {/* Grid of cards */}
      {loading ? (
        <div className="skeleton" style={{ height: '200px', width: '100%' }} />
      ) : goalsWithProgress.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-state-icon">🎯</div>
          <h3>No goals established yet</h3>
          <p>Establish a monthly carbon budget or travel reduction threshold.</p>
        </div>
      ) : (
        <div className="goals-grid">
          {goalsWithProgress.map((g) => (
            <div key={g.id} className="goal-card glass-card">
              <div className="goal-header">
                <div>
                  <h4 className="goal-title">{g.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{g.type}</span>
                </div>
                <span className={`goal-status ${g.status}`}>
                  {g.status.replace('-', ' ')}
                </span>
              </div>

              {/* Progress Ring Visuals */}
              <div className="goal-progress-section">
                <div className="progress-ring">
                  <svg width="80" height="80">
                    <circle 
                      cx="40" cy="40" r="34" 
                      stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                      strokeWidth="6" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="40" cy="40" r="34" 
                      stroke={g.status === 'on-track' ? (theme === 'dark' ? '#a3e635' : '#4d7c0f') : g.status === 'at-risk' ? '#f59e0b' : '#ef4444'}
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - Math.min(100, g.percent) / 100)}
                    />
                  </svg>
                  <div className="progress-ring-text" style={{ fontSize: '0.85rem' }}>{Math.floor(g.percent)}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Current Accumulation</div>
                  <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
                    {g.currentValue.toFixed(1)} / {g.targetValue} kg
                  </div>
                </div>
              </div>

              {/* Goal parameters */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>{g.description}</p>
              
              <div className="goal-details">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} /> {g.endDate}
                </span>
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDeleteGoal(g.id)}
                  style={{ color: 'var(--accent-danger)', padding: 0 }}
                >
                  Remove Target
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gamification / Badges Section */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginTop: '40px', marginBottom: '16px' }}>
        Unlocked Environmental Milestones 🏆
      </h3>
      <div className="goals-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="stat-icon green" style={{ fontSize: '1.5rem', flexShrink: 0 }}><Award /></div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Low Carbon Pilot</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Maintained daily average under 12kg CO2e for 7 days.</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="stat-icon blue" style={{ fontSize: '1.5rem', flexShrink: 0 }}><Award /></div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Ecosystem Commuter</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Logged 5 zero-emission travel routes.</p>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="stat-icon purple" style={{ fontSize: '1.5rem', flexShrink: 0 }}><Award /></div>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Green Consumer</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Maintained goods budget below targets for 3 weeks.</p>
          </div>
        </div>
      </div>

      {/* Goal Creation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <motion.div 
              className="modal" 
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <h3 className="modal-title">Establish Ecosystem Target</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group mb-16">
                    <label className="form-label">Goal Label / Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Daily Commute Budget"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-16">
                    <label className="form-label">Budget Range Type</label>
                    <select 
                      className="form-select"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="Monthly Budget">Monthly Budget</option>
                      <option value="Yearly Target">Yearly Target</option>
                      <option value="Pillar Reduction">Pillar Reduction</option>
                    </select>
                  </div>

                  <div className="form-group mb-16">
                    <label className="form-label">Target Ceiling Value (kg CO₂e)</label>
                    <input 
                      type="number" 
                      className="form-input" 
                      placeholder="e.g. 400"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }} className="mb-16">
                    <div className="form-group">
                      <label className="form-label">Start Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description / Objective</label>
                    <textarea 
                      className="form-input" 
                      placeholder="Objectives for this carbon target..."
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Confirm Target</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
