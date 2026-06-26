import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
const ToastContext = createContext(undefined);
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);
    const toast = useCallback((message, type = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            removeToast(id);
        }, 4000);
    }, [removeToast]);
    const success = useCallback((msg) => toast(msg, 'success'), [toast]);
    const error = useCallback((msg) => toast(msg, 'error'), [toast]);
    const info = useCallback((msg) => toast(msg, 'info'), [toast]);
    return (<ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      
      {/* Toast Portal/Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((t) => (<div key={t.id} className={`flex items-start justify-between gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all duration-300 animate-slide-up ${t.type === 'success'
                ? 'bg-slate-900/90 border-emerald-500/30 text-emerald-400'
                : t.type === 'error'
                    ? 'bg-slate-900/90 border-red-500/30 text-red-400'
                    : 'bg-slate-900/90 border-brand-500/30 text-brand-400'}`}>
            <div className="flex items-start gap-2.5">
              {t.type === 'success' && <CheckCircle className="w-5 h-5 shrink-0 mt-0.5"/>}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 mt-0.5"/>}
              {t.type === 'info' && <Info className="w-5 h-5 shrink-0 mt-0.5"/>}
              <p className="text-sm font-medium text-slate-200 leading-relaxed">{t.message}</p>
            </div>
            <button onClick={() => removeToast(t.id)} className="p-0.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0">
              <X className="w-4 h-4"/>
            </button>
          </div>))}
      </div>
    </ToastContext.Provider>);
}
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
