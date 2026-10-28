import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, Appointment, Invoice, PurchaseOrder } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  students: Student[];
  appointments: Appointment[];
  invoices: Invoice[];
  purchaseOrders: PurchaseOrder[];
  isAdmin: boolean;
}

interface AppContextType extends AppState {
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'archived'>) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  archiveStudent: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt' | 'archived'>) => void;
  updateAppointment: (id: string, data: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  archiveAppointment: (id: string) => void;
  confirmAppointment: (id: string) => void;
  cancelAppointment: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, data: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'createdAt'>) => void;
  setIsAdmin: (val: boolean) => void;
  getStudentById: (id: string) => Student | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'mathprof_data';

function loadFromStorage(): AppState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading from storage', e);
  }
  return {
    students: [],
    appointments: [],
    invoices: [],
    purchaseOrders: [],
    isAdmin: false,
  };
}

function saveToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
}

// Sample data for demo
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
    students: [
      {
        id: student1Id,
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@email.com',
        phone: '06 12 34 56 78',
        level: 'Terminale S',
        notes: 'Préparation bac, difficultés en analyse',
        createdAt: new Date().toISOString(),
        archived: false,
      },
      {
        id: student2Id,
        firstName: 'Lucas',
        lastName: 'Martin',
        email: 'lucas.martin@email.com',
        phone: '06 98 76 54 32',
        level: 'Première S',
        notes: 'Renforcement en géométrie',
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
    isAdmin: false,
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

  const confirmAppointment = (id: string) => {
    updateAppointment(id, { status: 'confirmed' });
  };

  const cancelAppointment = (id: string) => {
    updateAppointment(id, { status: 'cancelled' });
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

  const setIsAdmin = (val: boolean) => {
    setState(prev => ({ ...prev, isAdmin: val }));
  };

  const getStudentById = (id: string) => {
    return state.students.find(s => s.id === id);
  };

  return (
    <AppContext.Provider value={{
      ...state,
      addStudent,
      updateStudent,
      deleteStudent,
      archiveStudent,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      archiveAppointment,
      confirmAppointment,
      cancelAppointment,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      addPurchaseOrder,
      setIsAdmin,
      getStudentById,
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
