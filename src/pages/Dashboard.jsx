import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { 
  TrendingDown, 
  Leaf, 
  Zap, 
  Car, 
  ShoppingBag, 
  Utensils, 
  Target, 
  Plus, 
  TrendingUp, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { useActivities } from '../context/ActivityContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { 
  getEmissionsByPillar, 
  getGlobalAverageDaily, 
  getDailyAverage, 
  getMonthlyTotal 
} from '../utils/calculator';
import { Link } from 'react-router-dom';

// Register ChartJS elements
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { activities, loading, loadSampleData } = useActivities();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { addToast } = useToast();
  const [period, setPeriod] = useState('Month');
  const [loadingSample, setLoadingSample] = useState(false);

  const handleLoadSample = async () => {
    setLoadingSample(true);
    try {
      await loadSampleData();
      addToast('Loaded 30 days of carbon activity records!', 'success');
    } catch (e) {
      addToast('Failed to load sample data.', 'error');
    } finally {
      setLoadingSample(false);
    }
  };

  // Stagger configurations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } }
  };

  // Calculations
  const stats = useMemo(() => {
    const monthlyTotal = getMonthlyTotal(activities);
    const dailyAvg = getDailyAverage(activities);
    const totalCount = activities.length;
    const globalAvg = getGlobalAverageDaily();
    const percentDiff = globalAvg > 0 ? ((dailyAvg - globalAvg) / globalAvg) * 100 : 0;
    
    // Emissions by pillar
    const pillarData = getEmissionsByPillar(activities);

    return {
      monthlyTotal,
      dailyAvg,
      totalCount,
      percentDiff,
      pillarData
    };
  }, [activities]);

  // Chart config - Doughnut (Emissions by Pillar)
  const doughnutData = {
    labels: ['Transport', 'Energy', 'Diet', 'Goods'],
    datasets: [{
      data: [
        stats.pillarData.transport || 0,
        stats.pillarData.energy || 0,
        stats.pillarData.diet || 0,
        stats.pillarData.goods || 0
      ],
      backgroundColor: ['#3b82f6', '#f59e0b', theme === 'dark' ? '#00f5c4' : '#0d9488', '#8b5cf6'],
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)',
      borderWidth: 2,
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
          font: { family: 'Inter', size: 11 },
          padding: 16
        }
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.raw.toFixed(1)} kg CO₂e`
        }
      }
    },
    cutout: '70%'
  };

  // Line Chart Data (Daily Trend)
  const lineData = useMemo(() => {
    // Generate dates for the last 15 entries/days to keep chart legible
    const datesMap = {};
    const sorted = [...activities].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sorted.forEach(a => {
      datesMap[a.date] = (datesMap[a.date] || 0) + (a.co2e || 0);
    });

    const labels = Object.keys(datesMap).slice(-10);
    const data = Object.values(datesMap).slice(-10);

    // Fallback if empty
    if (labels.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    const accentColor = theme === 'dark' ? '#00f5c4' : '#0d9488';

    return {
      labels,
      datasets: [{
        label: 'Emissions',
        data,
        borderColor: accentColor,
        borderWidth: 3,
        pointBackgroundColor: accentColor,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true,
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          if (theme === 'dark') {
            gradient.addColorStop(0, 'rgba(0, 245, 196, 0.15)');
            gradient.addColorStop(1, 'rgba(0, 245, 196, 0)');
          } else {
            gradient.addColorStop(0, 'rgba(13, 148, 136, 0.15)');
            gradient.addColorStop(1, 'rgba(13, 148, 136, 0)');
          }
          return gradient;
        }
      }]
    };
  }, [activities, theme]);

  const lineOptions = useMemo(() => {
    const textColor = theme === 'dark' ? '#64748b' : '#475569';
    const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Inter' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Inter' } }
        }
      }
    };
  }, [theme]);

  // Simple Heatmap Levels calculation
  const heatmapData = useMemo(() => {
    // Build 12 weeks representation (84 days)
    const result = [];
    const now = new Date();
    const dateMap = {};
    activities.forEach(a => {
      dateMap[a.date] = (dateMap[a.date] || 0) + (a.co2e || 0);
    });

    for (let i = 83; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const val = dateMap[dStr] || 0;
      let level = 0;
      if (val > 0 && val < 5) level = 1;
      else if (val >= 5 && val < 15) level = 2;
      else if (val >= 15 && val < 30) level = 3;
      else if (val >= 30) level = 4;
      
      result.push({ date: dStr, val, level });
    return result;
  }, [activities]);

  if (activities.length === 0 && !loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="dashboard-view"
        style={{ padding: '10px 0' }}
      >
        <div className="glass-card-static" style={{ padding: '40px', textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌍</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: '12px' }}>
            Welcome to CarbonTrack
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 28px', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Your carbon footprint database is currently empty. Start logging your activities (transport, energy, diet, and goods) to see detailed footprint breakdowns, timelines, and comparisons.
          </p>
          <div className="flex justify-center gap-16" style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/activity" className="btn btn-primary">
              <Plus size={18} /> Log Your First Activity
            </Link>
            <button className="btn btn-secondary" onClick={handleLoadSample} disabled={loadingSample}>
              ⚡ {loadingSample ? 'Importing...' : 'Prepopulate Sample Data'}
            </button>
          </div>
        </div>

        {/* Steps section */}
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '16px' }}>
          How it works:
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div className="glass-card-static" style={{ padding: '24px' }}>
            <div className="stat-icon green" style={{ fontSize: '1.25rem', marginBottom: '12px' }}>🌿</div>
            <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>1. Log Daily Entry</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Add details for the distance traveled, electricity consumed, food eaten, or goods purchased.
            </p>
          </div>
          <div className="glass-card-static" style={{ padding: '24px' }}>
            <div className="stat-icon blue" style={{ fontSize: '1.25rem', marginBottom: '12px' }}>📊</div>
            <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>2. Analyze Footprints</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              View aggregates, check carbon budgets, compare against baseline targets, and watch details populate in real-time.
            </p>
          </div>
          <div className="glass-card-static" style={{ padding: '24px' }}>
            <div className="stat-icon purple" style={{ fontSize: '1.25rem', marginBottom: '12px' }}>💡</div>
            <h4 style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>3. Reduce Footprints</h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Access AI recommendations and environment challenges, earn badges, and monitor your emissions drop.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={container}
      className="dashboard-view"
    >
      {/* 4 Stats Cards */}
      <div className="stats-grid">
        <motion.div variants={item} className="stat-card glass-card">
          <div className="stat-icon green"><TrendingDown size={20} /></div>
          <div className="stat-value">{stats.monthlyTotal.toFixed(1)} kg</div>
          <div className="stat-label">This Month's Emissions</div>
          <span className="stat-change positive">On Target</span>
        </motion.div>

        <motion.div variants={item} className="stat-card glass-card">
          <div className="stat-icon blue"><Leaf size={20} /></div>
          <div className="stat-value">{stats.dailyAvg.toFixed(1)} kg</div>
          <div className="stat-label">Daily Avg. Emissions</div>
          <span className={`stat-change ${stats.percentDiff <= 0 ? 'positive' : 'negative'}`}>
            {stats.percentDiff <= 0 ? 'Below Avg' : 'Above Avg'}
          </span>
        </motion.div>

        <motion.div variants={item} className="stat-card glass-card">
          <div className="stat-icon purple"><Car size={20} /></div>
          <div className="stat-value">{stats.totalCount}</div>
          <div className="stat-label">Activities Monitored</div>
          <span className="stat-change positive">+2 logged today</span>
        </motion.div>

        <motion.div variants={item} className="stat-card glass-card">
          <div className="stat-icon amber"><Target size={20} /></div>
          <div className="stat-value">2</div>
          <div className="stat-label">Active Carbon Goals</div>
          <span className="stat-change positive">1 near completion</span>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <motion.div variants={item} className="chart-card glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Emissions Curve</h3>
              <p className="chart-subtitle">Daily output over last 10 log entries</p>
            </div>
            <div className="chart-period">
              <button className={period === 'Week' ? 'active' : ''} onClick={() => setPeriod('Week')}>Week</button>
              <button className={period === 'Month' ? 'active' : ''} onClick={() => setPeriod('Month')}>Month</button>
            </div>
          </div>
          <div style={{ height: '300px', position: 'relative' }}>
            {loading ? (
              <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            ) : (
              <Line data={lineData} options={lineOptions} />
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="chart-card glass-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Pillar Breakdown</h3>
              <p className="chart-subtitle">Proportion of global footprint</p>
            </div>
          </div>
          <div style={{ height: '280px', position: 'relative', marginTop: '16px' }}>
            {loading ? (
              <div className="skeleton" style={{ width: '100%', height: '100%' }} />
            ) : (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            )}
          </div>
        </motion.div>
      </div>

      {/* Comparative Baseline Dial + Action row */}
      <div className="charts-grid" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: '28px' }}>
        <motion.div variants={item} className="glass-card" style={{ padding: '24px' }}>
          <h3 className="chart-title" style={{ marginBottom: '16px' }}>Emissions vs Global Average</h3>
          <div className="flex flex-col gap-16">
            <div>
              <div className="flex justify-between mb-8">
                <span className="form-label">Your Daily Average</span>
                <span className="form-label" style={{ color: 'var(--accent-primary)' }}>{stats.dailyAvg.toFixed(1)} kg CO₂e</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${Math.min(100, (stats.dailyAvg / 25) * 100)}%` }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-8">
                <span className="form-label">Global Target Threshold</span>
                <span className="form-label" style={{ color: 'var(--text-secondary)' }}>12.7 kg CO₂e</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: '50.8%', background: 'var(--text-secondary)' }} 
                />
              </div>
            </div>

            <div style={{
              background: stats.dailyAvg <= 12.7 ? 'rgba(0, 212, 170, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: stats.dailyAvg <= 12.7 ? '1px solid rgba(0, 212, 170, 0.2)' : '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'center',
              fontWeight: 500,
              fontSize: '0.88rem'
            }}>
              {stats.dailyAvg <= 12.7 
                ? '🎉 Excellent work! Your emissions are below the global average threshold.'
                : '⚠️ Focus on optimizing commute options and electricity consumption.'}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Row */}
        <motion.div variants={item} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 className="chart-title" style={{ marginBottom: '12px' }}>Quick Ecological Actions</h3>
          <div className="flex flex-col gap-12">
            <Link to="/activity" className="btn btn-secondary w-full" style={{ justifyContent: 'space-between' }}>
              <span className="flex items-center gap-8"><Plus size={18} /> Log Commutes & energy</span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/recommendations" className="btn btn-secondary w-full" style={{ justifyContent: 'space-between' }}>
              <span className="flex items-center gap-8"><Leaf size={18} /> Review AI recommendations</span>
              <ChevronRight size={16} />
            </Link>
            <Link to="/goals" className="btn btn-secondary w-full" style={{ justifyContent: 'space-between' }}>
              <span className="flex items-center gap-8"><Target size={18} /> Check carbon goals</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Heatmap Grid */}
      <motion.div variants={item} className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="chart-title">Activity Frequency Grid</h3>
          <span className="form-label" style={{ fontSize: '0.75rem' }}>Emissions Heatmap (Past 12 Weeks)</span>
        </div>
        <div className="heatmap-grid">
          {heatmapData.map((h, i) => (
            <div 
              key={i} 
              className={`heatmap-cell level-${h.level}`}
              title={`${h.date}: ${h.val.toFixed(1)} kg CO2e`} 
            />
          ))}
        </div>
        <div className="flex justify-between mt-12" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          <span>Less Emissions</span>
          <div className="flex gap-8 items-center">
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(0, 212, 170, 0.05)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(0, 212, 170, 0.15)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(0, 212, 170, 0.3)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(0, 212, 170, 0.5)' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'rgba(0, 212, 170, 0.75)' }} />
          </div>
          <span>More Emissions</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
