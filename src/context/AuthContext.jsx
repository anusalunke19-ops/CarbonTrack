import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, initializeDemoData } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Initialise demo data and load session
    initializeDemoData();
    const currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const loggedInUser = await authAPI.login({ email, password });
    setUser(loggedInUser);
    return loggedInUser;
  };

  const register = async (name, email, password, role) => {
    const newUser = await authAPI.register({ name, email, password, role });
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
