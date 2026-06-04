import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDemoFill = () => {
    setEmail('demo@carbontrack.com');
    setPassword('demo123');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please fill in all fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to CarbonTrack!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card glass-card-static"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="auth-logo">🌍</div>
          <h1>Welcome Back</h1>
          <p>Login to resume tracking your carbon targets</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full mt-12"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">or continue with</div>

        <button 
          type="button" 
          className="google-btn" 
          onClick={handleDemoFill}
        >
          🔑 Use Quick Demo Login
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </motion.div>
    </div>
  );
}
