import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, Save, CheckCircle, FileText, CreditCard, MapPin, Phone, Mail, Globe, AlertCircle, Settings, Euro } from 'lucide-react';

export default function SettingsPage() {
  const { companyInfo, updateCompanyInfo, automationSettings, updateAutomationSettings, pricingSettings, updatePricingSettings, emailLogs } = useApp();
  const [form, setForm] = useState(companyInfo);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<'company' | 'bank' | 'automation' | 'pricing' | 'emails'>('company');

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
    { id: 'emails', label: 'Emails envoyés', icon: <Mail className="w-4 h-4" /> },
  ];

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
