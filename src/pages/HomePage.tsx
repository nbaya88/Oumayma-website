import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, BookOpen, CheckCircle, ArrowRight, GraduationCap, Star, Users, Award, TrendingUp, Calculator, Sigma, Pi, FunctionSquare, Atom, FlaskConical, LogIn, UserPlus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HomePage() {
  const { students, appointments, addAppointment, addStudent } = useApp();
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
      if (date.getDay() !== 0) {
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
        password: Math.random().toString(36).slice(-8),
      });
      const allStudents = [...students];
      studentId = allStudents[allStudents.length - 1]?.id || '';
    }

    if (!studentId) {
      studentId = students[0]?.id || 'temp-' + Date.now();
      if (!students.find(s => s.id === studentId)) {
        addStudent({
          firstName: studentInfo.firstName || 'Nouveau',
          lastName: studentInfo.lastName || 'Élève',
          email: studentInfo.email || '',
          phone: studentInfo.phone || '',
          level: studentInfo.level || '',
          notes: '',
          password: Math.random().toString(36).slice(-8),
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Animated Math Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] text-7xl font-bold text-indigo-500/10 animate-pulse">∑</div>
        <div className="absolute top-40 right-[15%] text-6xl font-bold text-purple-500/10 animate-pulse" style={{ animationDelay: '0.5s' }}>∫</div>
        <div className="absolute top-[60%] left-[5%] text-8xl font-bold text-blue-500/10 animate-pulse" style={{ animationDelay: '1s' }}>π</div>
        <div className="absolute top-[30%] right-[8%] text-5xl font-bold text-cyan-500/10 animate-pulse" style={{ animationDelay: '1.5s' }}>Δ</div>
        <div className="absolute bottom-[20%] right-[20%] text-6xl font-bold text-indigo-500/10 animate-pulse" style={{ animationDelay: '2s' }}>∞</div>
        <div className="absolute bottom-[40%] left-[20%] text-5xl font-bold text-purple-500/10 animate-pulse" style={{ animationDelay: '0.8s' }}>√</div>
        <div className="absolute top-[50%] left-[50%] text-4xl font-bold text-blue-500/10 animate-pulse" style={{ animationDelay: '1.2s' }}>θ</div>
        <div className="absolute top-[15%] left-[40%] text-5xl font-bold text-cyan-500/10 animate-pulse" style={{ animationDelay: '0.3s' }}>φ</div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>
        {/* Gradient orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Sigma className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">MathPro</span>
            <span className="text-xs text-indigo-300 block -mt-1">Cours de mathématiques</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.hash = '#student-login'}
            className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl hover:border-indigo-400 transition-all"
          >
            <LogIn className="w-4 h-4" /> Espace élève
          </button>
          <button
            onClick={() => {
              document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all"
          >
            Réserver un cours
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-sm text-indigo-300 mb-6">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>+10 ans d'expérience • +200 élèves accompagnés</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className="text-white">Maîtrisez les</span><br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                mathématiques
              </span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-lg">
              Cours particuliers de la 6ème à l'enseignement supérieur. 
              Une méthode personnalisée pour chaque élève, des résultats concrets.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25"
              >
                <Calendar className="w-5 h-5" /> Réserver maintenant
              </button>
              <button
                onClick={() => document.getElementById('subjects')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-6 py-3 border border-gray-700 text-gray-300 rounded-xl font-semibold hover:border-gray-500 hover:text-white transition-all"
              >
                Voir les matières
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-gray-800">
              <div>
                <div className="text-3xl font-bold text-white">95%</div>
                <div className="text-sm text-gray-500">Réussite au bac</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">+200</div>
                <div className="text-sm text-gray-500">Élèves formés</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">4.9/5</div>
                <div className="text-sm text-gray-500">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              {/* Central circle */}
              <div className="absolute inset-[15%] bg-gradient-to-br from-indigo-600/30 to-purple-600/30 rounded-full backdrop-blur-sm border border-indigo-500/20"></div>
              <div className="absolute inset-[25%] bg-gradient-to-br from-indigo-600/40 to-purple-600/40 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2">f(x)</div>
                  <div className="text-sm text-indigo-200">Fonctions & Analyse</div>
                </div>
              </div>
              {/* Orbiting elements */}
              <div className="absolute top-[5%] left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur border border-gray-700 rounded-2xl p-4 shadow-xl">
                <Calculator className="w-8 h-8 text-indigo-400" />
                <div className="text-xs text-gray-400 mt-1">Calcul</div>
              </div>
              <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur border border-gray-700 rounded-2xl p-4 shadow-xl">
                <Pi className="w-8 h-8 text-purple-400" />
                <div className="text-xs text-gray-400 mt-1">Géométrie</div>
              </div>
              <div className="absolute left-[5%] top-1/2 -translate-y-1/2 bg-slate-800/80 backdrop-blur border border-gray-700 rounded-2xl p-4 shadow-xl">
                <FunctionSquare className="w-8 h-8 text-cyan-400" />
                <div className="text-xs text-gray-400 mt-1">Fonctions</div>
              </div>
              <div className="absolute right-[5%] top-1/2 -translate-y-1/2 bg-slate-800/80 backdrop-blur border border-gray-700 rounded-2xl p-4 shadow-xl">
                <Atom className="w-8 h-8 text-green-400" />
                <div className="text-xs text-gray-400 mt-1">Probabilités</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Domaines d'enseignement</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Un accompagnement complet dans tous les domaines des mathématiques
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <FunctionSquare className="w-6 h-6" />, title: 'Analyse', desc: 'Fonctions, limites, dérivées, intégrales', color: 'from-indigo-500 to-blue-500' },
            { icon: <Pi className="w-6 h-6" />, title: 'Géométrie', desc: 'Vecteurs, espaces, trigonométrie', color: 'from-purple-500 to-pink-500' },
            { icon: <Calculator className="w-6 h-6" />, title: 'Algèbre', desc: 'Équations, polynômes, matrices', color: 'from-cyan-500 to-teal-500' },
            { icon: <Atom className="w-6 h-6" />, title: 'Probabilités', desc: 'Statistiques, lois, dénombrement', color: 'from-green-500 to-emerald-500' },
            { icon: <TrendingUp className="w-6 h-6" />, title: 'Suites', desc: 'Récurrence, convergence, limites', color: 'from-amber-500 to-orange-500' },
            { icon: <Sigma className="w-6 h-6" />, title: 'Arithmétique', desc: 'Nombres, divisibilité, congruences', color: 'from-red-500 to-rose-500' },
            { icon: <FlaskConical className="w-6 h-6" />, title: 'Bac / Concours', desc: 'Préparation intensive aux examens', color: 'from-violet-500 to-purple-500' },
            { icon: <Award className="w-6 h-6" />, title: 'Supérieur', desc: 'Prépa, BTS, licence, master', color: 'from-sky-500 to-blue-500' },
          ].map((item, idx) => (
            <div key={idx} className="group bg-slate-900/50 backdrop-blur border border-gray-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-all hover:-translate-y-1">
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="font-bold text-white mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="relative z-10 max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Réservez votre cours</h2>
          <p className="text-gray-400">Processus simple en 3 étapes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
                step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-slate-800 text-gray-500 border border-gray-700'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-indigo-600' : 'bg-slate-800'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-gray-800 p-8 md:p-12 shadow-2xl">
          {/* Step 1: Choose Date & Time */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-400" />
                Choisissez votre créneau
              </h2>
              <p className="text-gray-400 mb-8">Sélectionnez la date et l'heure qui vous conviennent</p>

              {/* Duration */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Durée du cours</label>
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
                          ? 'border-indigo-500 bg-indigo-500/10 text-white'
                          : 'border-gray-700 bg-slate-800/50 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-bold text-lg">{d.label}</div>
                      <div className="text-sm text-indigo-300">{d.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-300 mb-3">Date</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {getAvailableDates().map(date => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={dateStr}
                        onClick={() => { setSelectedDate(dateStr); setSelectedTime(''); }}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedDate === dateStr
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : 'bg-slate-800/50 hover:bg-slate-800 border border-gray-700 text-gray-300'
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
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
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
                              ? 'bg-slate-800/30 text-gray-600 cursor-not-allowed line-through'
                              : selectedTime === time
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-slate-800/50 hover:bg-slate-800 border border-gray-700 text-gray-300'
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
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Step 2: Course Details */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                Détails du cours
              </h2>
              <p className="text-gray-400 mb-8">Précisez le sujet et vos besoins</p>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-semibold text-indigo-300">
                    {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
                  </span>
                  <span className="text-indigo-400/50">•</span>
                  <span className="text-indigo-300">{selectedTime}</span>
                  <span className="text-indigo-400/50">•</span>
                  <span className="text-indigo-300">{selectedDuration} min</span>
                  <span className="ml-auto font-bold text-indigo-300">{getPrice()}€</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Sujet du cours *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Ex: Suites et limites, Géométrie dans l'espace..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Notes complémentaires</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Points à travailler, objectifs, manuels utilisés..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-4 rounded-xl border border-gray-700 font-semibold text-gray-300 hover:bg-slate-800 transition-all"
                >
                  Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!subject}
                  className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continuer <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Student Info */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-400" />
                Vos informations
              </h2>
              <p className="text-gray-400 mb-8">Pour finaliser votre réservation</p>

              {students.length > 0 && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExistingStudent}
                      onChange={e => setIsExistingStudent(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded bg-slate-800 border-gray-700"
                    />
                    <span className="text-sm font-medium text-gray-300">Je suis déjà élève</span>
                  </label>
                </div>
              )}

              {isExistingStudent ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Sélectionnez votre profil</label>
                  <select
                    value={existingStudentId}
                    onChange={e => setExistingStudentId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-gray-700 text-white focus:border-indigo-500 outline-none"
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
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={studentInfo.firstName}
                      onChange={e => setStudentInfo({ ...studentInfo, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Nom *</label>
                    <input
                      type="text"
                      value={studentInfo.lastName}
                      onChange={e => setStudentInfo({ ...studentInfo, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Email *</label>
                    <input
                      type="email"
                      value={studentInfo.email}
                      onChange={e => setStudentInfo({ ...studentInfo, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={studentInfo.phone}
                      onChange={e => setStudentInfo({ ...studentInfo, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Niveau scolaire *</label>
                    <select
                      value={studentInfo.level}
                      onChange={e => setStudentInfo({ ...studentInfo, level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-gray-700 text-white focus:border-indigo-500 outline-none"
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
                  className="px-6 py-4 rounded-xl border border-gray-700 font-semibold text-gray-300 hover:bg-slate-800 transition-all"
                >
                  Retour
                </button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={isExistingStudent ? !existingStudentId : !studentInfo.firstName || !studentInfo.lastName}
                  className="flex-1 bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" /> Confirmer la réservation
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-white mb-8">Tarifs transparents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { duration: '1h', price: '45€', desc: 'Séance ponctuelle' },
              { duration: '1h30', price: '65€', desc: 'Recommandé', popular: true },
              { duration: '2h', price: '85€', desc: 'Session intensive' },
            ].map(t => (
              <div key={t.duration} className={`p-6 rounded-2xl border-2 ${t.popular ? 'border-indigo-500 bg-indigo-500/10' : 'border-gray-800 bg-slate-900/50'}`}>
                {t.popular && <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full">Populaire</span>}
                <div className="text-3xl font-bold text-white mt-2">{t.price}</div>
                <div className="text-gray-400">{t.duration} / séance</div>
                <div className="text-sm text-gray-500 mt-2">{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-800 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sigma className="w-6 h-6 text-indigo-400" />
              <span className="text-white font-bold">MathPro</span>
              <span className="text-gray-500 text-sm">— Cours particuliers de mathématiques</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.hash = '#student-login'}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Espace élève
              </button>
              <button
                onClick={() => window.location.hash = '#admin'}
                className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
              >
                Espace professeur
              </button>
              <a
                href="/guide-github.html"
                target="_blank"
                className="text-sm text-gray-600 hover:text-gray-400 transition-colors"
              >
                📤 Guide GitHub
              </a>
            </div>
          </div>
          <div className="text-center text-xs text-gray-600 mt-6">
            © 2026 MathPro — Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
