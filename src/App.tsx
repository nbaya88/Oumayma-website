import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import StudentsPage from './pages/StudentsPage';
import InvoicesPage from './pages/InvoicesPage';
import ArchivesPage from './pages/ArchivesPage';
import SettingsPage from './pages/SettingsPage';
import StudentLoginPage from './pages/StudentLoginPage';
import StudentDashboardPage from './pages/StudentDashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import EmailTestPage from './pages/EmailTestPage';
import AdminLayout from './components/AdminLayout';
import { Page } from './types';

// Page de connexion professeur
function LoginPage() {
  const [password, setPassword] = useState('');
  const { setIsAdmin } = useApp();
  const navigate = useNavigate();

  const handleLogin = () => {
    if (password === 'prof2026' || password === 'admin') {
      setIsAdmin(true);
      navigate('/dashboard', { replace: true });
    } else {
      alert('Mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Espace professeur</h3>
        <p className="text-gray-500 text-sm mb-6">Entrez le mot de passe pour accéder au tableau de bord</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="Mot de passe"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              autoFocus
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400 mb-2">
            <strong>Démo :</strong> Utilisez "prof2026" ou "admin" comme mot de passe
          </p>
          <button
            onClick={() => {
              if (confirm('Réinitialiser toutes les données ?')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full text-xs text-red-500 hover:text-red-700 transition-colors mt-2"
          >
            🔄 Réinitialiser les données
          </button>
        </div>
      </div>
    </div>
  );
}

// Page de réinitialisation
function ResetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Réinitialisation des données</h2>
          <p className="text-gray-600 text-sm">
            Cette action va supprimer toutes les données locales et recharger les données de démonstration.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.hash = '#/';
              window.location.reload();
            }}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
          >
            🗑️ Réinitialiser toutes les données
          </button>
          <button
            onClick={() => window.location.hash = '#/'}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
          >
            ← Retour à l'accueil
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>💡 Identifiants après réinitialisation :</strong>
          </p>
          <div className="mt-2 text-xs text-blue-700 space-y-1">
            <div><strong>Professeur :</strong> mot de passe <code className="bg-blue-100 px-1 rounded">prof2026</code></div>
            <div><strong>Élève :</strong> marie.dupont@email.com / <code className="bg-blue-100 px-1 rounded">Marie2026</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Espace Professeur - gère la navigation interne via currentPage
function AdminSpace() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useApp();

  // Déterminer la page actuelle basée sur l'URL
  const getPageFromPath = (): Page => {
    const path = location.pathname;
    if (path === '/calendar') return 'calendar';
    if (path === '/students') return 'students';
    if (path === '/invoices') return 'invoices';
    if (path === '/archives') return 'archives';
    if (path === '/settings') return 'settings';
    if (path === '/email-test') return 'email-test';
    return 'dashboard';
  };

  const [currentPage, setCurrentPage] = useState<Page>(getPageFromPath());

  // Mettre à jour la page quand l'URL change
  useEffect(() => {
    setCurrentPage(getPageFromPath());
  }, [location.pathname]);

  // Si pas admin, rediriger vers login
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    navigate(`/${page === 'dashboard' ? 'dashboard' : page}`);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'calendar': return <CalendarPage />;
      case 'students': return <StudentsPage />;
      case 'invoices': return <InvoicesPage />;
      case 'archives': return <ArchivesPage />;
      case 'settings': return <SettingsPage />;
      case 'email-test': return <EmailTestPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage} onPageChange={handlePageChange}>
      {renderPage()}
    </AdminLayout>
  );
}

// Composant Espace Élève
function StudentSpace() {
  const location = useLocation();
  const { currentStudentId } = useApp();

  // Si pas connecté, rediriger vers login
  if (!currentStudentId) {
    return <Navigate to="/student-login" replace />;
  }

  const path = location.pathname;
  if (path === '/student-profile') {
    return <StudentProfilePage />;
  }
  return <StudentDashboardPage />;
}

// Composant principal de l'application
function AppContent() {
  const { isAdmin, currentStudentId } = useApp();

  return (
    <Routes>
      {/* Page d'accueil publique */}
      <Route path="/" element={<HomePage />} />

      {/* Connexion professeur */}
      <Route path="/login" element={
        isAdmin ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      {/* Connexion élève */}
      <Route path="/student-login" element={
        currentStudentId ? <Navigate to="/student-dashboard" replace /> : <StudentLoginPage />
      } />

      {/* Espace professeur - toutes les routes admin */}
      <Route path="/dashboard" element={<AdminSpace />} />
      <Route path="/calendar" element={<AdminSpace />} />
      <Route path="/students" element={<AdminSpace />} />
      <Route path="/invoices" element={<AdminSpace />} />
      <Route path="/archives" element={<AdminSpace />} />
      <Route path="/settings" element={<AdminSpace />} />
      <Route path="/email-test" element={<AdminSpace />} />

      {/* Espace élève */}
      <Route path="/student-dashboard" element={<StudentSpace />} />
      <Route path="/student-profile" element={<StudentSpace />} />

      {/* Page de réinitialisation */}
      <Route path="/reset" element={<ResetPage />} />

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </HashRouter>
  );
}
