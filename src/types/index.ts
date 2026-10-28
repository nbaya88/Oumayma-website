export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  level: string;
  notes: string;
  createdAt: string;
  archived: boolean;
}

export interface Appointment {
  id: string;
  studentId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  subject: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  price: number;
  paid: boolean;
  createdAt: string;
  archived: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  studentId: string;
  appointmentIds: string[];
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  number: string;
  studentId: string;
  date: string;
  items: InvoiceItem[];
  total: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export type Page = 'home' | 'dashboard' | 'calendar' | 'students' | 'invoices' | 'archives';
