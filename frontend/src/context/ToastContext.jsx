import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const toastSuccess = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const toastError = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast]);
  const toastInfo = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);
  const toastWarning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toastSuccess, toastError, toastInfo, toastWarning }}>
      {children}

      {/* Toast Render Node */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bgColor = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800';
          let textColor = 'text-slate-800 dark:text-slate-100';
          let icon = <Info className="w-5 h-5 text-brand-500" />;

          switch (toast.type) {
            case 'success':
              bgColor = 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30';
              textColor = 'text-emerald-800 dark:text-emerald-200';
              icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
              break;
            case 'error':
              bgColor = 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30';
              textColor = 'text-rose-800 dark:text-rose-200';
              icon = <AlertCircle className="w-5 h-5 text-rose-500" />;
              break;
            case 'warning':
              bgColor = 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30';
              textColor = 'text-amber-800 dark:text-amber-200';
              icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
              break;
            default:
              break;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start justify-between p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 pointer-events-auto animate-bounce-in ${bgColor}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{icon}</div>
                <p className={`text-sm font-medium ${textColor}`}>{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
