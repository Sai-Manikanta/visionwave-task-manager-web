import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const show = useCallback((type, message) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, type, message }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), type === 'error' ? 6000 : 3500);
  }, []);

  const value = useMemo(
    () => ({
      success: (message) => show('success', message),
      error: (message) => show('error', message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="fixed right-4 bottom-4 left-4 z-50 flex flex-col items-end gap-2 sm:left-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={`w-full rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg sm:w-80 ${
              toast.type === 'error' ? 'bg-red-700' : 'bg-slate-800'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
