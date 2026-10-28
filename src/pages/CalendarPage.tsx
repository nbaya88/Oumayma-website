import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, Trash2, Archive, Edit2, Save } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function CalendarPage() {
  const { appointments, students, getStudentById, confirmAppointment, cancelAppointment, deleteAppointment, archiveAppointment, completeAppointment, updateAppointment } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    duration: 60,
    subject: '',
    status: 'pending' as 'pending' | 'confirmed' | 'cancelled' | 'completed',
    notes: '',
    price: 45,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayAppointments = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(a => a.date === dateStr && !a.archived);
  };

  const selectedDayAppointments = selectedDay ? getDayAppointments(selectedDay) : [];

  const handleConfirm = (id: string) => {
    confirmAppointment(id);
  };

  const handleCancel = (id: string) => {
    cancelAppointment(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Supprimer définitivement ce rendez-vous ?')) {
      deleteAppointment(id);
    }
  };

  const handleArchive = (id: string) => {
    archiveAppointment(id);
    setShowModal(false);
  };

  const handleMarkCompleted = (id: string) => {
    completeAppointment(id);
  };

  const handleEdit = (id: string) => {
    const apt = appointments.find(a => a.id === id);
    if (apt) {
      setEditForm({
        date: apt.date,
        time: apt.time,
        duration: apt.duration,
        subject: apt.subject,
        status: apt.status,
        notes: apt.notes,
        price: apt.price,
      });
      setEditMode(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedAppointment) {
      updateAppointment(selectedAppointment, editForm);
      setEditMode(false);
      setShowModal(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    updateAppointment(id, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-amber-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Calendrier</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-green-500"></span> Confirmé
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span> En attente
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> Annulé
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span> Terminé
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: fr })}
            </h3>
            <button
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month start */}
            {Array.from({ length: (monthStart.getDay() + 6) % 7 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            {days.map(day => {
              const dayAppts = getDayAppointments(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-start transition-all relative ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : isCurrentDay
                      ? 'bg-indigo-50 border-2 border-indigo-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayAppts.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayAppts.slice(0, 3).map((apt, idx) => (
                        <span
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/80' : getStatusColor(apt.status)}`}
                        ></span>
                      ))}
                      {dayAppts.length > 3 && (
                        <span className={`text-[8px] ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>+{dayAppts.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {selectedDay
              ? format(selectedDay, 'EEEE dd MMMM', { locale: fr })
              : 'Sélectionnez un jour'}
          </h3>

          {selectedDay && (
            <>
              {selectedDayAppointments.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Aucun rendez-vous ce jour</p>
              ) : (
                <div className="space-y-3">
                  {selectedDayAppointments
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map(apt => {
                      const student = getStudentById(apt.studentId);
                      return (
                        <div
                          key={apt.id}
                          onClick={() => { setSelectedAppointment(apt.id); setShowModal(true); setEditMode(false); }}
                          className="p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {student ? `${student.firstName} ${student.lastName}` : '—'}
                              </div>
                              <div className="text-sm text-gray-500">{apt.subject}</div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                              apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {getStatusLabel(apt.status)}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {apt.time} ({apt.duration}min)
                            </span>
                            <span className="font-medium text-gray-700">{apt.price}€</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Appointment Detail Modal */}
      {showModal && selectedAppointment && (() => {
        const apt = appointments.find(a => a.id === selectedAppointment);
        if (!apt) return null;
        const student = getStudentById(apt.studentId);

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowModal(false); setEditMode(false); }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {editMode ? 'Modifier le rendez-vous' : 'Détails du rendez-vous'}
                </h3>
                {!editMode && (
                  <button
                    onClick={() => handleEdit(apt.id)}
                    className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Modifier
                  </button>
                )}
              </div>

              {!editMode ? (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Élève</span>
                      <span className="font-medium">{student ? `${student.firstName} ${student.lastName}` : '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date</span>
                      <span className="font-medium">{format(new Date(apt.date + 'T00:00:00'), 'dd MMMM yyyy', { locale: fr })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Heure</span>
                      <span className="font-medium">{apt.time} ({apt.duration}min)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sujet</span>
                      <span className="font-medium">{apt.subject}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Statut</span>
                      <select
                        value={apt.status}
                        onChange={(e) => handleStatusChange(apt.id, e.target.value as any)}
                        className={`text-xs font-medium px-3 py-1.5 rounded-full border-0 cursor-pointer ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Prix</span>
                      <span className="font-medium">{apt.price}€ {apt.paid ? '(Payé)' : '(Non payé)'}</span>
                    </div>
                    {apt.notes && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-gray-500 text-sm">Notes:</span>
                        <p className="text-sm text-gray-700 mt-1">{apt.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { handleArchive(apt.id); setShowModal(false); }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors text-sm"
                    >
                      <Archive className="w-4 h-4" /> Archiver
                    </button>
                    <button
                      onClick={() => { handleDelete(apt.id); setShowModal(false); }}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Supprimer
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        value={editForm.date}
                        onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                      <select
                        value={editForm.time}
                        onChange={e => setEditForm({ ...editForm, time: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                      >
                        {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes)</label>
                      <select
                        value={editForm.duration}
                        onChange={e => {
                          const duration = parseInt(e.target.value);
                          const price = duration === 60 ? 45 : duration === 90 ? 65 : 85;
                          setEditForm({ ...editForm, duration, price });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                      >
                        <option value={60}>60 min (45€)</option>
                        <option value={90}>90 min (65€)</option>
                        <option value={120}>120 min (85€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sujet</label>
                      <input
                        type="text"
                        value={editForm.subject}
                        onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                      <select
                        value={editForm.status}
                        onChange={e => setEditForm({ ...editForm, status: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                      >
                        <option value="pending">En attente</option>
                        <option value="confirmed">Confirmé</option>
                        <option value="completed">Terminé</option>
                        <option value="cancelled">Annulé</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={e => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea
                        value={editForm.notes}
                        onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors text-sm"
                    >
                      <Save className="w-4 h-4" /> Enregistrer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
