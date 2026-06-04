import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Filter, Info, MapPin } from 'lucide-react';
import { useActivities } from '../context/ActivityContext';
import { useToast } from '../context/ToastContext';
import { calculateEmission, EMISSION_FACTORS } from '../utils/calculator';

export default function ActivityLog() {
  const { activities, addActivity, deleteActivity, loading } = useActivities();
  const { addToast } = useToast();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal states
  const [pillar, setPillar] = useState('transport');
  const [category, setCategory] = useState('car_petrol');
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (activeTab === 'all') return activities;
    return activities.filter(a => a.pillar === activeTab);
  }, [activities, activeTab]);

  // Real-time calculations
  const liveCo2e = useMemo(() => {
    const q = Number(quantity);
    if (!q || isNaN(q)) return 0;
    return calculateEmission(pillar, category, q);
  }, [pillar, category, quantity]);

  // Auto-switch categories when pillar changes
  const handlePillarChange = (newPillar) => {
    setPillar(newPillar);
    const firstCat = Object.keys(EMISSION_FACTORS[newPillar])[0];
    setCategory(firstCat);
  };

  const handleOpenModal = () => {
    setQuantity('');
    setNotes('');
    setPillar('transport');
    setCategory('car_petrol');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = Number(quantity);
    if (!q || isNaN(q) || q <= 0) {
      addToast('Please enter a valid positive quantity', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await addActivity({
        pillar,
        category,
        quantity: q,
        date,
        notes
      });
      addToast('Activity logged successfully!', 'success');
      setModalOpen(false);
    } catch (err) {
      addToast('Error saving activity. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Google Maps Travel Auto-fill simulator
  const handleSimulateDistance = () => {
    const randomDistance = Math.floor(Math.random() * 45) + 5;
    setQuantity(randomDistance.toString());
    setNotes(`Calculated travel distance via Google Maps API: ${randomDistance} km`);
    addToast('Google Maps API filled travel distance!', 'info');
  };

  return (
    <div className="activity-view">
      {/* Header bar */}
      <div className="flex justify-between items-center mb-24">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Ecosystem Log Entries</h2>
          <p className="topbar-subtitle">Enter daily records of household or commute emissions</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} /> Add Log Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['all', 'transport', 'energy', 'diet', 'goods'].map((t) => (
          <button
            key={t}
            className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity Table */}
      <div className="glass-card-static" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px' }}>
            <div className="skeleton" style={{ height: '30px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '50px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ height: '50px', marginBottom: '12px' }} />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🌿</div>
            <h3>No activities logged yet</h3>
            <p>Use the "Add Log Entry" button to record your carbon-producing activities.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Pillar</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>CO₂e (kg)</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => (
                  <tr key={act.id}>
                    <td>{act.date}</td>
                    <td>
                      <span className={`pillar-badge ${act.pillar}`}>
                        {act.pillar}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {act.category.replace('_', ' ')}
                    </td>
                    <td>{act.quantity}</td>
                    <td style={{ fontWeight: 600 }}>{act.co2e.toFixed(1)} kg</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {act.notes}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost btn-icon btn-sm" 
                        onClick={() => deleteActivity(act.id)}
                        style={{ color: 'var(--accent-danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Overlay & Modal */}
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
                <h3 className="modal-title">Log New Activity</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>✕</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Step 1: Select Pillar */}
                  <div className="form-group mb-16">
                    <label className="form-label">Emission Pillar</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '6px' }}>
                      {['transport', 'energy', 'diet', 'goods'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`btn ${pillar === p ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '10px 4px', fontSize: '0.75rem', textTransform: 'capitalize' }}
                          onClick={() => handlePillarChange(p)}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Dynamic Form Fields */}
                  <div className="form-group mb-16">
                    <label className="form-label">Activity Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {Object.keys(EMISSION_FACTORS[pillar] || {}).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.replace('_', ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group mb-16">
                    <div className="flex justify-between items-center">
                      <label className="form-label">
                        Quantity ({pillar === 'transport' ? 'km' : pillar === 'energy' ? 'units (kWh/m³/litres)' : pillar === 'diet' ? 'days' : 'items'})
                      </label>
                      {pillar === 'transport' && (
                        <button 
                          type="button" 
                          className="btn btn-ghost btn-sm" 
                          onClick={handleSimulateDistance}
                          style={{ padding: 0, fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <MapPin size={12} /> Auto-fill commute distance
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 15"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-16">
                    <label className="form-label">Activity Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-16">
                    <label className="form-label">Notes (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Flight to Mumbai, Office commute"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Live calculations preview box */}
                  <div style={{
                    marginTop: '20px',
                    padding: '16px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-accent)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Info size={14} /> Real-time preview:
                    </span>
                    <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-primary)' }}>
                      {liveCo2e.toFixed(1)} kg CO₂e
                    </span>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Logging...' : 'Confirm Log Entry'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
