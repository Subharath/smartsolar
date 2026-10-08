import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon, 
  CloseIcon 
} from '../components/common/Icons';

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type, title, message, duration = 4000 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title, message, options) => {
    addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = useCallback((title, message, options) => {
    addToast({ type: 'error', title, message, ...options });
  }, [addToast]);

  const warning = useCallback((title, message, options) => {
    addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const info = useCallback((title, message, options) => {
    addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  // Global showToast helper similar to the request
  const showToast = useCallback((options) => {
    addToast(options);
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:top-5 sm:right-5 z-[9999] flex flex-col gap-3 pointer-events-none sm:w-[380px] w-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, removeToast }) {
  const { id, type, title, message, duration } = toast;
  const [isLeaving, setIsLeaving] = useState(false);
  
  const handleRemove = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      removeToast(id);
    }, 300); 
  }, [id, removeToast]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleRemove]);

  const iconMap = {
    success: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
    error: <XCircleIcon className="w-5 h-5 text-red-500" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />,
    info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />,
  };

  const bgMap = {
    success: 'border-emerald-100',
    error: 'border-red-100',
    warning: 'border-amber-100',
    info: 'border-blue-100',
  };

  return (
    <div 
      className={`pointer-events-auto flex w-full items-start p-4 bg-white/95 backdrop-blur-xl rounded-xl shadow-lg border ${bgMap[type]} transition-all duration-300 ${
        isLeaving ? 'opacity-0 translate-x-full' : 'animate-toast-in opacity-100 translate-x-0'
      }`}
      role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        {iconMap[type]}
      </div>
      <div className="flex-1 mr-2 min-w-0">
        {title && <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>}
        {message && <p className="mt-1 text-sm text-gray-600 break-words">{message}</p>}
      </div>
      <button 
        onClick={handleRemove}
        className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md"
        aria-label="Close notification"
      >
        <CloseIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
