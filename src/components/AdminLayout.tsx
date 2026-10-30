import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Calendar, Users, FileText, Archive, GraduationCap, Menu, X, LogOut, Home, Settings, Sun, Moon, Mail } from 'lucide-react';
import { Page } from '../types';

interface AdminLayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
}

export default function AdminLayout({ currentPage, onPageChange, children }: AdminLayoutProps) {
  const { setIsAdmin, theme, toggleTheme } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-5 h-5" /> },
    { page: 'calendar', label: 'Calendrier', icon: <Calendar className="w-5 h-5" /> },
    { page: 'students', label: 'Élèves', icon: <Users className="w-5 h-5" /> },
    { page: 'invoices', label: 'Facturation', icon: <FileText className="w-5 h-5" /> },
    { page: 'archives', label: 'Archives', icon: <Archive className="w-5 h-5" /> },
    { page: 'settings', label: 'Paramètres', icon: <Settings className="w-5 h-5" /> },
    { page: 'email-test', label: 'Test Emails', icon: <Mail className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    setIsAdmin(false);
    window.location.hash = '#/';
  };

  return (
    <div className="min-h-screen theme-bg-secondary flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 theme-bg-card border-r theme-border fixed h-full">
        <div className="p-6 border-b theme-border">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <div>
              <div className="font-bold theme-text-primary">MathPro</div>
              <div className="text-xs theme-text-muted">Espace professeur</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.page}
              onClick={() => onPageChange(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                currentPage === item.page
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'theme-text-secondary hover:theme-bg-hover hover:theme-text-primary'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t theme-border space-y-2">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2 text-sm theme-text-secondary">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              <span>{theme === 'dark' ? 'Sombre' : 'Clair'}</span>
            </div>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Changer de thème"
            >
              <div className="theme-toggle-knob">
                {theme === 'dark' ? (
                  <Moon className="w-3 h-3 text-indigo-600" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-600" />
                )}
              </div>
            </button>
          </div>

          <button
            onClick={() => window.location.hash = '#/'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium theme-text-secondary hover:theme-bg-hover transition-all"
          >
            <Home className="w-5 h-5" />
            Page publique
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)}></div>
          <aside className="absolute left-0 top-0 h-full w-64 theme-bg-card shadow-xl">
            <div className="p-6 border-b theme-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
                <div className="font-bold theme-text-primary">MathPro</div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => { onPageChange(item.page); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    currentPage === item.page
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'theme-text-secondary hover:theme-bg-hover'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t theme-border space-y-2">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2 text-sm theme-text-secondary">
                  {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  <span>{theme === 'dark' ? 'Sombre' : 'Clair'}</span>
                </div>
                <button onClick={toggleTheme} className="theme-toggle">
                  <div className="theme-toggle-knob">
                    {theme === 'dark' ? <Moon className="w-3 h-3 text-indigo-600" /> : <Sun className="w-3 h-3 text-amber-600" />}
                  </div>
                </button>
              </div>
              <button
                onClick={() => { window.location.hash = '#/'; setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium theme-text-secondary hover:theme-bg-hover"
              >
                <Home className="w-5 h-5" />
                Page publique
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="theme-bg-card border-b theme-border px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 theme-text-secondary" />
              </button>
              <h1 className="text-xl font-bold theme-text-primary">
                {navItems.find(i => i.page === currentPage)?.label || 'Tableau de bord'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {/* Theme Toggle in top bar */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg theme-bg-hover theme-text-secondary hover:theme-text-primary transition-colors"
                title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
              <span className="hidden md:block text-sm font-medium theme-text-secondary">Professeur</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
