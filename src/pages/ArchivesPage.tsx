import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Archive, Trash2, RotateCcw, Search, Users, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ArchivesPage() {
  const { students, appointments, invoices, updateStudent, updateAppointment } = useApp();
  const [activeTab, setActiveTab] = useState<'students' | 'appointments'>('students');
  const [search, setSearch] = useState('');

  const archivedStudents = students.filter(s => s.archived);
  const archivedAppointments = appointments.filter(a => a.archived);

  const filteredArchivedStudents = archivedStudents.filter(s =>
    `${s.firstName} ${s.lastName} ${s.level}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredArchivedAppointments = archivedAppointments.filter(a => {
    const student = students.find(s => s.id === a.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    return `${studentName} ${a.subject}`.toLowerCase().includes(search.toLowerCase());
  });

  const handleRestoreStudent = (id: string) => {
    updateStudent(id, { archived: false });
  };

  const handleRestoreAppointment = (id: string) => {
    updateAppointment(id, { archived: false });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Archive className="w-6 h-6 text-gray-500" />
            Archives
          </h2>
          <p className="text-gray-500 text-sm mt-1">Éléments archivés — restaurez ou supprimez définitivement</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher dans les archives..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'students' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" /> Élèves ({archivedStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
            activeTab === 'appointments' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" /> RDV ({archivedAppointments.length})
        </button>
      </div>

      {/* Archived Students */}
      {activeTab === 'students' && (
        <div className="space-y-3">
          {filteredArchivedStudents.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun élève archivé</p>
            </div>
          ) : (
            filteredArchivedStudents.map(student => (
              <div key={student.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 font-bold">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                    <div className="text-sm text-gray-500">{student.level} • Archivé le {format(new Date(student.createdAt), 'dd/MM/yyyy', { locale: fr })}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRestoreStudent(student.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium text-sm hover:bg-indigo-100 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Restaurer
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Archived Appointments */}
      {activeTab === 'appointments' && (
        <div className="space-y-3">
          {filteredArchivedAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 shadow-sm border border-gray-100">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun rendez-vous archivé</p>
            </div>
          ) : (
            filteredArchivedAppointments.map(apt => {
              const student = students.find(s => s.id === apt.studentId);
              return (
                <div key={apt.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {student ? `${student.firstName} ${student.lastName}` : '—'} — {apt.subject}
                      </div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(apt.date + 'T00:00:00'), 'dd MMMM yyyy', { locale: fr })} à {apt.time} • {apt.price}€
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestoreAppointment(apt.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium text-sm hover:bg-indigo-100 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Restaurer
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
