import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, Lock, ArrowLeft, User, GraduationCap, CheckCircle } from 'lucide-react';

export default function StudentLoginPage() {
  const { findStudentByEmailOrPhone, addStudent, loginStudent, generatePassword } = useApp();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'code-sent'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    level: '',
  });
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    const student = findStudentByEmailOrPhone(identifier);
    if (!student) {
      setError('Aucun compte trouvé avec cet identifiant');
      return;
    }
    if (student.password !== password) {
      setError('Mot de passe incorrect');
      return;
    }
    loginStudent(student.id);
  };

  const handleForgotPassword = () => {
    setError('');
    const student = findStudentByEmailOrPhone(identifier);
    if (!student) {
      setError('Aucun compte trouvé avec cet identifiant');
      return;
    }
    // Simulate sending password by email
    setGeneratedPassword(student.password);
    setMode('code-sent');
  };

  const handleRegister = () => {
    setError('');
    // Check if email or phone already exists
    const existingByEmail = findStudentByEmailOrPhone(registerForm.email);
    const existingByPhone = findStudentByEmailOrPhone(registerForm.phone);
    
    if (existingByEmail || existingByPhone) {
      setError('Un compte existe déjà avec cet email ou ce numéro de téléphone');
      return;
    }

    const newPassword = generatePassword();
    addStudent({
      firstName: registerForm.firstName,
      lastName: registerForm.lastName,
      email: registerForm.email,
      phone: registerForm.phone,
      level: registerForm.level,
      notes: '',
      password: newPassword,
    });

    setGeneratedPassword(newPassword);
    setMode('code-sent');
  };

  if (mode === 'code-sent') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {generatedPassword ? 'Mot de passe envoyé !' : 'Compte créé !'}
          </h2>
          <p className="text-gray-600 mb-6">
            Un email contenant votre mot de passe a été envoyé à votre adresse.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Démo :</strong> Voici votre mot de passe (normalement envoyé par email) :
            </p>
            <div className="bg-white rounded-lg px-4 py-3 font-mono text-lg font-bold text-blue-700 border border-blue-200">
              {generatedPassword}
            </div>
          </div>
          <button
            onClick={() => {
              setMode('login');
              setPassword('');
              setIdentifier('');
            }}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all"
          >
            Se connecter maintenant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Espace Élève</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mode === 'login' && 'Connectez-vous pour accéder à votre espace'}
            {mode === 'register' && 'Créez votre compte élève'}
            {mode === 'forgot' && 'Récupérez votre mot de passe'}
          </p>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ou numéro de téléphone
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="exemple@email.com ou 06 12 34 56 78"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="Votre mot de passe"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={!identifier || !password}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Se connecter
            </button>

            <div className="text-center space-y-2 pt-2">
              <button
                onClick={() => { setMode('forgot'); setError(''); }}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Mot de passe oublié ?
              </button>
              <div className="text-gray-400">•</div>
              <button
                onClick={() => { setMode('register'); setError(''); }}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Pas encore de compte ? S'inscrire
              </button>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={() => window.location.hash = ''}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
              </button>
            </div>
          </div>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email ou numéro de téléphone
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  placeholder="exemple@email.com ou 06 12 34 56 78"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <strong>💡 Info :</strong> Votre mot de passe sera envoyé par email à l'adresse associée à votre compte.
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={!identifier}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Envoyer le mot de passe
            </button>

            <button
              onClick={() => { setMode('login'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Retour à la connexion
            </button>
          </div>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={registerForm.firstName}
                  onChange={e => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                  placeholder="Marie"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  type="text"
                  value={registerForm.lastName}
                  onChange={e => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                  placeholder="Dupont"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                  placeholder="marie.dupont@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau scolaire *
              </label>
              <select
                value={registerForm.level}
                onChange={e => setRegisterForm({ ...registerForm, level: e.target.value })}
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

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <strong>💡 Info :</strong> Un mot de passe sera généré automatiquement et envoyé par email après l'inscription.
            </div>

            <button
              onClick={handleRegister}
              disabled={!registerForm.firstName || !registerForm.lastName || !registerForm.email || !registerForm.phone || !registerForm.level}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Créer mon compte
            </button>

            <button
              onClick={() => { setMode('login'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Déjà un compte ? Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
