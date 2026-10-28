import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Clock, BookOpen, CheckCircle, ArrowRight, GraduationCap, Star, Users, Award, TrendingUp, Calculator, Sigma, Pi, FunctionSquare, Atom, FlaskConical, LogIn, UserPlus, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function HomePage() {
  const { students, appointments, addAppointment, addStudent, theme, toggleTheme, sendEmail, findStudentByEmailOrPhone, pricingSettings } = useApp();
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
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [isNewAccount, setIsNewAccount] = useState(false);

  const activeAppointments = appointments.filter(a => !a.archived && a.status !== 'cancelled');
  const availableTimes = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'];

  const [calendarMonth, setCalendarMonth] = useState(0); // 0 = mois actuel, 1 = mois suivant, 2 = mois +2

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

  const isTimeSlotAvailable = (date: string, time: string) => {
    return !activeAppointments.some(a => a.date === date && a.time === time);
  };

  const isTimeSlotPassed = (date: string, time: string) => {
    const now = new Date();
    const parisTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Paris' }));
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    return slotDate < parisTime;
  };

  const getPrice = () => {
    switch (selectedDuration) {
      case 60: return pricingSettings.price1h;
      case 90: return pricingSettings.price1h30;
      case 120: return pricingSettings.price2h;
      default: return pricingSettings.price1h;
    }
  };

  const handleSubmitBooking = () => {
    let studentId = existingStudentId;
    let password = '';
    let isNew = false;

    // Si c'est un nouvel élève (pas un élève existant sélectionné)
    if (!isExistingStudent) {
      // Vérifier si l'email existe déjà
      const existingStudent = findStudentByEmailOrPhone(studentInfo.email);

      if (existingStudent) {
        // L'élève existe déjà, utiliser son compte
        studentId = existingStudent.id;
        password = existingStudent.password;
        isNew = false;
      } else {
        // Créer un nouveau compte
        password = Math.random().toString(36).slice(-8).toUpperCase();
        addStudent({
          firstName: studentInfo.firstName,
          lastName: studentInfo.lastName,
          email: studentInfo.email,
          phone: studentInfo.phone,
          level: studentInfo.level,
          notes: '',
          password: password,
        });

        // Récupérer l'ID du nouvel élève créé
        const allStudents = [...students];
        studentId = allStudents[allStudents.length - 1]?.id || '';
        isNew = true;

        // Envoyer l'email avec le mot de passe
        sendEmail(
          studentInfo.email,
          `Bienvenue sur MathPro - Votre compte a été créé`,
          `Bonjour ${studentInfo.firstName},\n\nVotre compte MathPro a été créé avec succès !\n\nVos identifiants de connexion :\n- Email : ${studentInfo.email}\n- Mot de passe : ${password}\n\nVous pouvez maintenant accéder à votre espace élève pour :\n- Consulter vos cours à venir\n- Télécharger vos factures et bons de commande\n- Uploader des documents\n- Réserver de nouveaux cours\n\nPour vous connecter, rendez-vous sur la page d'accueil et cliquez sur "Espace élève".\n\nCordialement,\nL'équipe MathPro`,
          'password',
          studentId
        );
      }
    }

    if (!studentId) {
      studentId = students[0]?.id || 'temp-' + Date.now();
      if (!students.find(s => s.id === studentId)) {
        password = Math.random().toString(36).slice(-8).toUpperCase();
        addStudent({
          firstName: studentInfo.firstName || 'Nouveau',
          lastName: studentInfo.lastName || 'Élève',
          email: studentInfo.email || '',
          phone: studentInfo.phone || '',
          level: studentInfo.level || '',
          notes: '',
          password: password,
        });
        isNew = true;

        if (studentInfo.email) {
          sendEmail(
            studentInfo.email,
            `Bienvenue sur MathPro - Votre compte a été créé`,
            `Bonjour ${studentInfo.firstName || 'Nouveau'},\n\nVotre compte MathPro a été créé avec succès !\n\nVos identifiants de connexion :\n- Email : ${studentInfo.email}\n- Mot de passe : ${password}\n\nCordialement,\nL'équipe MathPro`,
            'password',
            studentId
          );
        }
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

    setGeneratedPassword(password);
    setIsNewAccount(isNew);
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
    setGeneratedPassword('');
    setIsNewAccount(false);
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen theme-bg-primary flex items-center justify-center p-4">
        <div className="theme-bg-card rounded-3xl shadow-2xl p-12 max-w-lg text-center border theme-border">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold theme-text-primary mb-4">Réservation confirmée !</h2>

          {/* Message pour nouveau compte */}
          {isNewAccount && generatedPassword && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6 text-left">
              <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                🎉 Votre compte a été créé !
              </h3>
              <p className="text-sm text-blue-800 mb-4">
                Un email contenant vos identifiants a été envoyé à <strong>{studentInfo.email}</strong>
              </p>
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold mb-2">VOS IDENTIFIANTS</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email :</span>
                    <span className="font-mono font-semibold text-gray-900">{studentInfo.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mot de passe :</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">{generatedPassword}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                💡 Conservez ces informations, vous en aurez besoin pour vous connecter
              </p>
            </div>
          )}

          {/* Message pour élève existant */}
          {!isNewAccount && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-green-800">
                ✅ Votre réservation a été ajoutée à votre compte existant
              </p>
            </div>
          )}

          {/* Détails de la réservation */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 mb-6 text-left">
            <div className="text-sm font-semibold theme-text-primary mb-3">Détails de votre cours</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="theme-text-secondary">Sujet :</span>
                <span className="font-semibold theme-text-primary">{subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-secondary">Date :</span>
                <span className="font-semibold theme-text-primary">
                  {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-secondary">Heure :</span>
                <span className="font-semibold theme-text-primary">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="theme-text-secondary">Durée :</span>
                <span className="font-semibold theme-text-primary">{selectedDuration} min</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="theme-text-secondary">Tarif :</span>
                <span className="font-bold text-indigo-600 text-lg">{getPrice()}€</span>
              </div>
            </div>
          </div>

          <p className="theme-text-secondary mb-6 text-sm">
            Le professeur vous confirmera le créneau sous 24h.
          </p>

          <div className="flex flex-col gap-3">
            {isNewAccount && (
              <button
                onClick={() => {
                  window.location.hash = '#student-login';
                }}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-all"
              >
                Se connecter à mon espace élève
              </button>
            )}
            <button
              onClick={resetForm}
              className={`${isNewAccount ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-500'} px-8 py-3 rounded-xl font-semibold transition-all`}
            >
              {isNewAccount ? 'Nouvelle réservation' : 'Nouvelle réservation'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Symboles mathématiques - beaucoup plus visibles en mode light */}
        <div className={`absolute top-20 left-[10%] text-7xl font-bold animate-pulse ${theme === 'dark' ? 'text-indigo-500/10' : 'text-indigo-600/40'}`}>∑</div>
        <div className={`absolute top-40 right-[15%] text-6xl font-bold animate-pulse ${theme === 'dark' ? 'text-purple-500/10' : 'text-purple-600/40'}`} style={{ animationDelay: '0.5s' }}>∫</div>
        <div className={`absolute top-[60%] left-[5%] text-8xl font-bold animate-pulse ${theme === 'dark' ? 'text-blue-500/10' : 'text-blue-600/40'}`} style={{ animationDelay: '1s' }}>π</div>
        <div className={`absolute top-[30%] right-[8%] text-5xl font-bold animate-pulse ${theme === 'dark' ? 'text-cyan-500/10' : 'text-cyan-600/40'}`} style={{ animationDelay: '1.5s' }}>Δ</div>
        <div className={`absolute bottom-[20%] right-[20%] text-6xl font-bold animate-pulse ${theme === 'dark' ? 'text-indigo-500/10' : 'text-indigo-600/40'}`} style={{ animationDelay: '2s' }}>∞</div>
        <div className={`absolute bottom-[40%] left-[20%] text-5xl font-bold animate-pulse ${theme === 'dark' ? 'text-purple-500/10' : 'text-purple-600/40'}`} style={{ animationDelay: '0.8s' }}>√</div>
        <div className={`absolute top-[50%] left-[50%] text-4xl font-bold animate-pulse ${theme === 'dark' ? 'text-blue-500/10' : 'text-blue-600/40'}`} style={{ animationDelay: '1.2s' }}>θ</div>
        <div className={`absolute top-[15%] left-[40%] text-5xl font-bold animate-pulse ${theme === 'dark' ? 'text-cyan-500/10' : 'text-cyan-600/40'}`} style={{ animationDelay: '0.3s' }}>φ</div>

        {/* Grille - beaucoup plus visible en mode light */}
        <div className={`absolute inset-0 ${theme === 'dark' ? 'opacity-[0.03]' : 'opacity-[0.15]'}`} style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}></div>

        {/* Orbes de lumière - beaucoup plus visibles en mode light */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-indigo-600/20' : 'bg-indigo-500/50'}`}></div>
        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-purple-600/20' : 'bg-purple-500/50'}`}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sigma className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>MathPro</span>
            <span className={`text-xs block -mt-1 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Cours de mathématiques</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              theme === 'dark'
                ? 'border-gray-700 hover:border-gray-500 bg-slate-800/50'
                : 'border-gray-400 hover:border-gray-500 bg-white shadow-md'
            }`}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-700" />}
          </button>
          <button
            onClick={() => window.location.hash = '#student-login'}
            className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-xl transition-all ${
              theme === 'dark'
                ? 'text-indigo-400 hover:text-indigo-300 border-indigo-500/30 hover:border-indigo-400'
                : 'text-indigo-700 hover:text-indigo-800 border-indigo-400 hover:border-indigo-500 bg-white shadow-sm'
            }`}
          >
            <LogIn className="w-4 h-4" /> Espace élève
          </button>
          <button
            onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg"
          >
            Réserver un cours
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 pt-12 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${
              theme === 'dark'
                ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-300'
                : 'bg-indigo-100 border-2 border-indigo-300 text-indigo-700'
            }`}>
              <Star className="w-4 h-4 text-yellow-400" />
              <span>+10 ans d'expérience • +200 élèves accompagnés</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Maîtrisez les</span><br />
              <span className={`bg-gradient-to-r bg-clip-text text-transparent ${theme === 'dark' ? 'from-indigo-400 via-purple-400 to-cyan-400' : 'from-indigo-600 via-purple-600 to-cyan-600'}`}>
                mathématiques
              </span>
            </h1>
            <p className={`text-lg mb-8 max-w-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
                className={`flex items-center gap-2 px-6 py-3 border rounded-xl font-semibold transition-all ${
                  theme === 'dark'
                    ? 'border-gray-700 theme-text-secondary hover:border-gray-500 hover:theme-text-primary'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900'
                }`}
              >
                Voir les matières
              </button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-6 mt-12 pt-8 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
              <div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>95%</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Réussite au bac</div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>+200</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Élèves formés</div>
              </div>
              <div>
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>4.9/5</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Visual Element */}
          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className={`absolute inset-[15%] rounded-full backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/20'
                  : 'bg-gradient-to-br from-indigo-500/40 to-purple-500/40 border-2 border-indigo-400/50'
              }`}></div>
              <div className={`absolute inset-[25%] rounded-full flex items-center justify-center ${
                theme === 'dark'
                  ? 'bg-gradient-to-br from-indigo-600/40 to-purple-600/40'
                  : 'bg-gradient-to-br from-indigo-600/60 to-purple-600/60'
              }`}>
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2 drop-shadow-lg">f(x)</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-indigo-200' : 'text-white'}`}>Fonctions & Analyse</div>
                </div>
              </div>
              <div className={`absolute top-[5%] left-1/2 -translate-x-1/2 backdrop-blur rounded-2xl p-4 shadow-2xl ${
                theme === 'dark' ? 'bg-slate-800/80 border border-gray-700' : 'bg-white border-2 border-gray-300'
              }`}>
                <Calculator className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Calcul</div>
              </div>
              <div className={`absolute bottom-[5%] left-1/2 -translate-x-1/2 backdrop-blur rounded-2xl p-4 shadow-2xl ${
                theme === 'dark' ? 'bg-slate-800/80 border border-gray-700' : 'bg-white border-2 border-gray-300'
              }`}>
                <Pi className={`w-8 h-8 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Géométrie</div>
              </div>
              <div className={`absolute left-[5%] top-1/2 -translate-y-1/2 backdrop-blur rounded-2xl p-4 shadow-2xl ${
                theme === 'dark' ? 'bg-slate-800/80 border border-gray-700' : 'bg-white border-2 border-gray-300'
              }`}>
                <FunctionSquare className={`w-8 h-8 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Fonctions</div>
              </div>
              <div className={`absolute right-[5%] top-1/2 -translate-y-1/2 backdrop-blur rounded-2xl p-4 shadow-2xl ${
                theme === 'dark' ? 'bg-slate-800/80 border border-gray-700' : 'bg-white border-2 border-gray-300'
              }`}>
                <Atom className={`w-8 h-8 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>Probabilités</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Section */}
      <section id="subjects" className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Domaines d'enseignement</h2>
          <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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
            <div key={idx} className={`group rounded-2xl p-5 transition-all hover:-translate-y-1 ${
              theme === 'dark'
                ? 'bg-slate-900/50 backdrop-blur border border-gray-800 hover:border-indigo-500/50'
                : 'bg-white border-2 border-gray-400 hover:border-indigo-500 shadow-lg hover:shadow-2xl'
            }`}>
              <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform shadow-xl`}>
                {item.icon}
              </div>
              <h3 className={`font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Booking Section */}
      <section id="booking" className="relative z-10 max-w-4xl mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Réservez votre cours</h2>
          <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Processus simple en 3 étapes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all ${
                step >= s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : theme === 'dark' ? 'bg-slate-800 text-gray-500 border border-gray-700' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-indigo-600' : theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className={`rounded-3xl p-8 md:p-12 shadow-2xl ${
          theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-xl border border-gray-800' : 'bg-white border border-gray-200'
        }`}>
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold theme-text-primary mb-2 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-indigo-400" />
                Choisissez votre créneau
              </h2>
              <p className="theme-text-secondary mb-8">Sélectionnez la date et l'heure qui vous conviennent</p>

              <div className="mb-8">
                <label className="block text-sm font-semibold theme-text-secondary mb-3">Durée du cours</label>
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
                          ? 'border-indigo-500 bg-indigo-500/10 theme-text-primary'
                          : theme === 'dark' ? 'border-gray-700 bg-slate-800/50 text-gray-400 hover:border-gray-600' : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-lg">{d.label}</div>
                      <div className="text-sm text-indigo-400">{d.price}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold theme-text-secondary">Date</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarMonth(Math.max(0, calendarMonth - 1))}
                      disabled={calendarMonth === 0}
                      className={`p-2 rounded-lg transition-all ${
                        calendarMonth === 0
                          ? 'opacity-30 cursor-not-allowed'
                          : theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium theme-text-primary min-w-[140px] text-center capitalize">
                      {getMonthLabel()}
                    </span>
                    <button
                      onClick={() => setCalendarMonth(Math.min(2, calendarMonth + 1))}
                      disabled={calendarMonth === 2}
                      className={`p-2 rounded-lg transition-all ${
                        calendarMonth === 2
                          ? 'opacity-30 cursor-not-allowed'
                          : theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
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
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                            : theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-800 border border-gray-700 text-gray-300' : 'bg-white hover:bg-indigo-50 border-2 border-gray-300 text-gray-700 hover:border-indigo-400'
                        }`}
                      >
                        <div className="text-xs font-medium">{format(date, 'EEE', { locale: fr })}</div>
                        <div className="text-lg font-bold">{format(date, 'd')}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="mb-8">
                  <label className="block text-sm font-semibold theme-text-secondary mb-3">
                    <Clock className="w-4 h-4 inline mr-1" /> Heure
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
                              ? theme === 'dark' ? 'bg-red-900/20 text-red-400 cursor-not-allowed line-through' : 'bg-red-50 text-red-300 cursor-not-allowed line-through'
                              : !available
                              ? theme === 'dark' ? 'bg-slate-800/30 text-gray-600 cursor-not-allowed line-through' : 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                              : selectedTime === time
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : theme === 'dark' ? 'bg-slate-800/50 hover:bg-slate-800 border border-gray-700 text-gray-300' : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700'
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

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold theme-text-primary mb-2 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                Détails du cours
              </h2>
              <p className="theme-text-secondary mb-8">Précisez le sujet et vos besoins</p>

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
                  <label className="block text-sm font-semibold theme-text-secondary mb-2">Sujet du cours *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Ex: Suites et limites, Géométrie dans l'espace..."
                    className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all ${
                      theme === 'dark' ? 'bg-slate-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold theme-text-secondary mb-2">Notes complémentaires</label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Points à travailler, objectifs, manuels utilisés..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none ${
                      theme === 'dark' ? 'bg-slate-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(1)}
                  className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                    theme === 'dark' ? 'border border-gray-700 text-gray-300 hover:bg-slate-800' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
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

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold theme-text-primary mb-2 flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-400" />
                Vos informations
              </h2>
              <p className="theme-text-secondary mb-8">Pour finaliser votre réservation</p>

              {students.length > 0 && (
                <div className="mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isExistingStudent}
                      onChange={e => setIsExistingStudent(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm font-medium theme-text-secondary">Je suis déjà élève</span>
                  </label>
                </div>
              )}

              {isExistingStudent ? (
                <div className="mb-6">
                  <label className="block text-sm font-semibold theme-text-secondary mb-2">Sélectionnez votre profil</label>
                  <select
                    value={existingStudentId}
                    onChange={e => setExistingStudentId(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none ${
                      theme === 'dark' ? 'bg-slate-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                    }`}
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
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Prénom *</label>
                    <input
                      type="text"
                      value={studentInfo.firstName}
                      onChange={e => setStudentInfo({ ...studentInfo, firstName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none ${
                        theme === 'dark' ? 'bg-slate-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Nom *</label>
                    <input
                      type="text"
                      value={studentInfo.lastName}
                      onChange={e => setStudentInfo({ ...studentInfo, lastName: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none ${
                        theme === 'dark' ? 'bg-slate-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Email *</label>
                    <input
                      type="email"
                      value={studentInfo.email}
                      onChange={e => setStudentInfo({ ...studentInfo, email: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none ${
                        theme === 'dark' ? 'bg-slate-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      value={studentInfo.phone}
                      onChange={e => setStudentInfo({ ...studentInfo, phone: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none ${
                        theme === 'dark' ? 'bg-slate-800 border-gray-700 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold theme-text-secondary mb-2">Niveau scolaire *</label>
                    <select
                      value={studentInfo.level}
                      onChange={e => setStudentInfo({ ...studentInfo, level: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl border focus:border-indigo-500 outline-none ${
                        theme === 'dark' ? 'bg-slate-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
                      }`}
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
                  className={`px-6 py-4 rounded-xl font-semibold transition-all ${
                    theme === 'dark' ? 'border border-gray-700 text-gray-300 hover:bg-slate-800' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
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
          <h3 className={`text-2xl font-bold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tarifs transparents</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { duration: '1h', price: `${pricingSettings.price1h}€`, desc: 'Séance ponctuelle' },
              { duration: '1h30', price: `${pricingSettings.price1h30}€`, desc: 'Recommandé', popular: true },
              { duration: '2h', price: `${pricingSettings.price2h}€`, desc: 'Session intensive' },
            ].map(t => (
              <div key={t.duration} className={`p-6 rounded-2xl border-2 ${
                t.popular
                  ? 'border-indigo-500 bg-indigo-500/10 shadow-xl'
                  : theme === 'dark' ? 'border-gray-800 bg-slate-900/50' : 'border-gray-400 bg-white shadow-lg'
              }`}>
                {t.popular && <span className={`text-xs font-bold px-3 py-1 rounded-full ${theme === 'dark' ? 'text-indigo-300 bg-indigo-500/20' : 'text-indigo-700 bg-indigo-100'}`}>Populaire</span>}
                <div className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{t.price}</div>
                <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{t.duration} / séance</div>
                <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t py-8 mt-16 ${theme === 'dark' ? 'border-gray-800' : 'border-gray-300'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Sigma className="w-6 h-6 text-indigo-400" />
              <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>MathPro</span>
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>— Cours particuliers de mathématiques</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.hash = '#student-login'}
                className={`flex items-center gap-2 text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <UserPlus className="w-4 h-4" /> Espace élève
              </button>
              <button
                onClick={() => window.location.hash = '#admin'}
                className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Espace professeur
              </button>
              <a
                href="/guide-github.html"
                target="_blank"
                className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              >
                📤 Guide GitHub
              </a>
              <a
                href="#reset"
                className={`text-sm transition-colors ${theme === 'dark' ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
              >
                🔄 Réinitialiser
              </a>
            </div>
          </div>
          <div className={`text-center text-xs mt-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2026 MathPro — Tous droits réservés
          </div>
        </div>
      </footer>
    </div>
  );
}
