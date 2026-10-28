import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Database, Trash2, Home } from 'lucide-react';

export default function DiagnosticPage() {
  const { isAdmin, setIsAdmin, currentStudentId, students, appointments } = useApp();
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);
  const [testPassword, setTestPassword] = useState('');
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    loadDiagnosticInfo();
  }, []);

  const loadDiagnosticInfo = () => {
    try {
      const rawData = localStorage.getItem('mathprof_data_v2');
      const data = rawData ? JSON.parse(rawData) : null;

      setDiagnosticInfo({
        hasData: !!data,
        hasStudents: data?.students?.length || 0,
        hasAppointments: data?.appointments?.length || 0,
        isAdmin: data?.isAdmin || false,
        currentStudentId: data?.currentStudentId || null,
        theme: localStorage.getItem('mathprof_theme') || 'dark',
        rawDataSize: rawData ? rawData.length : 0,
        students: data?.students?.slice(0, 3) || [],
        sampleStudent: data?.students?.[0] || null,
      });
    } catch (error) {
      setDiagnosticInfo({
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        hasData: false,
      });
    }
  };

  const handleForceReset = () => {
    if (confirm('⚠️ Cette action va supprimer TOUTES les données. Continuer ?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleLoadDemoData = () => {
    // Charger les données de démonstration manuellement
    const demoData = {
      students: [
        {
          id: 'demo-student-1',
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie.dupont@email.com',
          phone: '06 12 34 56 78',
          level: 'Terminale S',
          notes: 'Préparation bac',
          password: 'Marie2026',
          createdAt: new Date().toISOString(),
          archived: false,
        },
        {
          id: 'demo-student-2',
          firstName: 'Lucas',
          lastName: 'Martin',
          email: 'lucas.martin@email.com',
          phone: '06 98 76 54 32',
          level: 'Première S',
          notes: 'Renforcement',
          password: 'Lucas2026',
          createdAt: new Date().toISOString(),
          archived: false,
        },
      ],
      appointments: [],
      invoices: [],
      purchaseOrders: [],
      documents: [],
      companyInfo: {
        companyName: 'MathPro',
        siret: '12345678900001',
        email: 'contact@mathpro.fr',
        phone: '0612345678',
      },
      emailLogs: [],
      automationSettings: {
        autoGeneratePurchaseOrder: true,
        autoGenerateInvoice: true,
        autoSendEmails: true,
      },
      pricingSettings: {
        price1h: 45,
        price1h30: 65,
        price2h: 85,
      },
      isAdmin: false,
      currentStudentId: null,
    };

    localStorage.setItem('mathprof_data_v2', JSON.stringify(demoData));
    window.location.reload();
  };

  const handleTestLogin = () => {
    if (testPassword === 'prof2026' || testPassword === 'admin') {
      setTestResult('success');
      setIsAdmin(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } else {
      setTestResult('error');
    }
  };

  const handleTestStudentLogin = (email: string, password: string) => {
    const student = students.find(s => s.email === email && s.password === password);
    if (student) {
      setTestResult('success');
      window.location.href = '/#student-login';
    } else {
      setTestResult('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-amber-500" />
                Page de Diagnostic
              </h1>
              <p className="text-gray-600 mt-2">
                Cette page vous aide à identifier et résoudre les problèmes de connexion
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              Accueil
            </button>
          </div>

          {/* Diagnostic Info */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <Database className="w-5 h-5" />
                État du localStorage
              </h3>
              {diagnosticInfo ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Données présentes :</span>
                    <span className={`font-mono ${diagnosticInfo.hasData ? 'text-green-600' : 'text-red-600'}`}>
                      {diagnosticInfo.hasData ? '✓ Oui' : '✗ Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre d'élèves :</span>
                    <span className="font-mono text-gray-900">{diagnosticInfo.hasStudents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre de RDV :</span>
                    <span className="font-mono text-gray-900">{diagnosticInfo.hasAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin connecté :</span>
                    <span className={`font-mono ${diagnosticInfo.isAdmin ? 'text-green-600' : 'text-gray-600'}`}>
                      {diagnosticInfo.isAdmin ? '✓ Oui' : '✗ Non'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thème actuel :</span>
                    <span className="font-mono text-gray-900">{diagnosticInfo.theme}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taille des données :</span>
                    <span className="font-mono text-gray-900">{diagnosticInfo.rawDataSize} octets</span>
                  </div>
                  {diagnosticInfo.error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <span className="text-red-700 text-xs">Erreur : {diagnosticInfo.error}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">Chargement...</p>
              )}
            </div>

            {/* Sample Student */}
            {diagnosticInfo?.sampleStudent && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Premier élève trouvé
                </h3>
                <div className="space-y-1 text-sm font-mono">
                  <div><span className="text-gray-600">Nom :</span> {diagnosticInfo.sampleStudent.firstName} {diagnosticInfo.sampleStudent.lastName}</div>
                  <div><span className="text-gray-600">Email :</span> {diagnosticInfo.sampleStudent.email}</div>
                  <div><span className="text-gray-600">Mot de passe :</span> <span className="bg-green-100 px-2 py-0.5 rounded">{diagnosticInfo.sampleStudent.password}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions de dépannage</h2>

          <div className="space-y-4">
            {/* Force Reset */}
            <div className="border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Réinitialisation forcée
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Supprime complètement le localStorage et recharge la page
              </p>
              <button
                onClick={handleForceReset}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                🗑️ Forcer la réinitialisation
              </button>
            </div>

            {/* Load Demo Data */}
            <div className="border border-blue-200 rounded-xl p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Charger les données de démo
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Charge manuellement les données de démonstration
              </p>
              <button
                onClick={handleLoadDemoData}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                📥 Charger les données de démonstration
              </button>
            </div>

            {/* Test Login */}
            <div className="border border-green-200 rounded-xl p-4">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Tester la connexion
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Testez directement la connexion professeur
              </p>
              <div className="space-y-3">
                <input
                  type="password"
                  value={testPassword}
                  onChange={(e) => setTestPassword(e.target.value)}
                  placeholder="Entrez le mot de passe (prof2026 ou admin)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                />
                <button
                  onClick={handleTestLogin}
                  className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                >
                  🔐 Tester la connexion
                </button>
                {testResult === 'success' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    ✓ Connexion réussie ! Redirection en cours...
                  </div>
                )}
                {testResult === 'error' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ✗ Mot de passe incorrect
                  </div>
                )}
              </div>
            </div>

            {/* Quick Student Login */}
            <div className="border border-purple-200 rounded-xl p-4">
              <h3 className="font-semibold text-purple-900 mb-2">
                Connexion rapide élève
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleTestStudentLogin('marie.dupont@email.com', 'Marie2026')}
                  className="w-full bg-purple-100 text-purple-900 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  👩‍🎓 Marie Dupont (marie.dupont@email.com / Marie2026)
                </button>
                <button
                  onClick={() => handleTestStudentLogin('lucas.martin@email.com', 'Lucas2026')}
                  className="w-full bg-purple-100 text-purple-900 py-2 rounded-lg hover:bg-purple-200 transition-colors text-sm"
                >
                  👨‍🎓 Lucas Martin (lucas.martin@email.com / Lucas2026)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Aide</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Si la réinitialisation ne fonctionne pas :</strong>
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>Ouvrez la console du navigateur (F12)</li>
              <li>Allez dans l'onglet "Application" ou "Storage"</li>
              <li>Cliquez sur "Local Storage" dans la barre latérale</li>
              <li>Cliquez sur votre domaine</li>
              <li>Cliquez sur "mathprof_data_v2"</li>
              <li>Appuyez sur la touche "Suppr" ou "Delete"</li>
              <li>Rafraîchissez la page (F5)</li>
            </ol>
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800">
                <strong>⚠️ Important :</strong> Si le problème persiste, essayez dans un autre navigateur ou en mode navigation privée.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
