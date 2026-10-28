import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Search, Edit2, Trash2, Archive, Eye, Mail, Phone, BookOpen, X } from 'lucide-react';

export default function StudentsPage() {
  const { students, appointments, addStudent, updateStudent, deleteStudent, archiveStudent } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', level: '', notes: '' });

  const activeStudents = students.filter(s => !s.archived);
  const filteredStudents = activeStudents.filter(s =>
    `${s.firstName} ${s.lastName} ${s.level} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const getStudentAppointments = (studentId: string) => {
    return appointments.filter(a => a.studentId === studentId && !a.archived);
  };

  const getStudentBalance = (studentId: string) => {
    const studentAppts = appointments.filter(a => a.studentId === studentId && !a.archived);
    const total = studentAppts.reduce((sum, a) => sum + a.price, 0);
    const paid = studentAppts.filter(a => a.paid).reduce((sum, a) => sum + a.price, 0);
    return { total, paid, due: total - paid };
  };

  const handleSubmit = () => {
    if (editingId) {
      updateStudent(editingId, form);
    } else {
      addStudent(form);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ firstName: '', lastName: '', email: '', phone: '', level: '', notes: '' });
  };

  const handleEdit = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      setForm({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        phone: student.phone,
        level: student.level,
        notes: student.notes,
      });
      setEditingId(id);
      setShowForm(true);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer définitivement cet élève ?')) {
      deleteStudent(id);
    }
  };

  const handleArchive = (id: string) => {
    if (window.confirm('Archiver cet élève ?')) {
      archiveStudent(id);
    }
  };

  const viewingStudent = viewingId ? students.find(s => s.id === viewingId) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Élèves</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ firstName: '', lastName: '', email: '', phone: '', level: '', notes: '' }); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Nouvel élève
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un élève..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
        />
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.map(student => {
          const balance = getStudentBalance(student.id);
          const appts = getStudentAppointments(student.id);
          const upcoming = appts.filter(a => a.date >= new Date().toISOString().split('T')[0] && a.status !== 'cancelled');

          return (
            <div key={student.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {student.firstName[0]}{student.lastName[0]}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{student.firstName} {student.lastName}</div>
                    <div className="text-sm text-indigo-600 font-medium">{student.level}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setViewingId(student.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(student.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleArchive(student.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-600">
                    <Archive className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(student.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Mail className="w-3.5 h-3.5" /> {student.email}
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Phone className="w-3.5 h-3.5" /> {student.phone}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-700">{upcoming.length}</span> RDV à venir
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  balance.due > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  {balance.due > 0 ? `Dû: ${balance.due}€` : 'À jour'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun élève trouvé</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Modifier l\'élève' : 'Nouvel élève'}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <select
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                >
                  <option value="">-- Choisir --</option>
                  <option value="6ème">6ème</option>
                  <option value="5ème">5ème</option>
                  <option value="4ème">4ème</option>
                  <option value="3ème">3ème</option>
                  <option value="Seconde">Seconde</option>
                  <option value="Première">Première</option>
                  <option value="Terminale">Terminale</option>
                  <option value="BTS">BTS</option>
                  <option value="Prépa">Prépa</option>
                  <option value="Université">Université</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!form.firstName || !form.lastName}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {editingId ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Student Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Profil élève</h3>
              <button onClick={() => setViewingId(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                {viewingStudent.firstName[0]}{viewingStudent.lastName[0]}
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{viewingStudent.firstName} {viewingStudent.lastName}</div>
                <div className="text-indigo-600 font-medium">{viewingStudent.level}</div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" /> {viewingStudent.email}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" /> {viewingStudent.phone}
              </div>
              {viewingStudent.notes && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                  {viewingStudent.notes}
                </div>
              )}
            </div>

            {/* Balance */}
            {(() => {
              const balance = getStudentBalance(viewingStudent.id);
              return (
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="p-3 bg-gray-50 rounded-xl text-center">
                    <div className="text-lg font-bold text-gray-900">{balance.total}€</div>
                    <div className="text-xs text-gray-500">Total</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-xl text-center">
                    <div className="text-lg font-bold text-green-700">{balance.paid}€</div>
                    <div className="text-xs text-green-600">Payé</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-xl text-center">
                    <div className="text-lg font-bold text-red-700">{balance.due}€</div>
                    <div className="text-xs text-red-600">Dû</div>
                  </div>
                </div>
              );
            })()}

            {/* Appointments History */}
            <h4 className="font-bold text-gray-900 mb-3">Historique des cours</h4>
            <div className="space-y-2">
              {getStudentAppointments(viewingStudent.id).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">Aucun cours enregistré</p>
              ) : (
                getStudentAppointments(viewingStudent.id)
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{apt.subject}</div>
                        <div className="text-xs text-gray-500">{apt.date} à {apt.time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{apt.price}€</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {apt.status === 'confirmed' ? '✓' : apt.status === 'pending' ? '...' : apt.status === 'cancelled' ? '✗' : '✓✓'}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
