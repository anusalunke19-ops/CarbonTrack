import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

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

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Individual');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const touch = (field) => setTouched(p => ({ ...p, [field]: true }));

  // Inline validation rules
  const errors = {
    name: !name.trim()
      ? 'Name is required.'
      : name.trim().length < 2
      ? 'Name must be at least 2 characters.'
      : '',
    email: !email.trim()
      ? 'Email is required.'
      : !EMAIL_RE.test(email)
      ? 'Enter a valid email address.'
      : '',
    password: !password
      ? 'Password is required.'
      : password.length < 6
      ? 'Password must be at least 6 characters.'
      : '',
    confirmPassword: !confirmPassword
      ? 'Please confirm your password.'
      : confirmPassword !== password
      ? 'Passwords do not match.'
      : '',
  };

  const isValid = Object.values(errors).every(e => e === '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Touch all fields to show all errors
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (!isValid) {
      addToast('Please fix the errors before submitting.', 'warning');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      addToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.message || 'Registration failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    borderColor: touched[field] && errors[field] ? 'var(--accent-danger)' : undefined,
    outline: touched[field] && errors[field] ? '2px solid rgba(239,68,68,0.2)' : undefined,
  });

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
          <h1>Create Account</h1>
          <p>Join CarbonTrack and monitor emissions</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label className="form-label">Full Name / Org Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ananya Salunke"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => touch('name')}
              style={inputStyle('name')}
            />
            <FieldError msg={touched.name && errors.name} />
          </div>

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
            <label className="form-label">Account Role Tier</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Individual">👤 Individual Account</option>
              <option value="Household Admin">🏠 Household Admin</option>
              <option value="Organisation Admin">🏢 Organisation Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => touch('password')}
              style={inputStyle('password')}
            />
            <FieldError msg={touched.password && errors.password} />
            {touched.password && !errors.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-primary)', fontSize: '0.78rem', marginTop: '5px' }}>
                <CheckCircle size={13} /> Password looks good
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => touch('confirmPassword')}
              style={inputStyle('confirmPassword')}
            />
            <FieldError msg={touched.confirmPassword && errors.confirmPassword} />
            {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-primary)', fontSize: '0.78rem', marginTop: '5px' }}>
                <CheckCircle size={13} /> Passwords match
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-12"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
