import React, { useEffect, useState } from 'react';
import { CheckCircle, FileText, Mail, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'auto';
  title: string;
  message: string;
  icon?: React.ReactNode;
}

interface NotificationProviderProps {
  children: React.ReactNode;
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function NotificationToast({ notifications, onDismiss }: NotificationProviderProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`bg-white rounded-xl shadow-2xl border p-4 flex items-start gap-3 animate-slide-in ${
            notif.type === 'success' ? 'border-green-200' :
            notif.type === 'auto' ? 'border-indigo-200' :
            'border-blue-200'
          }`}
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            notif.type === 'success' ? 'bg-green-100' :
            notif.type === 'auto' ? 'bg-indigo-100' :
            'bg-blue-100'
          }`}>
            {notif.icon || <CheckCircle className={`w-4 h-4 ${
              notif.type === 'success' ? 'text-green-600' :
              notif.type === 'auto' ? 'text-indigo-600' :
              'text-blue-600'
            }`} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 text-sm">{notif.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{notif.message}</div>
          </div>
          <button
            onClick={() => onDismiss(notif.id)}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notif: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setNotifications(prev => [...prev, { ...notif, id }]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return { notifications, addNotification, dismissNotification };
}
