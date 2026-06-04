import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActivityProvider } from './context/ActivityContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import AppLayout from './components/Layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import Recommendations from './pages/Recommendations';
import Goals from './pages/Goals';
import Household from './pages/Household';
import Settings from './pages/Settings';

// Route Guards
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Verifying credentials...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Verifying credentials...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <ActivityProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={
                  <PublicRoute>
                    <Landing />
                  </PublicRoute>
                } />
                
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />

                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />

                {/* Protected App Routes */}
                <Route element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/activity" element={<ActivityLog />} />
                  <Route path="/recommendations" element={<Recommendations />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/household" element={<Household />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ActivityProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
