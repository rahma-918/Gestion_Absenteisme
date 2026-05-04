// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import DashboardAdmin from './components/Dashboard/DashboardAdmin';
import DashboardEtudiant from './components/Dashboard/DashboardEtudiant';
import Attendance from './components/Attendance/Attendance';
import Statistics from './components/Statistics/Statistics';
import StatisticsAdmin from './components/Statistics/Statisticsadmin';
import Justifications from './components/Justifications/Justifications';
import Eliminations from './components/Attendance/Elimination';
import JustificatifsEtudiant from './components/Justifications/JustificationEtudiant';
import NavbarEnseignant from './components/NavbarEnseignant';
import NavbarAdmin from './components/NavbarAdmin';
import NavbarEtudiant from './components/NavbarEtudiant';

// Configuration Axios globale
axios.defaults.baseURL = 'http://localhost:8000';

// Intercepteur de requête : ajoute le token JWT
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse : rafraîchit le token si 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post('/api/auth/refresh/', { refresh: refreshToken });
        const { access } = response.data;
        localStorage.setItem('access_token', access);
        processQueue(null, access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Composant DynamicNavbar
const DynamicNavbar = () => {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === 'enseignant') return <NavbarEnseignant />;
  if (user.role === 'admin') return <NavbarAdmin />;
  if (user.role === 'etudiant') return <NavbarEtudiant />;
  return null;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <>
                  <DynamicNavbar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/appel/:seanceId" element={<Attendance />} />
                    <Route path="/statistiques" element={<Statistics />} />
                    <Route path="/justificatifs" element={<Justifications />} />
                    <Route path="/eliminations" element={<Eliminations />} />
                    <Route path="/dashboard-admin" element={<DashboardAdmin />} />
                    <Route path="/statistiques-admin" element={<StatisticsAdmin />} />
                    <Route path="/dashboard-etudiant" element={<DashboardEtudiant />} />
                    <Route path="/justificatifs-etudiant" element={<JustificatifsEtudiant />} />
                  </Routes>
                </>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;