import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AlertCircle } from 'lucide-react';

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-danger)', fontSize: '0.78rem', marginTop: '5px' }}
    >
      <AlertCircle size={13} /> {msg}
    </motion.div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const touch = (field) => setTouched(p => ({ ...p, [field]: true }));

  const errors = {
    email: !email.trim()
      ? 'Email is required.'
      : !EMAIL_RE.test(email)
      ? 'Enter a valid email address.'
      : '',
    password: !password
      ? 'Password is required.'
      : '',
  };

  const isValid = Object.values(errors).every(e => e === '');

  const inputStyle = (field) => ({
    borderColor: touched[field] && errors[field] ? 'var(--accent-danger)' : undefined,
    outline: touched[field] && errors[field] ? '2px solid rgba(239,68,68,0.2)' : undefined,
  });

  const handleDemoFill = () => {
    setEmail('demo@carbontrack.com');
    setPassword('demo123');
    setTouched({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) {
      addToast('Please fill in all fields correctly.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      addToast('Welcome back to CarbonTrack!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Login failed. Please check your credentials.', 'error');
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

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
              style={inputStyle('email')}
            />
            <FieldError msg={touched.email && errors.email} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              style={inputStyle('password')}
            />
            <FieldError msg={touched.password && errors.password} />
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

        <button type="button" className="google-btn" onClick={handleDemoFill}>
          🔑 Use Quick Demo Login
        </button>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </motion.div>
    </div>
  );
}
