// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Vérification de la session au chargement
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login/', { email, password });
      const { access, refresh, user: userData } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (error) {
      const message = error.response?.data?.detail || 
                      error.response?.data?.non_field_errors?.[0] ||
                      'Erreur de connexion.';
      throw new Error(message);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post('/api/auth/signup/', userData);
      const { access, refresh, user: newUser } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      return newUser;
    } catch (error) {
      const message = error.response?.data?.email?.[0] ||
                      error.response?.data?.name?.[0] ||
                      error.response?.data?.password?.[0] ||
                      'Erreur lors de l\'inscription.';
      throw new Error(message);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) return;
    try {
      const response = await axios.post('/api/auth/refresh/', { refresh });
      const { access } = response.data;
      localStorage.setItem('access_token', access);
    } catch (error) {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);