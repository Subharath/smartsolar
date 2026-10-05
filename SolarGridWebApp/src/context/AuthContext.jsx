import { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext – stores logged-in user and role.
 *
 * MOCK AUTHENTICATION (development only):
 * Replace login() with a real call to the C# API later.
 * Example: POST /api/auth/login
 */

const AuthContext = createContext(null);

// DEV ONLY – not production credentials
const MOCK_USERS = [
  {
    email: 'backoffice@test.com',
    nic: '199012345678',
    password: 'password123',
    name: 'Admin User',
    role: 'Backoffice',
  },
  {
    email: 'operator@test.com',
    nic: '198567890123',
    password: 'password123',
    name: 'Grid Operator One',
    role: 'GridOperator',
  },
];

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
   * MOCK login – replace this body with api.post('/auth/login', { email, password })
   * when the C# backend is ready.
   */
  async function login(identifier, password) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 400));

    const idClean = (identifier || '').trim().toLowerCase();
    const found = MOCK_USERS.find(
      (u) =>
        (u.email.toLowerCase() === idClean ||
          (u.nic && u.nic.toLowerCase() === idClean)) &&
        u.password === password
    );

    if (!found) {
      throw new Error('Invalid email or password.');
    }

    const authUser = {
      email: found.email,
      name: found.name,
      role: found.role,
    };

    // Fake token for future Authorization header use
    const fakeToken = `mock-token-${found.role}-${Date.now()}`;

    localStorage.setItem('authUser', JSON.stringify(authUser));
    localStorage.setItem('authToken', fakeToken);
    setUser(authUser);

    return authUser;
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
