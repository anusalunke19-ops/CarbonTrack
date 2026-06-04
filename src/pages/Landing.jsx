import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Zap, Utensils, ShoppingBag, Leaf, Shield, Trophy, Smartphone, ArrowRight } from 'lucide-react';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-brand">
          <span style={{ fontSize: '1.6rem' }}>🌍</span>
          <span className="sidebar-brand">CarbonTrack</span>
        </div>
        <div className="landing-nav-links">
          <a href="#features">Pillars</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#impact">Our Impact</a>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn btn-ghost">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="hero-badge">
            <Leaf size={16} />
            <span>Smart Carbon Tracking — Version 1.0</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants}>
            Track Your <span className="text-gradient">Carbon Footprint</span>,<br />
            Empower Green Actions.
          </motion.h1>
          
          <motion.p variants={itemVariants}>
            CarbonTrack is a next-generation platform for individuals, households, and organizations.
            Log activities across 4 pillars, compute emissions in real time, and reduce your footprint with Gemini AI recommendations.
          </motion.p>
          
          <motion.div variants={itemVariants} className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start Free Commits <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn btn-secondary btn-lg">Explore Pillars</a>
          </motion.div>

          <motion.div variants={itemVariants} className="hero-stats">
            <div>
              <div className="hero-stat-value">12k+</div>
              <div className="hero-stat-label">Tons CO₂e Monitored</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border-primary)' }} />
            <div>
              <div className="hero-stat-value">22%</div>
              <div className="hero-stat-label">Avg. User Reduction</div>
            </div>
            <div style={{ width: '1px', height: '40px', background: 'var(--border-primary)' }} />
            <div>
              <div className="hero-stat-value">50k+</div>
              <div className="hero-stat-label">AI Tips Executed</div>
            </div>
          </motion.div>
        </motion.div>
      </header>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>The Four Tracking Pillars</h2>
          <p>We analyze daily footprint records across primary emission factors to produce accurate ecological impact schemas.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
              <Car size={32} />
            </div>
            <h3>Transport</h3>
            <p>Monitors daily vehicle commutes, bus, rail mileage, and air travel logs offset against localized databases.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
              <Zap size={32} />
            </div>
            <h3>Energy</h3>
            <p>Integrates utilities data (electricity, heating oil, gas) to measure direct household and operational footprint.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon" style={{ background: 'rgba(0, 212, 170, 0.15)', color: '#00d4aa' }}>
              <Utensils size={32} />
            </div>
            <h3>Diet</h3>
            <p>Calculates daily food emissions depending on consumption profiles: heavy meat, vegan, or vegetarian.</p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed' }}>
              <ShoppingBag size={32} />
            </div>
            <h3>Consumer Goods</h3>
            <p>Assesses lifestyle product cycles (electronics, clothing, household products) from factory to waste bin.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ padding: '80px 48px', background: 'var(--bg-secondary)' }}>
        <div className="section-header">
          <h2>Seamless Carbon Tracking</h2>
          <p>Get set up in seconds and see immediate results through carbon calculations.</p>
        </div>

        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="feature-card glass-card-static text-center">
            <div className="feature-icon" style={{ background: 'rgba(0, 212, 170, 0.1)', color: '#00d4aa' }}>1</div>
            <h3 style={{ marginTop: '12px' }}>Log Daily Activity</h3>
            <p>Use our responsive input panel to capture your travel, energy, diet, and purchase data in seconds.</p>
          </div>

          <div className="feature-card glass-card-static text-center">
            <div className="feature-icon" style={{ background: 'rgba(0, 212, 170, 0.1)', color: '#00d4aa' }}>2</div>
            <h3 style={{ marginTop: '12px' }}>Analyze Trends</h3>
            <p>Get beautiful, real-time Chart.js interactive charts of your carbon budgets and historical curves.</p>
          </div>

          <div className="feature-card glass-card-static text-center">
            <div className="feature-icon" style={{ background: 'rgba(0, 212, 170, 0.1)', color: '#00d4aa' }}>3</div>
            <h3 style={{ marginTop: '12px' }}>Personalized Reduction</h3>
            <p>Acquire custom rules and Gemini AI prompts to swap high-intensity activities with low-impact options.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 CarbonTrack. Submitted for Software Engineering and Project Management.</p>
        <p style={{ marginTop: '8px', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
          Team Batch C1: Ananya Salunke, Dellia Souza, Gangavarapu Kaarthikeya, Herluino Carvalho.
        </p>
      </footer>
    </div>
  );
}
