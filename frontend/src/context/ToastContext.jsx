import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
export const useToast = () => useContext(ToastContext);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };
const COLORS = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-brand-600',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((type, message) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t.slice(-3), { id, type, message }]);
    setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const api = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" aria-live="polite">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className="card pointer-events-auto flex items-start gap-3 p-3 shadow-lg" role="status">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${COLORS[t.type]}`} />
              <p className="flex-1 text-sm">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
