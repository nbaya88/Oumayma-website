import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, BookOpen, CheckCircle, ArrowRight, GraduationCap, Star, Users } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HomePage() {
  const { students, appointments, addAppointment, addStudent, getStudentById } = useApp();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [studentInfo, setStudentInfo] = useState({ firstName: '', lastName: '', email: '', phone: '', level: '' });
  const [existingStudentId, setExistingStudentId] = useState('');
  const [isExistingStudent, setIsExistingStudent] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const activeAppointments = appointments.filter(a => !a.archived && a.status !== 'cancelled');

  const availableTimes = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = addDays(today, i);
      if (date.getDay() !== 0) { // Exclude Sunday
        dates.push(date);
      }
    }
    return dates;
  };

  const isTimeSlotAvailable = (date: string, time: string) => {
    return !activeAppointments.some(a => a.date === date && a.time === time);
  };

  const getPrice = () => {
    switch (selectedDuration) {
      case 60: return 45;
      case 90: return 65;
      case 120: return 85;
      default: return 45;
    }
  };

  const handleSubmitBooking = () => {
    let studentId = existingStudentId;

    if (!isExistingStudent) {
      addStudent({
        firstName: studentInfo.firstName,
        lastName: studentInfo.lastName,
        email: studentInfo.email,
        phone: studentInfo.phone,
        level: studentInfo.level,
        notes: '',
      });
      // Get the last added student
      const allStudents = [...students];
      studentId = allStudents[allStudents.length - 1]?.id || '';
    }

    if (!studentId) {
      // Fallback: use the first student or create inline
      studentId = students[0]?.id || 'temp-' + Date.now();
      if (!students.find(s => s.id === studentId)) {
        addStudent({
          firstName: studentInfo.firstName || 'Nouveau',
          lastName: studentInfo.lastName || 'Élève',
          email: studentInfo.email || '',
          phone: studentInfo.phone || '',
          level: studentInfo.level || '',
          notes: '',
        });
      }
    }

    addAppointment({
      studentId,
      date: selectedDate,
      time: selectedTime,
      duration: selectedDuration,
      subject,
      status: 'pending',
      notes,
      price: getPrice(),
      paid: false,
    });

    setBookingConfirmed(true);
  };

  const resetForm = () => {
    setStep(1);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedDuration(60);
    setSubject('');
    setNotes('');
    setStudentInfo({ firstName: '', lastName: '', email: '', phone: '', level: '' });
    setExistingStudentId('');
    setIsExistingStudent(false);
    setBookingConfirmed(false);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Réservation confirmée !</h2>
          <p className="text-gray-600 mb-6">
            Votre cours de <strong>{subject}</strong> est prévu le{' '}
            <strong>{format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}</strong> à{' '}
            <strong>{selectedTime}</strong>.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Vous recevrez une confirmation par email. Le professeur validera votre créneau sous 24h.
          </p>
          <button
            onClick={resetForm}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            Nouvelle réservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-8xl font-bold text-white/20">∑</div>
          <div className="absolute top-20 right-20 text-6xl font-bold text-white/20">π</div>
          <div className="absolute bottom-10 left-1/3 text-7xl font-bold text-white/20">∫</div>
          <div className="absolute bottom-20 right-10 text-5xl font-bold text-white/20">Δ</div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center mb-6">
            <GraduationCap className="w-12 h-12 text-white mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">MathPro</h1>
          </div>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto mb-8">
            Cours particuliers de mathématiques — Collège, Lycée, Supérieur
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-white/90">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <span>+10 ans d'expérience</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-300" />
              <span>+200 élèves accompagnés</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-yellow-300" />
              <span>95% de réussite au bac</span>
            </div>
          </div>
        </div>
      </header>

      {/* Booking Section */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
                step >= s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
          {/* Step 1: Choose Date & Time */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-600" />
                Choisissez votre créneau
              </h2>
              <p className="text-gray-500 mb-8">Sélectionnez la date et l'heure qui vous conviennent</p>

              {/* Duration */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Durée du cours</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 60, label: '1h', price: '45€' },
                    { value: 90, label: '1h30', price: '65€' },
                    { value: 120, label: '2h', price: '85€' },
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
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Date</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {getAvailableDates().map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={dateStr}
                        onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedDate === dateStr
                            ? 'bg-indigo-600 text-white shadow-lg'
                            : 'bg-gray-50 hover:bg-indigo-50 border border-gray-200'
                        }`}
                      >
                        <div className="text-xs font-medium">{format(date, 'EEE', { locale: fr })}</div>
                        <div className="text-lg font-bold">{format(date, 'd')}</div>
                        <div className="text-xs">{format(date, 'MMM', { locale: fr })}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Heure
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {availableTimes.map(time => {
                      const available = isTimeSlotAvailable(selectedDate, time);
                      return (
                        <button
                          key={time}
                          onClick={() => available && setSelectedTime(time)}
                          disabled={!available}
                          className={`p-3 rounded-xl text-center font-medium transition-all ${
                            !available
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
                onClick={() => setStep(2)}
                disabled={!selectedDate || !selectedTime}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Course Details */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                Détails du cours
              </h2>
              <p className="text-gray-500 mb-8">Précisez le sujet et vos besoins</p>

              <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-indigo-700">
                    {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <span className="text-indigo-400">•</span>
                  <span className="text-indigo-600">{selectedTime}</span>
                  <span className="text-indigo-400">•</span>
                  <span className="text-indigo-600">{selectedDuration} min</span>
                  <span className="ml-auto font-bold text-indigo-700">{getPrice()}€</span>
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
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Points à travailler, objectifs, manuels utilisés..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!subject}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continuer <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Student Info */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                Vos informations
              </h2>
              <p className="text-gray-500 mb-8">Pour finaliser votre réservation</p>

              {students.length > 0 && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExistingStudent}
                      onChange={e => setIsExistingStudent(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Je suis déjà élève</span>
                  </label>
                </div>
              )}

              {isExistingStudent ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sélectionnez votre profil</label>
                  <select
                    value={existingStudentId}
                    onChange={e => setExistingStudentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    <option value="">-- Choisir --</option>
                    {students.filter(s => !s.archived).map(s => (
                      <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.level})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={studentInfo.firstName}
                      onChange={e => setStudentInfo({ ...studentInfo, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={studentInfo.lastName}
                      onChange={e => setStudentInfo({ ...studentInfo, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={studentInfo.email}
                      onChange={e => setStudentInfo({ ...studentInfo, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={studentInfo.phone}
                      onChange={e => setStudentInfo({ ...studentInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau scolaire *</label>
                    <select
                      value={studentInfo.level}
                      onChange={e => setStudentInfo({ ...studentInfo, level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
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
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-4 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={isExistingStudent ? !existingStudentId : !studentInfo.firstName || !studentInfo.lastName}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Confirmer la réservation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Tarifs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { duration: '1h', price: '45€', desc: 'Séance ponctuelle' },
              { duration: '1h30', price: '65€', desc: 'Recommandé', popular: true },
              { duration: '2h', price: '85€', desc: 'Session intensive' },
            ].map(t => (
              <div key={t.duration} className={`p-6 rounded-2xl border-2 ${t.popular ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}>
                {t.popular && <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">Populaire</span>}
                <div className="text-3xl font-bold text-gray-900 mt-2">{t.price}</div>
                <div className="text-gray-500">{t.duration} / séance</div>
                <div className="text-sm text-gray-400 mt-2">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="w-6 h-6 text-indigo-400 mr-2" />
            <span className="text-white font-bold">MathPro</span>
          </div>
          <p className="text-sm">© 2026 MathPro — Cours particuliers de mathématiques</p>
          <button
            onClick={() => window.location.hash = '#admin'}
            className="mt-4 text-xs text-gray-600 hover:text-gray-400 transition-colors"
          >
            Espace professeur
          </button>
        </div>
      </footer>
    </div>
  );
}
