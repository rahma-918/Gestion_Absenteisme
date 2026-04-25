// App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages publiques
import Login from './pages/Login';
import Signup from './pages/Signup';

// Tableaux de bord (existants)
import Dashboard from './components/Dashboard/Dashboard';
import DashboardAdmin from './components/Dashboard/DashboardAdmin';
import DashboardEtudiant from './components/Dashboard/DashboardEtudiant';

// Autres composants (appel, statistiques, justificatifs...)
import Attendance from './components/Attendance/Attendance';
import Statistics from './components/Statistics/Statistics';
import StatisticsAdmin from './components/Statistics/Statisticsadmin';
import Justifications from './components/Justifications/Justifications';
import Eliminations from './components/Attendance/Elimination';
import JustificatifsEtudiant from './components/Justifications/JustificationEtudiant';

// Barres de navigation personnalisées (créées précédemment)
import NavbarEnseignant from './components/NavbarEnseignant';
import NavbarAdmin from './components/NavbarAdmin';
import NavbarEtudiant from './components/NavbarEtudiant';

// Composant qui affiche la navbar selon l'utilisateur connecté
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
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Routes protégées avec leur navbar respective */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <>
                  <DynamicNavbar />
                  <Routes>
                    {/* Enseignant */}
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/appel" element={<Attendance />} />
                    <Route path="/statistiques" element={<Statistics />} />
                    <Route path="/justificatifs" element={<Justifications />} />
                    <Route path="/eliminations" element={<Eliminations />} />

                    {/* Admin */}
                    <Route path="/dashboard-admin" element={<DashboardAdmin />} />
                    <Route path="/statistiques-admin" element={<StatisticsAdmin />} />
                    {/* Étudiant */}
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