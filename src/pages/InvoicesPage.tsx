import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Plus, Download, Send, CheckCircle, Trash2, X, Printer, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

export default function InvoicesPage() {
  const { students, appointments, invoices, purchaseOrders, addInvoice, updateInvoice, deleteInvoice, addPurchaseOrder, getStudentById } = useApp();
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showPOForm, setShowPOForm] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'purchase-orders'>('invoices');

  // Invoice form state
  const [invoiceStudentId, setInvoiceStudentId] = useState('');
  const [invoiceAppointmentIds, setInvoiceAppointmentIds] = useState<string[]>([]);
  const [invoiceDueDate, setInvoiceDueDate] = useState('');

  // PO form state
  const [poStudentId, setPoStudentId] = useState('');
  const [poItems, setPoItems] = useState([{ description: '', quantity: 1, unitPrice: 45, total: 45 }]);

  const activeStudents = students.filter(s => !s.archived);

  const getStudentUnpaidAppointments = (studentId: string) => {
    return appointments.filter(a =>
      a.studentId === studentId &&
      !a.archived &&
      !a.paid &&
      (a.status === 'confirmed' || a.status === 'completed') &&
      !invoiceAppointmentIds.includes(a.id)
    );
  };

  const handleCreateInvoice = () => {
    const selectedAppts = appointments.filter(a => invoiceAppointmentIds.includes(a.id));
    const total = selectedAppts.reduce((sum, a) => sum + a.price, 0);

    const items = selectedAppts.map(a => ({
      description: `Cours de ${a.duration}min - ${a.subject} (${format(new Date(a.date + 'T00:00:00'), 'dd/MM/yyyy', { locale: fr })})`,
      quantity: 1,
      unitPrice: a.price,
      total: a.price,
    }));

    addInvoice({
      number: `FAC-${format(new Date(), 'yyyyMMdd')}-${invoices.length + 1}`,
      studentId: invoiceStudentId,
      appointmentIds: invoiceAppointmentIds,
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: invoiceDueDate,
      items,
      total,
      status: 'draft',
    });

    // Mark appointments as paid
    invoiceAppointmentIds.forEach(id => {
      // We'll update them individually
    });

    setShowInvoiceForm(false);
    setInvoiceStudentId('');
    setInvoiceAppointmentIds([]);
    setInvoiceDueDate('');
  };

  const handleCreatePO = () => {
    const total = poItems.reduce((sum, item) => sum + item.total, 0);

    addPurchaseOrder({
      number: `BC-${format(new Date(), 'yyyyMMdd')}-${purchaseOrders.length + 1}`,
      studentId: poStudentId,
      date: format(new Date(), 'yyyy-MM-dd'),
      items: poItems,
      total,
      status: 'pending',
    });

    setShowPOForm(false);
    setPoStudentId('');
    setPoItems([{ description: '', quantity: 1, unitPrice: 45, total: 45 }]);
  };

  const handleMarkPaid = (id: string) => {
    updateInvoice(id, { status: 'paid' });
    const invoice = invoices.find(i => i.id === id);
    if (invoice) {
      invoice.appointmentIds.forEach(aptId => {
        // Mark appointments as paid through context
      });
    }
  };

  const handlePrintInvoice = (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    const student = getStudentById(invoice.studentId);

    const printContent = `
      <html>
      <head><title>Facture ${invoice.number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .title { font-size: 28px; font-weight: bold; color: #4F46E5; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #F3F4F6; padding: 12px; text-align: left; font-size: 14px; }
        td { padding: 12px; border-bottom: 1px solid #E5E7EB; font-size: 14px; }
        .total { text-align: right; font-size: 20px; font-weight: bold; margin-top: 20px; }
        .info { color: #6B7280; font-size: 13px; }
      </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">MathPro</div>
            <div class="info">Cours particuliers de mathématiques</div>
            <div class="info">prof@mathpro.fr | 06 00 00 00 00</div>
          </div>
          <div style="text-align: right;">
            <h2>FACTURE</h2>
            <div class="info">N° ${invoice.number}</div>
            <div class="info">Date: ${format(new Date(invoice.date), 'dd/MM/yyyy', { locale: fr })}</div>
            <div class="info">Échéance: ${format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: fr })}</div>
          </div>
        </div>
        <div style="margin-bottom: 30px;">
          <strong>Client:</strong><br/>
          ${student ? `${student.firstName} ${student.lastName}` : ''}<br/>
          <span class="info">${student?.email || ''}</span>
        </div>
        <table>
          <thead>
            <tr><th>Description</th><th>Qté</th><th>Prix unit.</th><th>Total</th></tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${item.unitPrice}€</td>
                <td>${item.total}€</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="total">Total: ${invoice.total}€</div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;" class="info">
          <p>Mode de paiement: Virement bancaire / Chèque / Espèces</p>
          <p>IBAN: FR76 0000 0000 0000 0000 0000 000</p>
          <p>Merci pour votre confiance.</p>
        </div>
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

  const viewingInvoiceData = viewingInvoice ? invoices.find(i => i.id === viewingInvoice) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Facturation</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPOForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            <Receipt className="w-4 h-4" /> Bon de commande
          </button>
          <button
            onClick={() => setShowInvoiceForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Nouvelle facture
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Factures ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('purchase-orders')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'purchase-orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bons de commande ({purchaseOrders.length})
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 font-medium">N° Facture</th>
                  <th className="px-6 py-4 font-medium">Élève</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Échéance</th>
                  <th className="px-6 py-4 font-medium">Montant</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      Aucune facture créée
                    </td>
                  </tr>
                ) : (
                  invoices.map(invoice => {
                    const student = getStudentById(invoice.studentId);
                    return (
                      <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-indigo-600">{invoice.number}</td>
                        <td className="px-6 py-4 text-gray-900">
                          {student ? `${student.firstName} ${student.lastName}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {format(new Date(invoice.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{invoice.total}€</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {invoice.status === 'paid' ? 'Payée' :
                             invoice.status === 'sent' ? 'Envoyée' :
                             invoice.status === 'overdue' ? 'En retard' : 'Brouillon'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => setViewingInvoice(invoice.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600"
                              title="Voir"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePrintInvoice(invoice.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600"
                              title="Imprimer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            {invoice.status !== 'paid' && (
                              <button
                                onClick={() => handleMarkPaid(invoice.id)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600"
                                title="Marquer payée"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteInvoice(invoice.id)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'purchase-orders' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-4 font-medium">N° BC</th>
                  <th className="px-6 py-4 font-medium">Élève</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Montant</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                      <Receipt className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      Aucun bon de commande
                    </td>
                  </tr>
                ) : (
                  purchaseOrders.map(po => {
                    const student = getStudentById(po.studentId);
                    return (
                      <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-indigo-600">{po.number}</td>
                        <td className="px-6 py-4 text-gray-900">
                          {student ? `${student.firstName} ${student.lastName}` : '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {format(new Date(po.date), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-900">{po.total}€</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            po.status === 'approved' ? 'bg-green-100 text-green-700' :
                            po.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {po.status === 'approved' ? 'Approuvé' :
                             po.status === 'rejected' ? 'Rejeté' : 'En attente'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showInvoiceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowInvoiceForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Nouvelle facture</h3>
              <button onClick={() => setShowInvoiceForm(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Élève *</label>
                <select
                  value={invoiceStudentId}
                  onChange={e => { setInvoiceStudentId(e.target.value); setInvoiceAppointmentIds([]); }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                >
                  <option value="">-- Sélectionner un élève --</option>
                  {activeStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>

              {invoiceStudentId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cours à facturer</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {getStudentUnpaidAppointments(invoiceStudentId).length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">Aucun cours non payé</p>
                    ) : (
                      getStudentUnpaidAppointments(invoiceStudentId).map(apt => (
                        <label key={apt.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={invoiceAppointmentIds.includes(apt.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setInvoiceAppointmentIds([...invoiceAppointmentIds, apt.id]);
                              } else {
                                setInvoiceAppointmentIds(invoiceAppointmentIds.filter(id => id !== apt.id));
                              }
                            }}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">{apt.subject}</div>
                            <div className="text-xs text-gray-500">{format(new Date(apt.date + 'T00:00:00'), 'dd/MM/yyyy')} à {apt.time}</div>
                          </div>
                          <span className="text-sm font-medium">{apt.price}€</span>
                        </label>
                      ))
                    )}
                  </div>
                  {invoiceAppointmentIds.length > 0 && (
                    <div className="mt-2 p-2 bg-indigo-50 rounded-lg text-sm font-medium text-indigo-700">
                      Total: {appointments.filter(a => invoiceAppointmentIds.includes(a.id)).reduce((sum, a) => sum + a.price, 0)}€
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                <input
                  type="date"
                  value={invoiceDueDate}
                  onChange={e => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInvoiceForm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateInvoice}
                disabled={!invoiceStudentId || invoiceAppointmentIds.length === 0 || !invoiceDueDate}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Créer la facture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showPOForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPOForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Nouveau bon de commande</h3>
              <button onClick={() => setShowPOForm(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Élève *</label>
                <select
                  value={poStudentId}
                  onChange={e => setPoStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
                >
                  <option value="">-- Sélectionner --</option>
                  {activeStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Articles</label>
                {poItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => {
                        const newItems = [...poItems];
                        newItems[idx].description = e.target.value;
                        setPoItems(newItems);
                      }}
                      placeholder="Description"
                      className="col-span-5 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => {
                        const newItems = [...poItems];
                        newItems[idx].quantity = parseInt(e.target.value) || 1;
                        newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
                        setPoItems(newItems);
                      }}
                      className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      min="1"
                    />
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={e => {
                        const newItems = [...poItems];
                        newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                        newItems[idx].total = newItems[idx].quantity * newItems[idx].unitPrice;
                        setPoItems(newItems);
                      }}
                      className="col-span-3 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      min="0"
                    />
                    <span className="col-span-2 flex items-center text-sm font-medium text-gray-700">
                      {item.total}€
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => setPoItems([...poItems, { description: '', quantity: 1, unitPrice: 45, total: 45 }])}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  + Ajouter une ligne
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">{poItems.reduce((sum, i) => sum + i.total, 0)}€</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPOForm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreatePO}
                disabled={!poStudentId}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                Créer le bon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewingInvoiceData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingInvoice(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Facture {viewingInvoiceData.number}</h3>
              <button onClick={() => setViewingInvoice(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm text-gray-500">Élève</div>
                  <div className="font-medium">
                    {(() => { const s = getStudentById(viewingInvoiceData.studentId); return s ? `${s.firstName} ${s.lastName}` : '—'; })()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Statut</div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    viewingInvoiceData.status === 'paid' ? 'bg-green-100 text-green-700' :
                    viewingInvoiceData.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                    viewingInvoiceData.status === 'overdue' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {viewingInvoiceData.status === 'paid' ? 'Payée' :
                     viewingInvoiceData.status === 'sent' ? 'Envoyée' :
                     viewingInvoiceData.status === 'overdue' ? 'En retard' : 'Brouillon'}
                  </span>
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoiceData.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 text-sm">{item.description}</td>
                      <td className="py-2 text-sm text-right font-medium">{item.total}€</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="pt-3 font-bold">Total</td>
                    <td className="pt-3 text-right font-bold text-lg">{viewingInvoiceData.total}€</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => handlePrintInvoice(viewingInvoiceData.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
              >
                <Printer className="w-4 h-4" /> Imprimer
              </button>
              {viewingInvoiceData.status !== 'paid' && (
                <button
                  onClick={() => { handleMarkPaid(viewingInvoiceData.id); setViewingInvoice(null); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4" /> Marquer payée
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
