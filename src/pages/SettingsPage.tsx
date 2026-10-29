import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Save, CheckCircle, FileText, CreditCard, MapPin, Phone, Mail, Globe, AlertCircle, Settings, Euro, Database } from 'lucide-react';
import { saveAllData, loadAllData, testConnection } from '../services/googleSheetsAPI';

export default function SettingsPage() {
  const { companyInfo, updateCompanyInfo, automationSettings, updateAutomationSettings, pricingSettings, updatePricingSettings, emailLogs, students, appointments, invoices, purchaseOrders, documents } = useApp();
  const [form, setForm] = useState(companyInfo);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'company' | 'bank' | 'automation' | 'pricing' | 'email-config' | 'google-sheets' | 'emails'>('company');
  const [emailConfig, setEmailConfig] = useState({
    serviceId: localStorage.getItem('emailjs_service_id') || '',
    templateId: localStorage.getItem('emailjs_template_id') || '',
    publicKey: localStorage.getItem('emailjs_public_key') || '',
  });
  const [emailConfigSaved, setEmailConfigSaved] = useState(false);

  const [googleSheetsConfig, setGoogleSheetsConfig] = useState({
    scriptUrl: localStorage.getItem('google_sheets_url') || '',
    apiKey: localStorage.getItem('google_sheets_api_key') || '',
  });
  const [googleSheetsConfigSaved, setGoogleSheetsConfigSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');

  const handleSave = () => {
    updateCompanyInfo(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sections = [
    { id: 'company', label: 'Société', icon: <Building2 className="w-4 h-4" /> },
    { id: 'bank', label: 'Paiement', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'pricing', label: 'Tarifs', icon: <Euro className="w-4 h-4" /> },
    { id: 'automation', label: 'Automatisation', icon: <Settings className="w-4 h-4" /> },
    { id: 'email-config', label: 'Configuration Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'google-sheets', label: 'Google Sheets', icon: <Database className="w-4 h-4" /> },
    { id: 'emails', label: 'Emails envoyés', icon: <Mail className="w-4 h-4" /> },
  ];

  const handleSaveEmailConfig = () => {
    localStorage.setItem('emailjs_service_id', emailConfig.serviceId);
    localStorage.setItem('emailjs_template_id', emailConfig.templateId);
    localStorage.setItem('emailjs_public_key', emailConfig.publicKey);
    setEmailConfigSaved(true);
    setTimeout(() => setEmailConfigSaved(false), 3000);
  };

  const handleSaveGoogleSheetsConfig = () => {
    localStorage.setItem('google_sheets_url', googleSheetsConfig.scriptUrl);
    localStorage.setItem('google_sheets_api_key', googleSheetsConfig.apiKey);
    setGoogleSheetsConfigSaved(true);
    setTimeout(() => setGoogleSheetsConfigSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Test de connexion en cours...');

    const result = await testConnection();

    if (result.success) {
      setSyncStatus('success');
      setSyncMessage('✅ Connexion réussie ! Votre Google Sheets est accessible.');
    } else {
      setSyncStatus('error');
      setSyncMessage(`❌ Erreur : ${result.message}`);
    }

    setTimeout(() => setSyncStatus('idle'), 5000);
  };

  const handleSyncToGoogleSheets = async () => {
    setSyncStatus('syncing');
    setSyncMessage('Sauvegarde en cours...');

    const data = {
      students,
      appointments,
      invoices,
      purchaseOrders,
      documents,
      companyInfo,
      emailLogs,
    };

    const result = await saveAllData(data);

    if (result.success) {
      setSyncStatus('success');
      setSyncMessage('✅ Données sauvegardées avec succès dans Google Sheets !');
    } else {
      setSyncStatus('error');
      setSyncMessage(`❌ Erreur : ${result.message}`);
    }

    setTimeout(() => setSyncStatus('idle'), 5000);
  };

  const handleLoadFromGoogleSheets = async () => {
    if (!confirm('⚠️ Attention : Cette action va remplacer toutes vos données locales par celles de Google Sheets. Continuer ?')) {
      return;
    }

    setSyncStatus('syncing');
    setSyncMessage('Chargement des données...');

    const result = await loadAllData();

    if (result.success) {
      setSyncStatus('success');
      setSyncMessage('✅ Données chargées avec succès depuis Google Sheets ! Rechargez la page pour voir les changements.');
      setTimeout(() => window.location.reload(), 2000);
    } else {
      setSyncStatus('error');
      setSyncMessage(`❌ Erreur : ${result.message}`);
    }

    setTimeout(() => setSyncStatus('idle'), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold theme-text-primary">Paramètres de facturation</h2>
          <p className="theme-text-muted text-sm mt-1">Informations légales pour vos factures (conformité droit français)</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-500 transition-colors"
        >
          <Save className="w-4 h-4" /> Enregistrer
        </button>
      </div>

      {saved && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Informations enregistrées avec succès</span>
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <strong>Obligations légales :</strong> Selon l'article R123-67 du Code de Commerce et l'article A123-3 du Code de Commerce,
          vos factures doivent obligatoirement mentionner votre SIRET, le numéro de TVA (si applicable), et la mention
          "Dispensé d'immatriculation..." pour les auto-entrepreneurs.
        </div>
      </div>

      {/* Sections Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeSection === s.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Company Section */}
      {activeSection === 'company' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Informations de la société
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la société / Enseigne *
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
                placeholder="Ex: MathPro - Cours de Mathématiques"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forme juridique
              </label>
              <select
                value={form.legalForm}
                onChange={e => setForm({ ...form, legalForm: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              >
                <option value="Auto-entrepreneur">Auto-entrepreneur</option>
                <option value="Entreprise individuelle">Entreprise individuelle (EI)</option>
                <option value="EURL">EURL</option>
                <option value="SARL">SARL</option>
                <option value="SASU">SASU</option>
                <option value="SAS">SAS</option>
                <option value="SA">SA</option>
                <option value="Association">Association loi 1901</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code APE / NAF
              </label>
              <input
                type="text"
                value={form.apeCode}
                onChange={e => setForm({ ...form, apeCode: e.target.value })}
                placeholder="Ex: 8559B"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">8559B = Enseignement culturel</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SIRET *
              </label>
              <input
                type="text"
                value={form.siret}
                onChange={e => setForm({ ...form, siret: e.target.value })}
                placeholder="123 456 789 00012"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SIREN
              </label>
              <input
                type="text"
                value={form.sirene}
                onChange={e => setForm({ ...form, sirene: e.target.value })}
                placeholder="123 456 789"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de TVA intracommunautaire
              </label>
              <input
                type="text"
                value={form.tvaNumber}
                onChange={e => setForm({ ...form, tvaNumber: e.target.value })}
                placeholder="FR12 345678901"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">Non applicable pour auto-entrepreneur sous seuil</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RCS
              </label>
              <input
                type="text"
                value={form.rcs}
                onChange={e => setForm({ ...form, rcs: e.target.value })}
                placeholder="RCS Paris B 123 456 789"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capital social
              </label>
              <input
                type="text"
                value={form.capital}
                onChange={e => setForm({ ...form, capital: e.target.value })}
                placeholder="Ex: 1000 €"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Adresse
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="12 rue des Sciences"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={e => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="75005"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Paris"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-indigo-600" />
              Contact
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="contact@mathpro.fr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                  placeholder="https://www.mathpro.fr"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mention légale (pied de facture)
            </label>
            <textarea
              value={form.legalMention}
              onChange={e => setForm({ ...form, legalMention: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cette mention apparaîtra automatiquement en bas de toutes vos factures
            </p>
          </div>
        </div>
      )}

      {/* Bank Section */}
      {activeSection === 'bank' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            Informations bancaires
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la banque</label>
              <input
                type="text"
                value={form.bankName}
                onChange={e => setForm({ ...form, bankName: e.target.value })}
                placeholder="BNP Paribas"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
              <input
                type="text"
                value={form.iban}
                onChange={e => setForm({ ...form, iban: e.target.value })}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">BIC</label>
              <input
                type="text"
                value={form.bic}
                onChange={e => setForm({ ...form, bic: e.target.value })}
                placeholder="BNPAFRPP"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600">
              <strong>💡 Conseil :</strong> Ces informations apparaîtront sur vos factures pour faciliter le paiement par virement de vos élèves.
            </p>
          </div>
        </div>
      )}

      {/* Pricing Section */}
      {activeSection === 'pricing' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Euro className="w-5 h-5 text-indigo-600" />
            Tarifs des cours
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Information :</strong> Ces tarifs seront affichés sur la page d'accueil et utilisés pour calculer le prix des réservations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix 1 heure (€)</label>
              <input
                type="number"
                value={pricingSettings.price1h}
                onChange={e => updatePricingSettings({ price1h: parseFloat(e.target.value) || 0 })}
                min="0"
                step="5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix 1h30 (€)</label>
              <input
                type="number"
                value={pricingSettings.price1h30}
                onChange={e => updatePricingSettings({ price1h30: parseFloat(e.target.value) || 0 })}
                min="0"
                step="5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix 2 heures (€)</label>
              <input
                type="number"
                value={pricingSettings.price2h}
                onChange={e => updatePricingSettings({ price2h: parseFloat(e.target.value) || 0 })}
                min="0"
                step="5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-green-800">
              <strong>✅ Sauvegarde automatique :</strong> Les modifications sont enregistrées instantanément et mises à jour sur la page d'accueil.
            </p>
          </div>
        </div>
      )}

      {/* Automation Section */}
      {activeSection === 'automation' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            Paramètres d'automatisation
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>💡 Information :</strong> Ces paramètres contrôlent la génération automatique des documents et l'envoi des emails.
            </p>
          </div>

          <div className="space-y-4">
            {/* Auto-generate Purchase Order */}
            <div className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Génération automatique des bons de commande</div>
                <p className="text-sm text-gray-600">
                  Un bon de commande est automatiquement généré lorsqu'un rendez-vous est confirmé.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={automationSettings.autoGeneratePurchaseOrder}
                  onChange={e => updateAutomationSettings({ autoGeneratePurchaseOrder: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Auto-generate Invoice */}
            <div className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Génération automatique des factures</div>
                <p className="text-sm text-gray-600">
                  Une facture est automatiquement générée lorsqu'un rendez-vous passe en statut "Terminé".
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={automationSettings.autoGenerateInvoice}
                  onChange={e => updateAutomationSettings({ autoGenerateInvoice: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Auto-send Emails */}
            <div className="flex items-start justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors">
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">Envoi automatique des emails</div>
                <p className="text-sm text-gray-600">
                  Les emails de notification (mots de passe, bons de commande, factures) sont envoyés automatiquement aux élèves.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  checked={automationSettings.autoSendEmails}
                  onChange={e => updateAutomationSettings({ autoSendEmails: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-green-800">
              <strong>✅ Sauvegarde automatique :</strong> Les modifications sont enregistrées instantanément.
            </p>
          </div>
        </div>
      )}

      {/* Email Configuration Section */}
      {activeSection === 'email-config' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            Configuration EmailJS
          </h3>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 mb-2">
              <strong>📧 Configuration de l'envoi d'emails :</strong>
            </p>
            <p className="text-sm text-blue-700">
              Pour envoyer de vrais emails aux élèves, vous devez configurer EmailJS.
              Consultez le guide <a href="EMAIL_SETUP.md" target="_blank" className="underline font-medium">EMAIL_SETUP.md</a> pour les instructions complètes.
            </p>
          </div>

          {emailConfigSaved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Configuration EmailJS enregistrée avec succès</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service ID EmailJS
              </label>
              <input
                type="text"
                value={emailConfig.serviceId}
                onChange={e => setEmailConfig({ ...emailConfig, serviceId: e.target.value })}
                placeholder="service_xxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trouvé dans EmailJS Dashboard → Email Services → Votre service
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template ID EmailJS
              </label>
              <input
                type="text"
                value={emailConfig.templateId}
                onChange={e => setEmailConfig({ ...emailConfig, templateId: e.target.value })}
                placeholder="template_xxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trouvé dans EmailJS Dashboard → Email Templates → Votre template
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Public Key EmailJS
              </label>
              <input
                type="text"
                value={emailConfig.publicKey}
                onChange={e => setEmailConfig({ ...emailConfig, publicKey: e.target.value })}
                placeholder="user_xxxxxxxxxxx"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Trouvé dans EmailJS Dashboard → Account → API Keys
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveEmailConfig}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              <Save className="w-5 h-5" /> Enregistrer la configuration
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Important :</strong> Après avoir enregistré la configuration, redémarrez le serveur de développement pour que les changements prennent effet.
            </p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>📖 Guide de configuration :</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Créez un compte sur <a href="https://www.emailjs.com/" target="_blank" className="text-indigo-600 underline">emailjs.com</a></li>
              <li>Ajoutez un service email (Gmail recommandé)</li>
              <li>Créez un template d'email</li>
              <li>Copiez les 3 identifiants ci-dessus</li>
              <li>Enregistrez la configuration</li>
              <li>Redémarrez le serveur</li>
            </ol>
          </div>
        </div>
      )}

      {/* Google Sheets Configuration */}
      {activeSection === 'google-sheets' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-600" />
            Configuration Google Sheets
          </h3>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800 mb-2">
              <strong>📊 Où sont vos données ?</strong>
            </p>
            <p className="text-sm text-amber-700">
              Actuellement, vos données sont stockées dans le <strong>localStorage</strong> de votre navigateur.
              Configurez Google Sheets pour sauvegarder vos données dans le cloud et y accéder depuis n'importe quel appareil.
            </p>
          </div>

          {googleSheetsConfigSaved && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium">Configuration Google Sheets enregistrée avec succès</span>
            </div>
          )}

          {syncStatus !== 'idle' && (
            <div className={`border rounded-xl p-4 flex items-center gap-3 ${
              syncStatus === 'syncing' ? 'bg-blue-50 border-blue-200' :
              syncStatus === 'success' ? 'bg-green-50 border-green-200' :
              'bg-red-50 border-red-200'
            }`}>
              {syncStatus === 'syncing' && <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
              {syncStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {syncStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              <span className={`text-sm font-medium ${
                syncStatus === 'syncing' ? 'text-blue-800' :
                syncStatus === 'success' ? 'text-green-800' :
                'text-red-800'
              }`}>{syncMessage}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL du script Google Apps Script
              </label>
              <input
                type="url"
                value={googleSheetsConfig.scriptUrl}
                onChange={e => setGoogleSheetsConfig({ ...googleSheetsConfig, scriptUrl: e.target.value })}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Obtenez cette URL dans Google Sheets → Extensions → Apps Script → Déployer
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API
              </label>
              <input
                type="password"
                value={googleSheetsConfig.apiKey}
                onChange={e => setGoogleSheetsConfig({ ...googleSheetsConfig, apiKey: e.target.value })}
                placeholder="Votre clé API secrète"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Définie dans votre script Google Apps Script (variable API_KEY)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSaveGoogleSheetsConfig}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
            >
              <Save className="w-5 h-5" /> Enregistrer la configuration
            </button>
            <button
              onClick={handleTestConnection}
              disabled={!googleSheetsConfig.scriptUrl || !googleSheetsConfig.apiKey}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Database className="w-5 h-5" /> Tester la connexion
            </button>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <h4 className="font-semibold text-gray-900">Synchronisation des données</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleSyncToGoogleSheets}
                disabled={!googleSheetsConfig.scriptUrl || !googleSheetsConfig.apiKey}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database className="w-5 h-5" /> Sauvegarder vers Google Sheets
              </button>
              <button
                onClick={handleLoadFromGoogleSheets}
                disabled={!googleSheetsConfig.scriptUrl || !googleSheetsConfig.apiKey}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Database className="w-5 h-5" /> Charger depuis Google Sheets
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>💡 Conseil :</strong> Sauvegardez régulièrement vos données vers Google Sheets pour éviter toute perte.
                Vous pouvez également charger les données depuis Google Sheets si vous changez de navigateur ou d'appareil.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-6">
            <p className="text-sm text-gray-700 mb-2">
              <strong>📖 Guide de configuration :</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>Créez un Google Sheets nommé "MathPro - Base de données"</li>
              <li>Ouvrez Extensions → Apps Script</li>
              <li>Copiez le code depuis le fichier <code className="bg-gray-200 px-1 rounded">google-apps-script.js</code></li>
              <li>Modifiez la variable <code className="bg-gray-200 px-1 rounded">API_KEY</code> avec une clé secrète</li>
              <li>Exécutez la fonction <code className="bg-gray-200 px-1 rounded">testSetup</code></li>
              <li>Déployez le script (Déployer → Nouveau déploiement → Application Web)</li>
              <li>Copiez l'URL du déploiement</li>
              <li>Collez l'URL et la clé API ci-dessus</li>
              <li>Cliquez sur "Tester la connexion"</li>
              <li>Cliquez sur "Sauvegarder vers Google Sheets"</li>
            </ol>
            <p className="text-xs text-gray-500 mt-3">
              Consultez le fichier <strong>GOOGLE_SHEETS_SETUP.md</strong> pour plus de détails.
            </p>
          </div>
        </div>
      )}

      {/* Email Logs */}
      {activeSection === 'emails' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Mail className="w-5 h-5 text-indigo-600" />
            Historique des emails envoyés
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Simulation des emails envoyés automatiquement (en production, un service SMTP serait utilisé)
          </p>

          {emailLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Aucun email envoyé pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...emailLogs].reverse().map(log => (
                <div key={log.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        log.type === 'password' ? 'bg-purple-100 text-purple-700' :
                        log.type === 'purchase-order' ? 'bg-blue-100 text-blue-700' :
                        log.type === 'invoice' ? 'bg-green-100 text-green-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {log.type === 'password' ? 'Mot de passe' :
                         log.type === 'purchase-order' ? 'Bon de commande' :
                         log.type === 'invoice' ? 'Facture' : 'Confirmation'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{log.subject}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>À :</strong> {log.to}
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-indigo-600 cursor-pointer hover:text-indigo-700">
                      Voir le contenu
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap">
                      {log.body}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
