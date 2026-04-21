// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Simulation d'une base d'utilisateurs
const mockUsers = [
  { id: 1, email: 'prof@issatso.rnu.tn', password: 'prof123', role: 'enseignant', name: 'Dr. Ahmed Ben Salem' },
  { id: 2, email: 'admin@issatso.rnu.tn', password: 'admin123', role: 'admin', name: 'Mme. Fatma Mansouri' },
  { id: 3, email: 'etudiant@issatso.rnu.tn', password: 'etudiant123', role: 'etudiant', name: 'Ahmed Ben Ali', studentId: '20210245' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté dans localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulation d'appel API
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error('Email ou mot de passe incorrect');
    }
    // On ne stocke pas le mot de passe
    const { password: _, ...userWithoutPassword } = foundUser;
    const userData = { ...userWithoutPassword, token: 'fake-jwt-token' };
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const signup = async (userData) => {
    // userData doit contenir email, password, role, name, éventuellement studentId
    // Simulation : vérifier si l'email existe déjà
    const existing = mockUsers.find(u => u.email === userData.email);
    if (existing) {
      throw new Error('Cet email est déjà utilisé');
    }
    // Création d'un nouvel utilisateur (en vrai, on enverrait à une API)
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      token: 'fake-jwt-token'
    };
    // En simulation, on l'ajoute au tableau (perdu au rechargement)
    mockUsers.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);