import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { sendEmailViaGoogle, testConnection } from '../services/googleSheetsAPI';

export default function EmailTestPage() {
  const { students } = useApp();
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('Test Email - MS Académie');
  const [testBody, setTestBody] = useState('Ceci est un email de test depuis MS Académie.\n\nSi vous recevez cet email, la configuration est correcte !');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleTestConnection = async () => {
    setSending(true);
    setResult(null);
    setLogs([]);

    addLog('🔍 Test de connexion au script Google Apps Script...');

    const result = await testConnection();

    if (result.success) {
      addLog('✅ Connexion réussie !');
      setResult({ success: true, message: 'Connexion à Google Sheets réussie' });
    } else {
      addLog(`❌ Erreur: ${result.message}`);
      setResult({ success: false, message: result.message });
    }

    setSending(false);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setResult({ success: false, message: 'Veuillez entrer une adresse email' });
      return;
    }

    setSending(true);
    setResult(null);
    setLogs([]);

    addLog('📧 Début de l\'envoi de l\'email de test...');
    addLog(`📧 Destinataire: ${testEmail}`);
    addLog(`📧 Sujet: ${testSubject}`);

    const result = await sendEmailViaGoogle(testEmail, testSubject, testBody);

    if (result.success) {
      addLog('✅ Email envoyé avec succès !');
      addLog('📬 Vérifiez votre boîte de réception (et les spams)');
      setResult({ success: true, message: 'Email envoyé avec succès ! Vérifiez votre boîte de réception.' });
    } else {
      addLog(`❌ Erreur: ${result.message}`);
      setResult({ success: false, message: result.message });
    }

    setSending(false);
  };

  const handleSendToAllStudents = async () => {
    if (students.length === 0) {
      setResult({ success: false, message: 'Aucun élève dans la base de données' });
      return;
    }

    setSending(true);
    setResult(null);
    setLogs([]);

    addLog(`📧 Envoi d'emails à ${students.length} élèves...`);

    let successCount = 0;
    let errorCount = 0;

    for (const student of students) {
      if (student.email) {
        addLog(`📧 Envoi à ${student.firstName} ${student.lastName} (${student.email})`);
        const result = await sendEmailViaGoogle(
          student.email,
          'Test Email - MS Académie',
          `Bonjour ${student.firstName},\n\nCeci est un email de test.`
        );

        if (result.success) {
          successCount++;
          addLog(`✅ Email envoyé à ${student.email}`);
        } else {
          errorCount++;
          addLog(`❌ Erreur pour ${student.email}: ${result.message}`);
        }

        // Attendre 1 seconde entre chaque email pour éviter les limites
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    addLog(`\n📊 Résumé: ${successCount} envoyés, ${errorCount} erreurs`);
    setResult({
      success: errorCount === 0,
      message: `${successCount} emails envoyés, ${errorCount} erreurs`
    });

    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="w-6 h-6 text-indigo-600" />
          Test d'envoi d'emails
        </h2>
      </div>

      {/* Résultat */}
      {result && (
        <div className={`rounded-xl p-4 flex items-start gap-3 ${
          result.success
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
              {result.success ? 'Succès' : 'Erreur'}
            </p>
            <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>
          </div>
        </div>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <div className="bg-gray-900 rounded-xl p-4 max-h-96 overflow-y-auto">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Logs de diagnostic
          </h3>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="text-sm text-gray-300 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test de connexion */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          Étape 1 : Tester la connexion
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Vérifiez que le script Google Apps Script est accessible et correctement configuré.
        </p>
        <button
          onClick={handleTestConnection}
          disabled={sending}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Test en cours...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Tester la connexion
            </>
          )}
        </button>
      </div>

      {/* Test d'envoi d'email */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-green-600" />
          Étape 2 : Envoyer un email de test
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Envoyez un email de test pour vérifier que le système fonctionne correctement.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email du destinataire *
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={e => setTestEmail(e.target.value)}
              placeholder="votre.email@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sujet
            </label>
            <input
              type="text"
              value={testSubject}
              onChange={e => setTestSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Corps de l'email
            </label>
            <textarea
              value={testBody}
              onChange={e => setTestBody(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
            />
          </div>

          <button
            onClick={handleSendTestEmail}
            disabled={sending || !testEmail}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer l'email de test
              </>
            )}
          </button>
        </div>
      </div>

      {/* Envoi en masse */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-purple-600" />
          Étape 3 : Envoyer à tous les élèves (optionnel)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Envoyez un email de test à tous les élèves de la base de données.
          <span className="font-semibold text-orange-600"> Attention : {students.length} emails seront envoyés !</span>
        </p>
        <button
          onClick={handleSendToAllStudents}
          disabled={sending || students.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Envoi en cours...
            </>
          ) : (
            <>
              <Mail className="w-5 h-5" />
              Envoyer à tous les élèves ({students.length})
            </>
          )}
        </button>
      </div>

      {/* Guide de dépannage */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Guide de dépannage
        </h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <strong>1. Vérifiez la configuration :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Le script Google Apps Script est bien déployé</li>
              <li>L'URL du script est correcte dans les secrets GitHub</li>
              <li>La clé API est correcte</li>
            </ul>
          </div>
          <div>
            <strong>2. Vérifiez les autorisations Gmail :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Ouvrez le script Google Apps Script</li>
              <li>Exécutez une fonction qui envoie un email</li>
              <li>Autorisez l'accès à Gmail si demandé</li>
            </ul>
          </div>
          <div>
            <strong>3. Vérifiez les quotas Gmail :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Compte Gmail personnel : 100 emails/jour</li>
              <li>Compte Google Workspace : 1500 emails/jour</li>
            </ul>
          </div>
          <div>
            <strong>4. Consultez les logs :</strong>
            <ul className="list-disc list-inside ml-4 mt-1">
              <li>Onglet "Emails" dans Google Sheets</li>
              <li>Dossier "Envoyés" dans Gmail</li>
              <li>Console du navigateur (F12)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
