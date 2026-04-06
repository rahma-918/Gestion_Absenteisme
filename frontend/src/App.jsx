import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import Attendance from './components/Attendance/Attendance';
import Statistics from './components/Statistics/Statistics';
import Justifications from './components/Justifications/Justifications';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Barre de navigation simple */}
        <nav style={{ padding: '1rem', backgroundColor: '#f1f5f9', display: 'flex', gap: '1rem' }}>
          <Link to="/">Tableau de bord</Link>
          <Link to="/appel">Faire l'appel</Link>
          <Link to="/statistiques">Statistiques</Link>
          <Link to="/justificatifs">Justificatifs</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/appel" element={<Attendance />} />
          <Route path="/statistiques" element={<Statistics />} />
          <Route path="/justificatifs" element={<Justifications />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;