import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Users, FileText, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardPage() {
  const { students, appointments, invoices, purchaseOrders, getStudentById } = useApp();

  const activeAppointments = appointments.filter(a => !a.archived);
  const activeStudents = students.filter(s => !s.archived);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayAppointments = activeAppointments.filter(a => a.date === todayStr);
  const pendingAppointments = activeAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = activeAppointments.filter(a => a.status === 'confirmed');
  const cancelledAppointments = activeAppointments.filter(a => a.status === 'cancelled');

  const totalRevenue = activeAppointments
    .filter(a => a.status === 'completed' && a.paid)
    .reduce((sum, a) => sum + a.price, 0);

  const pendingRevenue = activeAppointments
    .filter(a => (a.status === 'confirmed' || a.status === 'completed') && !a.paid)
    .reduce((sum, a) => sum + a.price, 0);

  const upcomingAppointments = activeAppointments
    .filter(a => a.date >= todayStr && a.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Actifs</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{activeStudents.length}</div>
          <div className="text-sm text-gray-500">Élèves</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Aujourd'hui</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{todayAppointments.length}</div>
          <div className="text-sm text-gray-500">RDV aujourd'hui</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">En attente</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pendingAppointments.length}</div>
          <div className="text-sm text-gray-500">À confirmer</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Euro className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Encaissé</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalRevenue}€</div>
          <div className="text-sm text-gray-500">{pendingRevenue}€ en attente</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Prochains rendez-vous
          </h3>
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucun rendez-vous à venir</p>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map(apt => {
                const student = getStudentById(apt.studentId);
                return (
                  <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className={`w-3 h-3 rounded-full ${
                      apt.status === 'confirmed' ? 'bg-green-500' :
                      apt.status === 'pending' ? 'bg-amber-500' :
                      apt.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {student ? `${student.firstName} ${student.lastName}` : 'Élève inconnu'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">{apt.subject}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {format(new Date(apt.date + 'T00:00:00'), 'dd MMM', { locale: fr })}
                      </div>
                      <div className="text-sm text-gray-500">{apt.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Résumé de la semaine
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-green-50">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Confirmés</span>
              </div>
              <span className="font-bold text-green-700">{confirmedAppointments.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">En attente</span>
              </div>
              <span className="font-bold text-amber-700">{pendingAppointments.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-red-50">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Annulés</span>
              </div>
              <span className="font-bold text-red-700">{cancelledAppointments.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Factures</span>
              </div>
              <span className="font-bold text-blue-700">{invoices.length}</span>
            </div>
          </div>

          {/* Revenue chart placeholder */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
            <div className="text-sm text-gray-600 mb-2">Chiffre d'affaires du mois</div>
            <div className="text-2xl font-bold text-indigo-700">
              {activeAppointments
                .filter(a => {
                  const aptDate = new Date(a.date);
                  const now = new Date();
                  return aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
                })
                .reduce((sum, a) => sum + a.price, 0)}€
            </div>
            <div className="mt-2 h-2 bg-indigo-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-generated documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Bons de commande auto-générés
          </h3>
          {purchaseOrders.filter(po => po.autoGenerated).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Confirmez un RDV pour générer automatiquement un bon de commande
            </p>
          ) : (
            <div className="space-y-2">
              {purchaseOrders.filter(po => po.autoGenerated).slice(-3).reverse().map(po => {
                const student = getStudentById(po.studentId);
                return (
                  <div key={po.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{po.number}</div>
                      <div className="text-xs text-gray-500">{student ? `${student.firstName} ${student.lastName}` : '—'}</div>
                    </div>
                    <span className="text-sm font-bold text-blue-700">{po.total}€</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Factures auto-générées
          </h3>
          {invoices.filter(i => i.autoGenerated).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-4">
              Passez un RDV en "Terminé" pour générer automatiquement une facture
            </p>
          ) : (
            <div className="space-y-2">
              {invoices.filter(i => i.autoGenerated).slice(-3).reverse().map(inv => {
                const student = getStudentById(inv.studentId);
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{inv.number}</div>
                      <div className="text-xs text-gray-500">{student ? `${student.firstName} ${student.lastName}` : '—'}</div>
                    </div>
                    <span className="text-sm font-bold text-green-700">{inv.total}€</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Dernières réservations</h3>
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700">
          <strong>💡 Automatisation :</strong> Les bons de commande sont générés automatiquement lors de la confirmation d'un RDV, et les factures lors du passage en "Terminé". Les emails sont envoyés automatiquement aux élèves.
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="pb-3 font-medium">Élève</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Heure</th>
                <th className="pb-3 font-medium">Sujet</th>
                <th className="pb-3 font-medium">Statut</th>
                <th className="pb-3 font-medium">Prix</th>
              </tr>
            </thead>
            <tbody>
              {activeAppointments
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 8)
                .map(apt => {
                  const student = getStudentById(apt.studentId);
                  return (
                    <tr key={apt.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">
                        {student ? `${student.firstName} ${student.lastName}` : '—'}
                      </td>
                      <td className="py-3 text-gray-600">
                        {format(new Date(apt.date + 'T00:00:00'), 'dd/MM/yyyy')}
                      </td>
                      <td className="py-3 text-gray-600">{apt.time}</td>
                      <td className="py-3 text-gray-600 max-w-[200px] truncate">{apt.subject}</td>
                      <td className="py-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {apt.status === 'confirmed' ? 'Confirmé' :
                           apt.status === 'pending' ? 'En attente' :
                           apt.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-gray-900">{apt.price}€</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
