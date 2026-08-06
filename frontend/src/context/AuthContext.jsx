import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as apiLogin, loginDemoUser, getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check if there's a valid token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMe()
        .then(data => setUser(data.user))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const persistSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const login = async (username, password) => persistSession(
    await apiLogin({ username, password })
  );

  const loginDemo = async () => persistSession(await loginDemoUser());

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAdmin = user?.rol?.toLowerCase() === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, logout, isAdmin, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
