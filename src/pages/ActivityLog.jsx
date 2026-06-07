import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Info, MapPin, ChevronDown } from 'lucide-react';
import { useActivities } from '../context/ActivityContext';
import { useToast } from '../context/ToastContext';
import { EMISSION_FACTORS } from '../utils/calculator';

// Human-readable labels for all categories
const CATEGORY_LABELS = {
  transport: {
    car_petrol:           { label: '🚗 Petrol Car',             unit: 'km',      hint: 'km driven',        placeholder: 'e.g. 15' },
    car_diesel:           { label: '🚗 Diesel Car',             unit: 'km',      hint: 'km driven',        placeholder: 'e.g. 15' },
    car_electric:         { label: '⚡ Electric Car',            unit: 'km',      hint: 'km driven',        placeholder: 'e.g. 20' },
    bus:                  { label: '🚌 Bus',                    unit: 'km',      hint: 'km travelled',     placeholder: 'e.g. 10' },
    train:                { label: '🚆 Train / Metro',           unit: 'km',      hint: 'km travelled',     placeholder: 'e.g. 30' },
    bicycle:              { label: '🚲 Bicycle',                unit: 'km',      hint: 'km cycled (zero)', placeholder: 'e.g. 5'  },
    walking:              { label: '🚶 Walking',                unit: 'km',      hint: 'km walked (zero)', placeholder: 'e.g. 2'  },
    motorcycle:           { label: '🏍️ Motorcycle',             unit: 'km',      hint: 'km driven',        placeholder: 'e.g. 12' },
    flight_domestic:      { label: '✈️ Flight (Domestic)',       unit: 'km',      hint: 'flight distance',  placeholder: 'e.g. 600' },
    flight_international: { label: '🌍 Flight (International)', unit: 'km',      hint: 'flight distance',  placeholder: 'e.g. 2500' },
  },
  energy: {
    electricity:  { label: '💡 Electricity',   unit: 'kWh',  hint: 'kWh used',         placeholder: 'e.g. 20'  },
    natural_gas:  { label: '🔥 Natural Gas',   unit: 'm³',   hint: 'm³ consumed',      placeholder: 'e.g. 3'   },
    heating_oil:  { label: '🛢️ Heating Oil',   unit: 'L',    hint: 'litres consumed',  placeholder: 'e.g. 5'   },
    lpg:          { label: '🫙 LPG / Propane', unit: 'L',    hint: 'litres consumed',  placeholder: 'e.g. 4'   },
    solar:        { label: '☀️ Solar Energy',  unit: 'kWh',  hint: 'kWh generated',    placeholder: 'e.g. 10'  },
    wind:         { label: '💨 Wind Energy',   unit: 'kWh',  hint: 'kWh generated',    placeholder: 'e.g. 10'  },
  },
  diet: {
    heavy_meat:   { label: '🥩 Heavy Meat Eater',    unit: 'days', hint: 'days on this diet', placeholder: '1' },
    medium_meat:  { label: '🍖 Medium Meat Eater',   unit: 'days', hint: 'days on this diet', placeholder: '1' },
    low_meat:     { label: '🥗 Low Meat Diet',       unit: 'days', hint: 'days on this diet', placeholder: '1' },
    pescatarian:  { label: '🐟 Pescatarian',         unit: 'days', hint: 'days on this diet', placeholder: '1' },
    vegetarian:   { label: '🥦 Vegetarian',          unit: 'days', hint: 'days on this diet', placeholder: '1' },
    vegan:        { label: '🌱 Vegan',               unit: 'days', hint: 'days on this diet', placeholder: '1' },
  },
  goods: {
    clothing:           { label: '👕 Clothing',            unit: 'items', hint: 'items purchased', placeholder: '1' },
    electronics_small:  { label: '📱 Small Electronics',   unit: 'items', hint: 'items purchased', placeholder: '1' },
    electronics_large:  { label: '💻 Large Electronics',   unit: 'items', hint: 'items purchased', placeholder: '1' },
    furniture:          { label: '🛋️ Furniture',           unit: 'items', hint: 'items purchased', placeholder: '1' },
    books:              { label: '📚 Books',               unit: 'items', hint: 'items purchased', placeholder: '1' },
    plastic_products:   { label: '🧴 Plastic Products',    unit: 'items', hint: 'items purchased', placeholder: '1' },
    household_supplies: { label: '🧹 Household Supplies',  unit: 'items', hint: 'items purchased', placeholder: '1' },
    beauty_products:    { label: '💄 Beauty Products',     unit: 'items', hint: 'items purchased', placeholder: '1' },
  },
};

// Friendly display name for the table
const getCategoryLabel = (pillar, category) =>
  CATEGORY_LABELS[pillar]?.[category]?.label?.replace(/[^\w\s]/gu, '').trim() ||
  category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const PILLAR_CONFIG = {
  transport: { icon: '🚗', color: '#3b82f6' },
  energy:    { icon: '⚡', color: '#f59e0b' },
  diet:      { icon: '🥗', color: '#a3e635' },
  goods:     { icon: '🛍️', color: '#8b5cf6' },
};

export default function ActivityLog() {
  const { activities, addActivity, deleteActivity, loading } = useActivities();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Modal states
  const [pillar, setPillar] = useState('transport');
  const [category, setCategory] = useState('car_petrol');
  const [quantity, setQuantity] = useState('');
  const [customFactor, setCustomFactor] = useState(EMISSION_FACTORS.transport.car_petrol.toString());
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (activeTab === 'all') return activities;
    return activities.filter(a => a.pillar === activeTab);
  }, [activities, activeTab]);

  // Sync emission factor when category changes
  useEffect(() => {
    const factor = EMISSION_FACTORS[pillar]?.[category];
    if (factor !== undefined) {
      setCustomFactor(factor.toString());
    }
  }, [pillar, category]);

  // Real-time calculation
  const liveCo2e = useMemo(() => {
    const q = Number(quantity);
    const f = Number(customFactor);
    if (!q || isNaN(q) || isNaN(f) || q <= 0) return 0;
    return Number((q * f).toFixed(2));
  }, [quantity, customFactor]);

  const currentMeta = CATEGORY_LABELS[pillar]?.[category] || { unit: 'units', hint: '', placeholder: 'e.g. 1' };
  const presetFactor = EMISSION_FACTORS[pillar]?.[category] ?? 0;

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
    setCustomFactor(EMISSION_FACTORS.transport.car_petrol.toString());
    setShowAdvanced(false);
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
      await addActivity({ pillar, category, quantity: q, co2e: liveCo2e, date, notes });
      addToast('Activity logged successfully!', 'success');
      setModalOpen(false);
    } catch (err) {
      addToast('Error saving activity. Try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Commute auto-fill
  const handleSimulateDistance = () => {
    const randomDistance = Math.floor(Math.random() * 45) + 5;
    setQuantity(randomDistance.toString());
    setNotes(`Estimated commute distance: ${randomDistance} km`);
    addToast('Distance auto-filled!', 'info');
  };

  return (
    <div className="activity-view">
      {/* Header */}
      <div className="flex justify-between items-center mb-24">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>Carbon Activity Log</h2>
          <p className="topbar-subtitle">Record your daily carbon-producing activities across all categories</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <Plus size={18} /> Add Activity
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
            {PILLAR_CONFIG[t]?.icon} {t.charAt(0).toUpperCase() + t.slice(1)}
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
            <p>Click "Add Activity" above to start tracking your carbon footprint.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>CO₂e Emitted</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => (
                  <tr key={act.id}>
                    <td>{act.date}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`pillar-badge ${act.pillar}`}>{act.pillar}</span>
                        <span style={{ fontSize: '0.85rem' }}>{getCategoryLabel(act.pillar, act.category)}</span>
                      </div>
                    </td>
                    <td>
                      {act.quantity} <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                        {CATEGORY_LABELS[act.pillar]?.[act.category]?.unit || ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: act.co2e === 0 ? 'var(--accent-primary)' : 'inherit' }}>
                        {act.co2e.toFixed(2)} kg CO₂e
                      </span>
                      {act.co2e === 0 && <span style={{ marginLeft: '6px', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>✓ Zero</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {act.notes || '—'}
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

      {/* Modal */}
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

                  {/* Step 1: Pillar selector */}
                  <div className="form-group mb-16">
                    <label className="form-label">What type of activity?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '6px' }}>
                      {['transport', 'energy', 'diet', 'goods'].map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`btn ${pillar === p ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '10px 4px', fontSize: '0.75rem', flexDirection: 'column', gap: '4px' }}
                          onClick={() => handlePillarChange(p)}
                        >
                          <span style={{ fontSize: '1.2rem' }}>{PILLAR_CONFIG[p].icon}</span>
                          <span style={{ textTransform: 'capitalize' }}>{p}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Category */}
                  <div className="form-group mb-16">
                    <label className="form-label">Specific Category</label>
                    <select
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {Object.keys(CATEGORY_LABELS[pillar] || {}).map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_LABELS[pillar][cat].label}
                        </option>
                      ))}
                    </select>
                    {presetFactor > 0 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                        📊 Standard emission factor: <strong>{presetFactor} kg CO₂e per {currentMeta.unit}</strong>
                      </p>
                    )}
                    {presetFactor === 0 && (
                      <p style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', marginTop: '6px' }}>
                        ✅ This activity produces <strong>zero emissions</strong> — great choice!
                      </p>
                    )}
                  </div>

                  {/* Step 3: Quantity */}
                  <div className="form-group mb-16">
                    <div className="flex justify-between items-center">
                      <label className="form-label">
                        How much? <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>({currentMeta.hint})</span>
                      </label>
                      {pillar === 'transport' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={handleSimulateDistance}
                          style={{ padding: 0, fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <MapPin size={12} /> Auto-fill distance
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="form-input"
                        placeholder={currentMeta.placeholder}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        style={{ paddingRight: '60px' }}
                      />
                      <span style={{
                        position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                        fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600, pointerEvents: 'none'
                      }}>
                        {currentMeta.unit}
                      </span>
                    </div>
                  </div>

                  {/* Step 4: Date */}
                  <div className="form-group mb-16">
                    <label className="form-label">Date of Activity</label>
                    <input
                      type="date"
                      className="form-input"
                      value={date}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  {/* Step 5: Notes */}
                  <div className="form-group mb-16">
                    <label className="form-label">Notes <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(Optional)</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Office commute, Mumbai flight"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Advanced: Custom emission factor */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(v => !v)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '0.78rem', color: 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0', marginBottom: '8px'
                    }}
                  >
                    <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    Advanced: Override emission factor
                  </button>

                  {showAdvanced && (
                    <div className="form-group mb-16">
                      <label className="form-label">Custom Emission Factor <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>(kg CO₂e per {currentMeta.unit})</span></label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="form-input"
                        value={customFactor}
                        onChange={(e) => setCustomFactor(e.target.value)}
                      />
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '6px' }}>
                        Preset value: {presetFactor} — only change this if you have a more accurate figure from your energy provider or vehicle specs.
                      </p>
                    </div>
                  )}

                  {/* Live preview */}
                  <div style={{
                    marginTop: '8px',
                    padding: '16px 20px',
                    background: liveCo2e === 0 && quantity ? 'rgba(163,230,53,0.08)' : 'var(--bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    border: `1px dashed ${liveCo2e === 0 && quantity ? 'rgba(163,230,53,0.4)' : 'var(--border-accent)'}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Info size={14} /> Estimated Emission:
                    </span>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: liveCo2e === 0 && quantity ? 'var(--accent-primary)' : 'var(--accent-primary)' }}>
                        {quantity ? `${liveCo2e.toFixed(2)} kg CO₂e` : '—'}
                      </span>
                      {quantity && liveCo2e > 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          ≈ {(liveCo2e / 12.7 * 100).toFixed(0)}% of your daily target
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={submitting || !quantity}>
                    {submitting ? 'Logging...' : '✓ Confirm Log Entry'}
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
