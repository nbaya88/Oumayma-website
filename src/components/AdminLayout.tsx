import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Calendar, Users, FileText, Archive, GraduationCap, Menu, X, LogOut, Home } from 'lucide-react';
import { Page } from '../types';

interface AdminLayoutProps {
  currentPage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
}

export default function AdminLayout({ currentPage, onPageChange, children }: AdminLayoutProps) {
  const { setIsAdmin } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { page: Page; label: string; icon: React.ReactNode }[] = [
    { page: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard className="w-5 h-5" /> },
    { page: 'calendar', label: 'Calendrier', icon: <Calendar className="w-5 h-5" /> },
    { page: 'students', label: 'Élèves', icon: <Users className="w-5 h-5" /> },
    { page: 'invoices', label: 'Facturation', icon: <FileText className="w-5 h-5" /> },
    { page: 'archives', label: 'Archives', icon: <Archive className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    setIsAdmin(false);
    onPageChange('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
            <div>
              <div className="font-bold text-gray-900">MathPro</div>
              <div className="text-xs text-gray-500">Espace professeur</div>
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
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button
            onClick={() => onPageChange('home')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
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
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
                <div className="font-bold text-gray-900">MathPro</div>
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
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-100 space-y-2">
              <button
                onClick={() => { onPageChange('home'); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
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
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 capitalize">
                {navItems.find(i => i.page === currentPage)?.label || 'Tableau de bord'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                P
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">Professeur</span>
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
