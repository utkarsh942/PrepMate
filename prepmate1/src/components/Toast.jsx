import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

let toastListeners = [];

export const toast = {
  success: (message, duration = 3000) => {
    toastListeners.forEach((listener) => listener(message, 'success', duration));
  },
  error: (message, duration = 4000) => {
    toastListeners.forEach((listener) => listener(message, 'error', duration));
  },
  info: (message, duration = 3000) => {
    toastListeners.forEach((listener) => listener(message, 'info', duration));
  }
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const addToast = (message, type, duration) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
            t.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
              : t.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-200'
              : 'bg-blue-500/10 border-blue-500/20 text-blue-200'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {t.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
          <button
            onClick={() => removeToast(t.id)}
            className="shrink-0 text-white/40 hover:text-white/85 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
