import { useState, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Users, Building, Download, HelpCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exportAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Household() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('household');

  // Mock Household Data
  const householdLeaderboard = [
    { name: 'Ananya Salunke', co2e: 32.5, rankClass: 'gold', prefix: '🥇' },
    { name: 'Dellia Souza', co2e: 41.2, rankClass: 'silver', prefix: '🥈' },
    { name: 'Kaarthikeya G.', co2e: 48.7, rankClass: 'bronze', prefix: '🥉' },
    { name: 'Herluino Carvalho', co2e: 52.1, rankClass: 'default', prefix: '4' }
  ];

  const totalHouseholdEmissions = useMemo(() => {
    return householdLeaderboard.reduce((sum, member) => sum + member.co2e, 0);
  }, []);

  const doughnutData = {
    labels: householdLeaderboard.map(h => h.name),
    datasets: [{
      data: householdLeaderboard.map(h => h.co2e),
      backgroundColor: [theme === 'dark' ? '#a3e635' : '#4d7c0f', '#3b82f6', '#22c55e', '#f59e0b'],
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
      borderWidth: 1,
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: theme === 'dark' ? '#94a3b8' : '#475569',
          font: { family: 'Inter', size: 10 }
        }
      }
    }
  };

  // Mock Organisation Data
  const departments = [
    { name: 'Engineering', members: 4, total: 180.2, change: '-4%' },
    { name: 'Marketing', members: 3, total: 145.5, change: '+1.5%' },
    { name: 'Operations', members: 5, total: 210.8, change: '-9.2%' },
    { name: 'Human Resources', members: 2, total: 85.0, change: '0%' }
  ];

  const handleExportCSV = async () => {
    if (!user) return;
    try {
      const blob = await exportAPI.generateCSV(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CarbonTrack_Compliance_Report_${user.name.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast('Compliance CSV report generated successfully!', 'success');
    } catch (e) {
      addToast('Failed to generate CSV export', 'error');
    }
  };

  return (
    <div className="household-view">
      {/* Switcher Tab header */}
      <div className="tabs mb-24">
        <button
          className={`tab ${activeTab === 'household' ? 'active' : ''}`}
          onClick={() => setActiveTab('household')}
        >
          <Users size={16} /> Household Leaderboard
        </button>
        <button
          className={`tab ${activeTab === 'org' ? 'active' : ''}`}
          onClick={() => setActiveTab('org')}
        >
          <Building size={16} /> Organisation Aggregates
        </button>
      </div>

      {activeTab === 'household' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
          {/* Leaderboard Card */}
          <div className="glass-card-static" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '16px' }}>
              Family Carbon Leaderboard 🏆
            </h3>
            <div className="flex flex-col">
              {householdLeaderboard.map((item, idx) => (
                <div key={idx} className="leaderboard-item">
                  <div className={`leaderboard-rank ${item.rankClass}`}>
                    {item.prefix}
                  </div>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">{item.name}</div>
                    <div className="leaderboard-subtitle">Monthly tracked logs</div>
                  </div>
                  <div className="leaderboard-value">{item.co2e.toFixed(1)} kg</div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Breakdown Chart */}
          <div className="glass-card-static flex flex-col items-center justify-between" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', width: '100%', marginBottom: '12px' }}>
              Contribution Summary
            </h3>
            <div style={{ height: '220px', width: '100%', position: 'relative' }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div style={{ width: '100%', borderTop: '1px solid var(--border-primary)', paddingTop: '16px', marginTop: '16px', textAlign: 'center' }}>
              <span className="form-label" style={{ display: 'block', fontSize: '0.78rem' }}>Family Group Emissions</span>
              <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {totalHouseholdEmissions.toFixed(1)} kg CO₂e
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-24">
          {/* Org Aggregation View */}
          <div className="glass-card-static" style={{ padding: '24px' }}>
            <div className="flex justify-between items-center mb-16">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem' }}>
                Departmental Carbon Footprints
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
                <Download size={14} /> Export Compliance CSV
              </button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Active Members</th>
                    <th>Total Emissions (kg)</th>
                    <th>Per Capita Average</th>
                    <th>Trend (vs Last Month)</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{dept.name}</td>
                      <td>{dept.members}</td>
                      <td>{dept.total.toFixed(1)} kg</td>
                      <td>{(dept.total / dept.members).toFixed(1)} kg</td>
                      <td style={{ color: dept.change.startsWith('-') ? 'var(--accent-primary)' : dept.change === '0%' ? 'var(--text-secondary)' : 'var(--accent-danger)' }}>
                        {dept.change}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Organization Admin quick setup */}
          <div className="glass-card" style={{ padding: '24px', background: 'var(--gradient-card)' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '8px' }}>
              Compliance Standards & Scopes
            </h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.5', maxWidth: '700px' }}>
              This platform adheres to the GHG Protocol Corporate Standard. Export data directly into corporate templates or interface with external monitoring pipelines using CSV compliance bundles.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
