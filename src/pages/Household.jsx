import { useState, useMemo, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Users, Building, Download, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { exportAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Household() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { theme } = useTheme();

  const [householdMembers, setHouseholdMembers] = useState(() => {
    return JSON.parse(localStorage.getItem('ct_household_members')) || [
      { name: 'Ananya Salunke', co2e: 32.5, rankClass: 'gold', prefix: '🥇' }
    ];
  });

  const [orgDepartments, setOrgDepartments] = useState(() => {
    return JSON.parse(localStorage.getItem('ct_org_departments')) || [
      { name: 'Engineering', members: 4, total: 180.2, change: '-4%' }
    ];
  });

  // New Member Form State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberCO2e, setNewMemberCO2e] = useState('');

  // New Department Form State
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptMembers, setNewDeptMembers] = useState('');
  const [newDeptTotal, setNewDeptTotal] = useState('');

  useEffect(() => {
    localStorage.setItem('ct_household_members', JSON.stringify(householdMembers));
  }, [householdMembers]);

  useEffect(() => {
    localStorage.setItem('ct_org_departments', JSON.stringify(orgDepartments));
  }, [orgDepartments]);

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName || !newMemberCO2e) return;
    
    const newValue = parseFloat(newMemberCO2e);
    const newMembers = [...householdMembers, {
      name: newMemberName,
      co2e: newValue,
      rankClass: 'default',
      prefix: (householdMembers.length + 1).toString()
    }];
    
    // Sort and re-rank
    newMembers.sort((a, b) => b.co2e - a.co2e);
    newMembers.forEach((m, idx) => {
      m.prefix = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (idx + 1).toString();
      m.rankClass = idx === 0 ? 'gold' : idx === 1 ? 'silver' : idx === 2 ? 'bronze' : 'default';
    });

    setHouseholdMembers(newMembers);
    setNewMemberName('');
    setNewMemberCO2e('');
    addToast('Household member added!', 'success');
  };

  const handleAddDept = (e) => {
    e.preventDefault();
    if (!newDeptName || !newDeptMembers || !newDeptTotal) return;

    const newDept = {
      name: newDeptName,
      members: parseInt(newDeptMembers),
      total: parseFloat(newDeptTotal),
      change: '0%'
    };

    setOrgDepartments([...orgDepartments, newDept]);
    setNewDeptName('');
    setNewDeptMembers('');
    setNewDeptTotal('');
    addToast('Department added!', 'success');
  };

  const totalHouseholdEmissions = useMemo(() => {
    return householdMembers.reduce((sum, member) => sum + member.co2e, 0);
  }, [householdMembers]);

  const doughnutData = {
    labels: householdMembers.map(h => h.name),
    datasets: [{
      data: householdMembers.map(h => h.co2e),
      backgroundColor: ['#a3e635', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
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

  const handleExportCSV = async () => {
    if (!user) return;
    try {
      const blob = await exportAPI.generateCSV(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CarbonTrack_Compliance_Report_${user.name.replace(/\\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      addToast('Compliance CSV report generated successfully!', 'success');
    } catch (e) {
      addToast('Failed to generate CSV export', 'error');
    }
  };

  if (!user) return null;

  const role = user.role || 'Individual';

  return (
    <div className="household-view">
      {role === 'Individual' && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginTop: '40px' }}>
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h2>Group Features Restricted</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
            The Leaderboard and Organization Aggregates are only available for Household Admins and Organisation Admins.
          </p>
        </div>
      )}

      {role === 'Household Admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px' }}>
          <div className="flex flex-col gap-20">
            {/* Add Member Form */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '16px' }}>
                Add Family Member
              </h3>
              <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                <div style={{ flex: 2 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Name</label>
                  <input type="text" className="form-input" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>CO₂e (kg)</label>
                  <input type="number" step="0.1" className="form-input" value={newMemberCO2e} onChange={e => setNewMemberCO2e(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                  <PlusCircle size={18} />
                </button>
              </form>
            </div>

            {/* Leaderboard Card */}
            <div className="glass-card-static" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '16px' }}>
                Family Carbon Leaderboard 🏆
              </h3>
              <div className="flex flex-col">
                {householdMembers.map((item, idx) => (
                  <div key={idx} className="leaderboard-item">
                    <div className={`leaderboard-rank ${item.rankClass}`}>
                      {item.prefix}
                    </div>
                    <div className="leaderboard-info">
                      <div className="leaderboard-name">{item.name}</div>
                      <div className="leaderboard-subtitle">Monthly tracked logs</div>
                    </div>
                    <div className="leaderboard-value">{parseFloat(item.co2e).toFixed(1)} kg</div>
                  </div>
                ))}
                {householdMembers.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No members added yet.</p>}
              </div>
            </div>
          </div>

          {/* Share Breakdown Chart */}
          <div className="glass-card-static flex flex-col items-center justify-between" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', width: '100%', marginBottom: '12px' }}>
              Contribution Summary
            </h3>
            {householdMembers.length > 0 ? (
              <div style={{ height: '220px', width: '100%', position: 'relative' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            ) : (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No Data
              </div>
            )}
            <div style={{ width: '100%', borderTop: '1px solid var(--border-primary)', paddingTop: '16px', marginTop: '16px', textAlign: 'center' }}>
              <span className="form-label" style={{ display: 'block', fontSize: '0.78rem' }}>Family Group Emissions</span>
              <span style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {totalHouseholdEmissions.toFixed(1)} kg CO₂e
              </span>
            </div>
          </div>
        </div>
      )}

      {role === 'Organisation Admin' && (
        <div className="flex flex-col gap-24">
          {/* Add Department Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', marginBottom: '16px' }}>
              Add Department
            </h3>
            <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Department Name</label>
                <input type="text" className="form-input" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Members</label>
                <input type="number" className="form-input" value={newDeptMembers} onChange={e => setNewDeptMembers(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label" style={{ fontSize: '0.8rem' }}>Total Emissions (kg)</label>
                <input type="number" step="0.1" className="form-input" value={newDeptTotal} onChange={e => setNewDeptTotal(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                <PlusCircle size={18} />
              </button>
            </form>
          </div>

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
                  {orgDepartments.map((dept, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{dept.name}</td>
                      <td>{dept.members}</td>
                      <td>{parseFloat(dept.total).toFixed(1)} kg</td>
                      <td>{dept.members > 0 ? (dept.total / dept.members).toFixed(1) : 0} kg</td>
                      <td style={{ color: dept.change.startsWith('-') ? 'var(--accent-primary)' : dept.change === '0%' ? 'var(--text-secondary)' : 'var(--accent-danger)' }}>
                        {dept.change}
                      </td>
                    </tr>
                  ))}
                  {orgDepartments.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No departments added yet.</td>
                    </tr>
                  )}
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
