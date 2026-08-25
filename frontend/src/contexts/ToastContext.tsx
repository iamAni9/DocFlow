import { createContext, useContext, useState, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        zIndex: 9999
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            backgroundColor: 'var(--canvas)',
            border: '1px solid var(--hairline)',
            boxShadow: 'var(--shadow-2)',
            borderRadius: 'var(--rounded-md)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 250,
            animation: 'slideIn 0.2s ease-out forwards'
          }}>
            {toast.type === 'success' && <CheckCircle size={18} color="var(--primary)" />}
            {toast.type === 'error' && <AlertCircle size={18} color="var(--error)" />}
            {toast.type === 'info' && <AlertCircle size={18} color="var(--steel)" />}
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', flex: 1 }}>{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="btn-ghost" style={{ padding: 4 }}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
