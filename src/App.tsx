import React, { useState, useEffect } from 'react';
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
import AdminLayout from './components/AdminLayout';
import { Page } from './types';

function AppContent() {
  const { isAdmin, setIsAdmin, currentStudentId, getStudentById } = useApp();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [password, setPassword] = useState('');

  // Check URL hash for admin/student access
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setShowLoginModal(true);
      } else if (hash === '#student-login') {
        setCurrentPage('student-login');
      } else if (hash === '#student-dashboard' && currentStudentId) {
        setCurrentPage('student-dashboard');
      } else if (hash === '#student-profile' && currentStudentId) {
        setCurrentPage('student-profile');
      } else if (hash === '' || hash === '#' || hash === '#home') {
        // Retour à l'accueil
        setCurrentPage('home');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [currentStudentId]);

  // Auto-navigate to student dashboard if logged in
  useEffect(() => {
    if (currentStudentId && currentPage === 'student-login') {
      setCurrentPage('student-dashboard');
      window.location.hash = '#student-dashboard';
    }
  }, [currentStudentId, currentPage]);

  const handleLogin = () => {
    if (password === 'prof2026' || password === 'admin') {
      setIsAdmin(true);
      setCurrentPage('dashboard');
      setShowLoginModal(false);
      setPassword('');
      window.location.hash = '';
    } else {
      alert('Mot de passe incorrect');
    }
  };

  // Student views
  if (currentStudentId && !isAdmin) {
    // Si on veut retourner à l'accueil
    if (currentPage === 'home') {
      return <HomePage />;
    }
    if (currentPage === 'student-profile') {
      return <StudentProfilePage />;
    }
    if (currentPage === 'student-dashboard' || currentPage === 'student-login') {
      return <StudentDashboardPage />;
    }
    return <StudentDashboardPage />;
  }

  // Admin views
  if (isAdmin) {
    // Si on veut retourner à l'accueil
    if (currentPage === 'home') {
      return <HomePage />;
    }
    return (
      <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
        {currentPage === 'dashboard' && <DashboardPage />}
        {currentPage === 'calendar' && <CalendarPage />}
        {currentPage === 'students' && <StudentsPage />}
        {currentPage === 'invoices' && <InvoicesPage />}
        {currentPage === 'archives' && <ArchivesPage />}
        {currentPage === 'settings' && <SettingsPage />}
      </AdminLayout>
    );
  }

  // Student login page
  if (currentPage === 'student-login') {
    return <StudentLoginPage />;
  }

  // Home page
  return (
    <>
      <HomePage />

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
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
                onClick={() => { setShowLoginModal(false); setPassword(''); window.location.hash = ''; }}
                className="w-full text-gray-500 text-sm hover:text-gray-700 transition-colors"
              >
                Annuler
              </button>
            </div>

            <div className="mt-6 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-400">
                <strong>Démo :</strong> Utilisez "prof2026" ou "admin" comme mot de passe
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
