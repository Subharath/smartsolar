import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * AuthContext – manages authenticated session and roles via C# Web API.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on refresh
  useEffect(() => {
    const saved = localStorage.getItem('authUser');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Real backend login via POST /api/Auth/login
   */
  async function login(identifier, password) {
    try {
      const res = await api.post('/Auth/login', {
        nic: (identifier || '').trim(),
        password: password
      });

      const authUser = {
        nic: res.nic,
        email: res.email || identifier,
        name: res.fullName,
        role: res.role,
        status: res.status
      };

      localStorage.setItem('authUser', JSON.stringify(authUser));
      localStorage.setItem('authToken', res.token);
      setUser(authUser);

      return authUser;
    } catch (err) {
      throw new Error(err.message || 'Login failed. Check server status or credentials.');
    }
  }

  function logout() {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isBackoffice: user?.role === 'Backoffice',
    isOperator: user?.role === 'GridOperator',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
