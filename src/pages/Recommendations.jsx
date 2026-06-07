import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Check, Bookmark, Calendar } from 'lucide-react';
import { useActivities } from '../context/ActivityContext';
import { useToast } from '../context/ToastContext';
import { getRecommendations, getPersonalizedTips } from '../utils/recommendations';

export default function Recommendations() {
  const { activities } = useActivities();
  const { addToast } = useToast();
  const [highestPillar, setHighestPillar] = useState('transport');
  const [acceptedTips, setAcceptedTips] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('ct_committed_tips')) || [];
    return saved.reduce((acc, tip) => ({ ...acc, [tip.id]: true }), {});
  });

  // Generate dynamic recommendation cards based on activities
  const recommendations = useMemo(() => {
    return getRecommendations(activities);
  }, [activities]);

  useEffect(() => {
    // Find the highest emission pillar to display custom tips
    const totals = { transport: 0, energy: 0, diet: 0, goods: 0 };
    activities.forEach(a => {
      if (totals[a.pillar] !== undefined) {
        totals[a.pillar] += (a.co2e || 0);
      }
    });

    let maxPillar = 'transport';
    let maxVal = -1;
    Object.entries(totals).forEach(([p, v]) => {
      if (v > maxVal) {
        maxVal = v;
        maxPillar = p;
      }
    });
    setHighestPillar(maxPillar);
  }, [activities]);


  const handleAcceptTip = (tip) => {
    setAcceptedTips(prev => ({ ...prev, [tip.id]: true }));
    const saved = JSON.parse(localStorage.getItem('ct_committed_tips')) || [];
    // don't save duplicate
    if (!saved.some(t => t.id === tip.id)) {
      saved.push({ id: tip.id, title: tip.title, desc: tip.desc, impact: tip.impact, committedAt: new Date().toISOString() });
      localStorage.setItem('ct_committed_tips', JSON.stringify(saved));
    }
    addToast(`Accepted tip! Projected saving: ${tip.impact} kg CO2e/week`, 'success');
  };

  return (
    <div className="recommendations-view">

      {/* Static fallbacks cards */}
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px' }}>
        Targeted Carbon Actions
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {recommendations.map((tip) => (
          <div key={tip.id} className="tip-card glass-card">
            <div className="tip-icon" style={{
              background: tip.pillar === 'transport' ? 'rgba(59, 130, 246, 0.15)' :
                          tip.pillar === 'energy' ? 'rgba(245, 158, 11, 0.15)' :
                          tip.pillar === 'diet' ? 'rgba(163, 230, 53, 0.15)' : 'rgba(124, 58, 237, 0.15)'
            }}>
              {tip.icon}
            </div>
            <div className="tip-content">
              <h4 className="tip-title">{tip.title}</h4>
              <p className="tip-desc">{tip.desc}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span className="tip-impact">
                  ✨ Saves ~{tip.impact} kg CO₂e / week
                </span>
                
                {acceptedTips[tip.id] ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Check size={14} /> Added to Checklist
                  </span>
                ) : (
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={() => handleAcceptTip(tip)}
                  >
                    Commit Tip
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
