import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";

const ToastContext = createContext(null);

let idSeed = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const notify = useCallback((message, options = {}) => {
    const id = idSeed++;
    const toast = {
      id,
      message,
      title: options.title || "",
      tone: options.tone || "good" // good | warn | danger | info
    };
    setToasts((list) => [...list, toast]);
    timers.current[id] = setTimeout(() => dismiss(id), options.duration || 3600);
    return id;
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ notify, dismiss }}>
      {children}
      <div className="toastStack" role="status" aria-live="polite">
        {toasts.map((t) => {
          const Icon = t.tone === "danger" ? AlertTriangle : t.tone === "warn" ? AlertTriangle : t.tone === "info" ? Info : CheckCircle2;
          return (
            <div className={`toastItem ${t.tone}`} key={t.id} onClick={() => dismiss(t.id)}>
              <Icon size={18} />
              <div>
                {t.title && <strong>{t.title}</strong>}
                <span>{t.message}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
