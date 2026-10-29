import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, FileText, Download, Clock, CheckCircle, AlertCircle, XCircle, Upload, Trash2, BookOpen, Euro, User, LogOut, FileUp, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { sendBookingConfirmationEmail } from '../services/googleSheetsAPI';

export default function StudentDashboardPage() {
  const { currentStudentId, getStudentById, appointments, invoices, purchaseOrders, documents, addDocument, deleteDocument, logoutStudent, addAppointment, pricingSettings, sendEmail } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'invoices' | 'documents'>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // États pour le processus de réservation
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [subject, setSubject] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(0); // 0 = mois actuel, 1 = mois suivant, 2 = mois +2

  const student = currentStudentId ? getStudentById(currentStudentId) : null;
  if (!student) return null;

  const myAppointments = appointments.filter(a => a.studentId === student.id && !a.archived);
  const myInvoices = invoices.filter(i => i.studentId === student.id);
  const myPOs = purchaseOrders.filter(po => po.studentId === student.id);
  const myDocuments = documents.filter(d => d.studentId === student.id);

  const upcomingAppointments = myAppointments
    .filter(a => a.date >= format(new Date(), 'yyyy-MM-dd') && a.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const pastAppointments = myAppointments
    .filter(a => a.date < format(new Date(), 'yyyy-MM-dd') || a.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalSpent = myAppointments
    .filter(a => a.paid)
    .reduce((sum, a) => sum + a.price, 0);

  const totalDue = myAppointments
    .filter(a => !a.paid && (a.status === 'confirmed' || a.status === 'completed'))
    .reduce((sum, a) => sum + a.price, 0);

  // Fonctions pour le processus de réservation
  const activeAppointments = appointments.filter(a => !a.archived && a.status !== 'cancelled');
  const availableTimes = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const getAvailableDates = () => {
    const dates = [];
    const now = new Date();
    // Utiliser le fuseau horaire de Paris
    const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const today = new Date(parisTime.getFullYear(), parisTime.getMonth(), parisTime.getDate());

    // Mois cible : mois actuel + calendarMonth
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + calendarMonth, 1);
    const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day);
      // Inclure aujourd'hui et les jours futurs, exclure les dimanches
      if (date >= today && date.getDay() !== 0) {
        dates.push(date);
      }
    }
    return dates;
  };

  const getMonthLabel = () => {
    const now = new Date();
    const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const today = new Date(parisTime.getFullYear(), parisTime.getMonth(), parisTime.getDate());
    const targetMonth = new Date(today.getFullYear(), today.getMonth() + calendarMonth, 1);
    return format(targetMonth, 'MMMM yyyy', { locale: fr });
  };

  const isTimeSlotPassed = (date: string, time: string) => {
    const now = new Date();
    const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < parisTime;
  };

  const isTimeSlotAvailable = (date: string, time: string) => {
    return !activeAppointments.some(a => a.date === date && a.time === time);
  };

  const getBookingPrice = () => {
    switch (selectedDuration) {
      case 60: return pricingSettings.price1h;
      case 90: return pricingSettings.price1h30;
      case 120: return pricingSettings.price2h;
      default: return pricingSettings.price1h;
    }
  };

  const handleSubmitBooking = () => {
    if (!student) return;

    addAppointment({
      studentId: student.id,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      subject,
      status: 'pending',
      notes: bookingNotes,
      price: getBookingPrice(),
      paid: false,
    });

    // Envoyer l'email de confirmation de réservation
    if (student.email) {
      sendBookingConfirmationEmail(
        student.email,
        student.firstName,
        selectedDate,
        selectedTime,
        selectedDuration,
        subject,
        getBookingPrice()
      );

      // Logger l'email
      sendEmail(
        student.email,
        `Confirmation de réservation - MS Académie`,
        `Bonjour ${student.firstName},\n\nVotre réservation a été enregistrée avec succès !\n\n📅 Détails du cours :\n• Date : ${format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}\n• Heure : ${selectedTime}\n• Durée : ${selectedDuration} minutes\n• Matière : ${subject}\n• Tarif : ${getBookingPrice()}€\n\nVotre demande est en attente de confirmation par le professeur.\n\nCordialement,\nL'équipe MS Académie`,
        'booking-confirmation',
        student.id
      );
    }

    setBookingConfirmed(true);
  };

  const resetBookingForm = () => {
    setBookingStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDuration(60);
    setSubject('');
    setBookingNotes('');
    setBookingConfirmed(false);
    setShowBookingModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        addDocument({
          studentId: student.id,
          name: file.name,
          type: 'other',
          uploadedBy: 'student',
          size: file.size,
          dataUrl,
        });
      };
      reader.readAsDataURL(file);
    });

    setShowUploadModal(false);
  };

  const handleDownloadDocument = (doc: typeof documents[0]) => {
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = doc.name;
    link.click();
  };

  const handlePrintInvoice = (invoice: typeof invoices[0]) => {
    const printContent = `
      <html>
      <head><title>Facture ${invoice.number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .title { font-size: 28px; font-weight: bold; color: #4F46E5; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #F3F4F6; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #E5E7EB; }
        .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
      </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">MathPro</div>
            <div>Cours particuliers de mathématiques</div>
          </div>
          <div style="text-align: right;">
            <h2>FACTURE</h2>
            <div>N° ${invoice.number}</div>
            <div>Date: ${format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}</div>
          </div>
        </div>
        <div style="margin-bottom: 30px;">
          <strong>Élève:</strong> ${student.firstName} ${student.lastName}<br/>
          ${student.email}
        </div>
        <table>
          <thead><tr><th>Description</th><th>Qté</th><th>Prix</th><th>Total</th></tr></thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr><td>${item.description}</td><td>${item.quantity}</td><td>${item.unitPrice}€</td><td>${item.total}€</td></tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Total: ${invoice.total}€</div>
      </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return null;
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div>
              <div className="font-bold text-gray-900">{student.firstName} {student.lastName}</div>
              <div className="text-xs text-gray-500">{student.level}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.hash = '#/'}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Accueil
            </button>
            <button
              onClick={() => window.location.hash = '#/student-profile'}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-4 h-4" /> Profil
            </button>
            <button
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 text-sm text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg transition-colors"
            >
              <Calendar className="w-4 h-4" /> Réserver
            </button>
            <button
              onClick={logoutStudent}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="text-xs text-gray-500">À venir</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-xs text-gray-500">Terminés</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{pastAppointments.length}</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-5 h-5 text-green-600" />
              <span className="text-xs text-gray-500">Payé</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalSpent}€</div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-5 h-5 text-red-600" />
              <span className="text-xs text-gray-500">Dû</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{totalDue}€</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 w-fit">
          {[
            { id: 'overview', label: 'Vue d\'ensemble', icon: <Calendar className="w-4 h-4" /> },
            { id: 'appointments', label: 'Mes cours', icon: <BookOpen className="w-4 h-4" /> },
            { id: 'invoices', label: 'Factures', icon: <FileText className="w-4 h-4" /> },
            { id: 'documents', label: 'Documents', icon: <FileUp className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Next appointment */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-sm font-medium text-indigo-100 mb-2">Prochain cours</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xl font-bold">{upcomingAppointments[0].subject}</div>
                    <div className="text-indigo-100 mt-1">
                      {format(new Date(upcomingAppointments[0].date + 'T00:00:00'), 'EEEE dd MMMM', { locale: fr })} à {upcomingAppointments[0].time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{upcomingAppointments[0].duration}min</div>
                    <div className="text-indigo-200 text-sm">{upcomingAppointments[0].price}€</div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent appointments */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Derniers cours</h3>
              {myAppointments.length === 0 ? (
                <p className="text-gray-400 text-center py-6">Aucun cours enregistré</p>
              ) : (
                <div className="space-y-3">
                  {myAppointments
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 5)
                    .map(apt => (
                      <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                        {getStatusIcon(apt.status)}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{apt.subject}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(apt.date + 'T00:00:00'), 'dd MMM yyyy', { locale: fr })} à {apt.time}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{apt.price}€</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {getStatusLabel(apt.status)}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Cours à venir</h3>
              {upcomingAppointments.length === 0 ? (
                <p className="text-gray-400 text-center py-6">Aucun cours à venir</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map(apt => (
                    <div key={apt.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                      {getStatusIcon(apt.status)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{apt.subject}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(apt.date + 'T00:00:00'), 'EEEE dd MMMM yyyy', { locale: fr })} à {apt.time} • {apt.duration}min
                        </div>
                        {apt.notes && <div className="text-xs text-gray-400 mt-1">{apt.notes}</div>}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{apt.price}€</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {getStatusLabel(apt.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Historique</h3>
              {pastAppointments.length === 0 ? (
                <p className="text-gray-400 text-center py-6">Aucun historique</p>
              ) : (
                <div className="space-y-3">
                  {pastAppointments.map(apt => (
                    <div key={apt.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                      {getStatusIcon(apt.status)}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{apt.subject}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(apt.date + 'T00:00:00'), 'dd MMM yyyy', { locale: fr })} à {apt.time}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{apt.price}€</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Invoices */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Factures</h3>
              {myInvoices.length === 0 ? (
                <p className="text-gray-400 text-center py-6">Aucune facture disponible</p>
              ) : (
                <div className="space-y-3">
                  {myInvoices.map(invoice => (
                    <div key={invoice.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                      <FileText className="w-8 h-8 text-indigo-500" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{invoice.number}</div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(invoice.date), 'dd MMMM yyyy', { locale: fr })} • Échéance: {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{invoice.total}€</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {invoice.status === 'paid' ? 'Payée' : invoice.status === 'sent' ? 'Envoyée' : invoice.status === 'overdue' ? 'En retard' : 'Brouillon'}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePrintInvoice(invoice)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Télécharger / Imprimer"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase Orders */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Bons de commande</h3>
              {myPOs.length === 0 ? (
                <p className="text-gray-400 text-center py-6">Aucun bon de commande</p>
              ) : (
                <div className="space-y-3">
                  {myPOs.map(po => (
                    <div key={po.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100">
                      <FileText className="w-8 h-8 text-green-500" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{po.number}</div>
                        <div className="text-sm text-gray-500">{format(new Date(po.date), 'dd MMMM yyyy', { locale: fr })}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{po.total}€</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          po.status === 'approved' ? 'bg-green-100 text-green-700' :
                          po.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {po.status === 'approved' ? 'Approuvé' : po.status === 'rejected' ? 'Rejeté' : 'En attente'}
                        </span>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900">Mes documents</h3>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition-colors"
              >
                <Upload className="w-4 h-4" /> Uploader
              </button>
            </div>

            {myDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">Aucun document uploadé</p>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="mt-4 text-indigo-600 font-medium text-sm hover:text-indigo-700"
                >
                  Uploader un document
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {myDocuments.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                    <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{doc.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(doc.size)} • {format(new Date(doc.createdAt), 'dd/MM/yyyy')}</div>
                    </div>
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {doc.uploadedBy === 'student' && (
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Uploader un document</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm mb-4">Glissez vos fichiers ici ou cliquez pour sélectionner</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                />
                <span className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                  Choisir des fichiers
                </span>
              </label>
              <p className="text-xs text-gray-400 mt-3">PDF, DOC, JPG, PNG — Max 10 MB</p>
            </div>
            <button
              onClick={() => setShowUploadModal(false)}
              className="w-full mt-4 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={resetBookingForm}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Réserver un cours
              </h2>
              <button onClick={resetBookingForm} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Confirmation */}
              {bookingConfirmed ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Réservation envoyée !</h3>
                  <p className="text-gray-600 mb-6">
                    Votre demande de cours de <strong>{subject}</strong> a été envoyée.
                    <br />
                    Le professeur vous confirmera le créneau sous 24h.
                  </p>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 text-left">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Date :</span>
                      <span className="font-semibold text-indigo-700">
                        {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Heure :</span>
                      <span className="font-semibold text-indigo-700">{selectedTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Durée :</span>
                      <span className="font-semibold text-indigo-700">{selectedDuration} min</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">Tarif :</span>
                      <span className="font-semibold text-indigo-700">{getBookingPrice()}€</span>
                    </div>
                  </div>
                  <button
                    onClick={resetBookingForm}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
                  >
                    Fermer
                  </button>
                </div>
              ) : (
                <>
                  {/* Progress Steps */}
                  <div className="flex items-center justify-center mb-8">
                    {[1, 2].map((s) => (
                      <React.Fragment key={s}>
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
                          bookingStep >= s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {s}
                        </div>
                        {s < 2 && (
                          <div className={`w-16 h-1 mx-2 rounded ${bookingStep > s ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Step 1: Choose Date & Time */}
                  {bookingStep === 1 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Choisissez votre créneau</h3>

                      {/* Duration */}
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Durée du cours</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 60, label: '1h', price: `${pricingSettings.price1h}€` },
                            { value: 90, label: '1h30', price: `${pricingSettings.price1h30}€` },
                            { value: 120, label: '2h', price: `${pricingSettings.price2h}€` },
                          ].map(d => (
                            <button
                              key={d.value}
                              onClick={() => setSelectedDuration(d.value)}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                selectedDuration === d.value
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-gray-200 hover:border-indigo-300'
                              }`}
                            >
                              <div className="font-bold text-lg">{d.label}</div>
                              <div className="text-sm text-gray-500">{d.price}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date Selection */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-semibold text-gray-700">Date</label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCalendarMonth(Math.max(0, calendarMonth - 1))}
                              disabled={calendarMonth === 0}
                              className={`p-2 rounded-lg transition-all ${
                                calendarMonth === 0
                                  ? 'opacity-30 cursor-not-allowed bg-gray-100'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center capitalize">
                              {getMonthLabel()}
                            </span>
                            <button
                              onClick={() => setCalendarMonth(Math.min(2, calendarMonth + 1))}
                              disabled={calendarMonth === 2}
                              className={`p-2 rounded-lg transition-all ${
                                calendarMonth === 2
                                  ? 'opacity-30 cursor-not-allowed bg-gray-100'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              }`}
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-2">
                          {getAvailableDates().map(date => {
                            const dateStr = format(date, 'yyyy-MM-dd');
                            return (
                              <button
                                key={dateStr}
                                onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                                className={`p-3 rounded-xl text-center transition-all ${
                                  selectedDate === dateStr
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'bg-white hover:bg-indigo-50 border-2 border-gray-300 text-gray-700 hover:border-indigo-400'
                                }`}
                              >
                                <div className="text-xs font-medium">{format(date, 'EEE', { locale: fr })}</div>
                                <div className="text-lg font-bold">{format(date, 'd')}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Selection */}
                      {selectedDate && (
                        <div className="mb-6">
                          <label className="block text-sm font-semibold text-gray-700 mb-3">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Heure
                          </label>
                          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                            {availableTimes.map(time => {
                              const available = isTimeSlotAvailable(selectedDate, time);
                              const passed = isTimeSlotPassed(selectedDate, time);
                              return (
                                <button
                                  key={time}
                                  onClick={() => available && !passed && setSelectedTime(time)}
                                  disabled={!available || passed}
                                  className={`p-3 rounded-xl text-center font-medium transition-all ${
                                    passed
                                      ? 'bg-red-50 text-red-300 cursor-not-allowed line-through'
                                      : !available
                                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                                      : selectedTime === time
                                      ? 'bg-indigo-600 text-white shadow-lg'
                                      : 'bg-gray-50 hover:bg-indigo-50 border border-gray-200'
                                  }`}
                                >
                                  {time}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setBookingStep(2)}
                        disabled={!selectedDate || !selectedTime}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Continuer <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Step 2: Course Details */}
                  {bookingStep === 2 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Détails du cours</h3>

                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-semibold text-indigo-700">
                            {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
                          </span>
                          <span className="text-indigo-400">•</span>
                          <span className="text-indigo-600">{selectedTime}</span>
                          <span className="text-indigo-400">•</span>
                          <span className="text-indigo-600">{selectedDuration} min</span>
                          <span className="ml-auto font-bold text-indigo-700">{getBookingPrice()}€</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Sujet du cours *</label>
                          <input
                            type="text"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Ex: Suites et limites, Géométrie dans l'espace..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Notes complémentaires</label>
                          <textarea
                            value={bookingNotes}
                            onChange={e => setBookingNotes(e.target.value)}
                            placeholder="Points à travailler, objectifs, manuels utilisés..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setBookingStep(1)}
                          className="px-6 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                          Retour
                        </button>
                        <button
                          onClick={handleSubmitBooking}
                          disabled={!subject}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" /> Confirmer la réservation
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
