import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Student, Appointment, Invoice, PurchaseOrder, Document, CompanyInfo, EmailLog, Theme, AutomationSettings, PricingSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { initEmailJS } from '../services/emailService';
import { saveAllData, sendPurchaseOrderEmail, sendInvoiceEmail } from '../services/googleSheetsAPI';

interface AppState {
  students: Student[];
  appointments: Appointment[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  documents: Document[];
  companyInfo: CompanyInfo;
  emailLogs: EmailLog[];
  automationSettings: AutomationSettings;
  pricingSettings: PricingSettings;
  isAdmin: boolean;
  currentStudentId: string | null;
  theme: Theme;
}

interface AppContextType extends AppState {
  // Student
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'archived'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  archiveStudent: (id: string) => void;
  getStudentById: (id: string) => Student | undefined;
  findStudentByEmailOrPhone: (emailOrPhone: string) => Student | undefined;
  // Auth
  setIsAdmin: (val: boolean) => void;
  loginStudent: (studentId: string) => void;
  logoutStudent: () => void;
  generatePassword: () => string;
  // Appointment
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'archived'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  archiveAppointment: (id: string) => void;
  confirmAppointment: (id: string) => void;
  cancelAppointment: (id: string) => void;
  completeAppointment: (id: string) => void;
  // Invoice
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  // Purchase Order
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) => void;
  // Document
  addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => void;
  deleteDocument: (id: string) => void;
  // Company
  updateCompanyInfo: (data: Partial<CompanyInfo>) => void;
  // Automation
  updateAutomationSettings: (data: Partial<AutomationSettings>) => void;
  // Pricing
  updatePricingSettings: (data: Partial<PricingSettings>) => void;
  // Theme
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  // Email
  sendEmail: (to: string, subject: string, body: string, type: EmailLog['type'], relatedId?: string) => void;
  // Auto-generation
  generatePurchaseOrderForAppointment: (appointmentId: string) => string | null;
  generateInvoiceForAppointment: (appointmentId: string) => string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'mathprof_data_v2';
const THEME_KEY = 'mathprof_theme';
const SESSION_KEY = 'mathprof_session';

const defaultCompanyInfo: CompanyInfo = {
  companyName: '',
  legalForm: 'Auto-entrepreneur',
  siret: '',
  sirene: '',
  rcs: '',
  tvaNumber: '',
  apeCode: '8559B',
  address: '',
  postalCode: '',
  city: '',
  email: '',
  phone: '',
  website: '',
  iban: '',
  bic: '',
  bankName: '',
  legalMention: 'Dispensé d\'immatriculation au registre du commerce et des sociétés (RCS) ainsi qu\'au registre des métiers (RM) - Article R123-67 du Code de Commerce.',
  capital: '',
};

function loadFromStorage(): AppState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const session = localStorage.getItem(SESSION_KEY);

    let isAdmin = false;
    let currentStudentId = null;

    // Charger la session depuis le localStorage
    if (session) {
      const sessionData = JSON.parse(session);
      isAdmin = sessionData.isAdmin || false;
      currentStudentId = sessionData.currentStudentId || null;
    }

    if (data) {
      const parsed = JSON.parse(data);
      return {
        students: parsed.students || [],
        appointments: parsed.appointments || [],
        invoices: parsed.invoices || [],
        purchaseOrders: parsed.purchaseOrders || [],
        documents: parsed.documents || [],
        companyInfo: parsed.companyInfo || defaultCompanyInfo,
        emailLogs: parsed.emailLogs || [],
        automationSettings: parsed.automationSettings || {
          autoGeneratePurchaseOrder: true,
          autoGenerateInvoice: true,
          autoSendEmails: true,
        },
        pricingSettings: parsed.pricingSettings || {
          price1h: 45,
          price1h30: 65,
          price2h: 85,
        },
        isAdmin,
        currentStudentId,
        theme: (localStorage.getItem(THEME_KEY) as Theme) || 'dark',
      };
    }
  } catch (e) {
    console.error('Error loading from storage', e);
  }
  return {
    students: [],
    appointments: [],
    invoices: [],
    purchaseOrders: [],
    documents: [],
    companyInfo: defaultCompanyInfo,
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
    theme: (localStorage.getItem(THEME_KEY) as Theme) || 'dark',
  };
}

function saveToStorage(state: AppState) {
  try {
    const { theme, ...rest } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error saving to storage', e);
  }
}

function saveSession(isAdmin: boolean, currentStudentId: string | null) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ isAdmin, currentStudentId }));
  } catch (e) {
    console.error('Error saving session', e);
  }
}

function generateRandomPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function getSampleData(): AppState {
  const student1Id = uuidv4();
  const student2Id = uuidv4();
  const student3Id = uuidv4();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

    return {
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
      students: [
        {
          id: student1Id,
          firstName: 'Marie',
          lastName: 'Dupont',
          email: 'marie.dupont@email.com',
          phone: '06 12 34 56 78',
          level: 'Terminale S',
          notes: 'Préparation bac, difficultés en analyse',
          password: 'Marie2026',
          createdAt: new Date().toISOString(),
          archived: false,
        },      {
        id: student2Id,
        firstName: 'Lucas',
        lastName: 'Martin',
        email: 'lucas.martin@email.com',
        phone: '06 98 76 54 32',
        level: 'Première S',
        notes: 'Renforcement en géométrie',
        password: 'Lucas2026',
        createdAt: new Date().toISOString(),
        archived: false,
      },
      {
        id: student3Id,
        firstName: 'Sophie',
        lastName: 'Bernard',
        email: 'sophie.bernard@email.com',
        phone: '06 11 22 33 44',
        level: 'Seconde',
        notes: 'Remise à niveau',
        password: 'Sophie2026',
        createdAt: new Date().toISOString(),
        archived: false,
      },
    ],
    appointments: [
      {
        id: uuidv4(),
        studentId: student1Id,
        date: tomorrow.toISOString().split('T')[0],
        time: '14:00',
        duration: 60,
        subject: 'Analyse - Suites et limites',
        status: 'confirmed',
        notes: 'Préparer exercice sur les suites convergentes',
        price: 45,
        paid: false,
        createdAt: new Date().toISOString(),
        archived: false,
      },
      {
        id: uuidv4(),
        studentId: student2Id,
        date: tomorrow.toISOString().split('T')[0],
        time: '16:00',
        duration: 90,
        subject: 'Géométrie - Vecteurs et droites',
        status: 'pending',
        notes: '',
        price: 65,
        paid: false,
        createdAt: new Date().toISOString(),
        archived: false,
      },
      {
        id: uuidv4(),
        studentId: student3Id,
        date: nextWeek.toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        subject: 'Fonctions - Dérivation',
        status: 'pending',
        notes: 'Reprendre les bases de la dérivation',
        price: 45,
        paid: false,
        createdAt: new Date().toISOString(),
        archived: false,
      },
    ],
    invoices: [],
    purchaseOrders: [],
    documents: [],
    companyInfo: {
      ...defaultCompanyInfo,
      companyName: 'MathPro - Cours de Mathématiques',
      legalForm: 'Auto-entrepreneur',
      siret: '123 456 789 00012',
      apeCode: '8559B',
      address: '12 rue des Sciences',
      postalCode: '75005',
      city: 'Paris',
      email: 'contact@mathpro.fr',
      phone: '06 12 34 56 78',
      iban: 'FR76 1234 5678 9012 3456 7890 123',
      bic: 'BNPAFRPP',
      bankName: 'BNP Paribas',
    },
    emailLogs: [],
    isAdmin: false,
    currentStudentId: null,
    theme: (localStorage.getItem(THEME_KEY) as Theme) || 'dark',
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const stored = loadFromStorage();
    if (stored.students.length === 0 && stored.appointments.length === 0) {
      return getSampleData();
    }
    return stored;
  });

  useEffect(() => {
    saveToStorage(state);
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', state.theme);

    // Sauvegarde automatique vers Google Sheets (debounced)
    const googleSheetsUrl = (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL;
    const googleSheetsApiKey = (import.meta as any).env?.VITE_API_KEY;

    if (googleSheetsUrl && googleSheetsApiKey) {
      // Debounce: attendre 2 secondes après la dernière modification
      const timeoutId = setTimeout(() => {
        const dataToSync = {
          students: state.students,
          appointments: state.appointments,
          invoices: state.invoices,
          purchaseOrders: state.purchaseOrders,
          documents: state.documents,
          companyInfo: state.companyInfo,
          emailLogs: state.emailLogs,
        };

        saveAllData(dataToSync).then(result => {
          if (result.success) {
            console.log('✅ Données sauvegardées automatiquement dans Google Sheets');
          } else {
            console.warn('⚠️ Erreur sauvegarde Google Sheets:', result.message);
          }
        });
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [state]);

  const addStudent = (student: Omit<Student, 'id' | 'createdAt' | 'archived'>) => {
    setState(prev => ({
      ...prev,
      students: [...prev.students, { ...student, id: uuidv4(), createdAt: new Date().toISOString(), archived: false }],
    }));
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, ...data } : s),
    }));
  };

  const deleteStudent = (id: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== id),
    }));
  };

  const archiveStudent = (id: string) => {
    setState(prev => ({
      ...prev,
      students: prev.students.map(s => s.id === id ? { ...s, archived: true } : s),
    }));
  };

  const getStudentById = (id: string) => state.students.find(s => s.id === id);

  const findStudentByEmailOrPhone = (emailOrPhone: string) => {
    const normalized = emailOrPhone.replace(/\s/g, '').toLowerCase();
    return state.students.find(s =>
      !s.archived && (
        s.email.toLowerCase() === normalized ||
        s.phone.replace(/\s/g, '') === normalized
      )
    );
  };

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'createdAt' | 'archived'>) => {
    setState(prev => ({
      ...prev,
      appointments: [...prev.appointments, { ...appointment, id: uuidv4(), createdAt: new Date().toISOString(), archived: false }],
    }));
  };

  const updateAppointment = (id: string, data: Partial<Appointment>) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === id ? { ...a, ...data } : a),
    }));
  };

  const deleteAppointment = (id: string) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.filter(a => a.id !== id),
    }));
  };

  const archiveAppointment = (id: string) => {
    setState(prev => ({
      ...prev,
      appointments: prev.appointments.map(a => a.id === id ? { ...a, archived: true } : a),
    }));
  };

  const sendEmail = async (to: string, subject: string, body: string, type: EmailLog['type'], relatedId?: string) => {
    // Logger l'email dans l'historique
    setState(prev => ({
      ...prev,
      emailLogs: [...prev.emailLogs, {
        id: uuidv4(),
        to,
        subject,
        body,
        type,
        relatedId,
        createdAt: new Date().toISOString(),
      }],
    }));

    // Envoyer l'email via EmailJS si configuré
    // Note: Les fonctions spécifiques (sendWelcomeEmail, etc.) seront appelées directement
    // depuis les endroits où elles sont nécessaires pour avoir plus de contrôle
  };

  const generatePurchaseOrderForAppointment = (appointmentId: string): string | null => {
    const apt = state.appointments.find(a => a.id === appointmentId);
    if (!apt) return null;

    const student = state.students.find(s => s.id === apt.studentId);
    if (!student) return null;

    const poNumber = `BC-${format(new Date(), 'yyyyMMdd')}-${state.purchaseOrders.length + 1}`;
    const poId = uuidv4();

    const po: PurchaseOrder = {
      id: poId,
      number: poNumber,
      studentId: apt.studentId,
      date: format(new Date(), 'yyyy-MM-dd'),
      items: [{
        description: `Cours de mathématiques - ${apt.duration}min - ${apt.subject} (${format(new Date(apt.date + 'T00:00:00'), 'dd/MM/yyyy', { locale: fr })} à ${apt.time})`,
        quantity: 1,
        unitPrice: apt.price,
        total: apt.price,
      }],
      total: apt.price,
      status: 'approved',
      createdAt: new Date().toISOString(),
      appointmentId: apt.id,
      autoGenerated: true,
    };

    setState(prev => ({
      ...prev,
      purchaseOrders: [...prev.purchaseOrders, po],
      appointments: prev.appointments.map(a => a.id === apt.id ? { ...a, purchaseOrderId: poId } : a),
    }));

    // Send email to student if enabled
    if (state.automationSettings.autoSendEmails) {
      sendPurchaseOrderEmail(
        student.email,
        student.firstName,
        poNumber,
        apt.subject,
        format(new Date(apt.date + 'T00:00:00'), 'dd MMMM yyyy', { locale: fr }),
        apt.time,
        apt.price
      );

      // Log the email
      sendEmail(
        student.email,
        `Votre bon de commande ${poNumber} - MS Académie`,
        `Bonjour ${student.firstName},\n\nVotre cours de ${apt.subject} prévu le ${format(new Date(apt.date + 'T00:00:00'), 'dd MMMM yyyy', { locale: fr })} à ${apt.time} a été confirmé.\n\nBon de commande N° ${poNumber}\nMontant: ${apt.price}€\n\nCordialement,\nMS Académie`,
        'purchase-order',
        poId
      );
    }

    return poId;
  };

  const generateInvoiceForAppointment = (appointmentId: string): string | null => {
    const apt = state.appointments.find(a => a.id === appointmentId);
    if (!apt) return null;

    const student = state.students.find(s => s.id === apt.studentId);
    if (!student) return null;

    // Check if invoice already exists for this appointment
    const existingInvoice = state.invoices.find(i => i.appointmentIds.includes(apt.id));
    if (existingInvoice) return existingInvoice.id;

    const invoiceNumber = `FAC-${format(new Date(), 'yyyyMMdd')}-${state.invoices.length + 1}`;
    const invoiceId = uuidv4();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const invoice: Invoice = {
      id: invoiceId,
      number: invoiceNumber,
      studentId: apt.studentId,
      appointmentIds: [apt.id],
      date: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(dueDate, 'yyyy-MM-dd'),
      items: [{
        description: `Cours de mathématiques - ${apt.duration}min - ${apt.subject} (${format(new Date(apt.date + 'T00:00:00'), 'dd/MM/yyyy', { locale: fr })} à ${apt.time})`,
        quantity: 1,
        unitPrice: apt.price,
        total: apt.price,
      }],
      total: apt.price,
      status: 'sent',
      createdAt: new Date().toISOString(),
      autoGenerated: true,
    };

    setState(prev => ({
      ...prev,
      invoices: [...prev.invoices, invoice],
      appointments: prev.appointments.map(a => a.id === apt.id ? { ...a, invoiceId, paid: true } : a),
    }));

    // Send email to student if enabled
    if (state.automationSettings.autoSendEmails) {
      sendInvoiceEmail(
        student.email,
        student.firstName,
        invoiceNumber,
        apt.subject,
        format(new Date(apt.date + 'T00:00:00'), 'dd MMMM yyyy', { locale: fr }),
        format(dueDate, 'dd/MM/yyyy', { locale: fr }),
        apt.price
      );

      // Log the email
      sendEmail(
        student.email,
        `Votre facture ${invoiceNumber} - MS Académie`,
        `Bonjour ${student.firstName},\n\nVotre cours de ${apt.subject} du ${format(new Date(apt.date + 'T00:00:00'), 'dd MMMM yyyy', { locale: fr })} est maintenant terminé.\n\nFacture N° ${invoiceNumber}\nMontant: ${apt.price}€\nÉchéance: ${format(dueDate, 'dd/MM/yyyy', { locale: fr })}\n\nMerci de régler par virement sur le IBAN indiqué.\n\nCordialement,\nMS Académie`,
        'invoice',
        invoiceId
      );
    }

    return invoiceId;
  };

  const confirmAppointment = (id: string) => {
    updateAppointment(id, { status: 'confirmed' });
    // Auto-generate purchase order if enabled
    if (state.automationSettings.autoGeneratePurchaseOrder) {
      setTimeout(() => generatePurchaseOrderForAppointment(id), 0);
    }
  };

  const cancelAppointment = (id: string) => {
    updateAppointment(id, { status: 'cancelled' });
  };

  const completeAppointment = (id: string) => {
    updateAppointment(id, { status: 'completed' });
    // Auto-generate invoice if enabled
    if (state.automationSettings.autoGenerateInvoice) {
      setTimeout(() => generateInvoiceForAppointment(id), 0);
    }
  };

  const addInvoice = (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      invoices: [...prev.invoices, { ...invoice, id: uuidv4(), createdAt: new Date().toISOString() }],
    }));
  };

  const updateInvoice = (id: string, data: Partial<Invoice>) => {
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(i => i.id === id ? { ...i, ...data } : i),
    }));
  };

  const deleteInvoice = (id: string) => {
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.filter(i => i.id !== id),
    }));
  };

  const addPurchaseOrder = (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      purchaseOrders: [...prev.purchaseOrders, { ...po, id: uuidv4(), createdAt: new Date().toISOString() }],
    }));
  };

  const updatePurchaseOrder = (id: string, data: Partial<PurchaseOrder>) => {
    setState(prev => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map(p => p.id === id ? { ...p, ...data } : p),
    }));
  };

  const addDocument = (doc: Omit<Document, 'id' | 'createdAt'>) => {
    setState(prev => ({
      ...prev,
      documents: [...prev.documents, { ...doc, id: uuidv4(), createdAt: new Date().toISOString() }],
    }));
  };

  const deleteDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id),
    }));
  };

  const updateCompanyInfo = (data: Partial<CompanyInfo>) => {
    setState(prev => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, ...data },
    }));
  };

  const updateAutomationSettings = (data: Partial<AutomationSettings>) => {
    setState(prev => ({
      ...prev,
      automationSettings: { ...prev.automationSettings, ...data },
    }));
  };

  const updatePricingSettings = (data: Partial<PricingSettings>) => {
    setState(prev => ({
      ...prev,
      pricingSettings: { ...prev.pricingSettings, ...data },
    }));
  };

  const setIsAdmin = (val: boolean) => {
    setState(prev => {
      const newState = { ...prev, isAdmin: val };
      saveSession(val, prev.currentStudentId);
      return newState;
    });
  };

  const loginStudent = (studentId: string) => {
    setState(prev => {
      const newState = { ...prev, currentStudentId: studentId };
      saveSession(prev.isAdmin, studentId);
      return newState;
    });
  };

  const logoutStudent = () => {
    setState(prev => {
      const newState = { ...prev, currentStudentId: null, isAdmin: false };
      saveSession(false, null);
      return newState;
    });
  };

  const generatePassword = () => generateRandomPassword();

  const setTheme = (theme: Theme) => {
    setState(prev => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addStudent,
      updateStudent,
      deleteStudent,
      archiveStudent,
      getStudentById,
      findStudentByEmailOrPhone,
      setIsAdmin,
      loginStudent,
      logoutStudent,
      generatePassword,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      archiveAppointment,
      confirmAppointment,
      cancelAppointment,
      completeAppointment,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addPurchaseOrder,
      updatePurchaseOrder,
      addDocument,
      deleteDocument,
      updateCompanyInfo,
      updateAutomationSettings,
      updatePricingSettings,
      setTheme,
      toggleTheme,
      sendEmail,
      generatePurchaseOrderForAppointment,
      generateInvoiceForAppointment,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
