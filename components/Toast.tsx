"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { IoCheckmarkCircle, IoWarning, IoInformationCircle, IoClose } from "react-icons/io5";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {} };
  return ctx;
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: IoCheckmarkCircle,
    error: IoWarning,
    info: IoInformationCircle,
  };

  const colors = {
    success: "text-green-400",
    error: "text-accent-red",
    info: "text-accent-cyan",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className="glass-strong rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] slide-up pointer-events-auto shadow-2xl"
            >
              <Icon className={`text-xl flex-shrink-0 ${colors[toast.type]}`} />
              <p className="text-white text-sm flex-1">{toast.message}</p>
              <button
                onClick={() => dismiss(toast.id)}
                className="text-spotify-light-gray hover:text-white flex-shrink-0"
              >
                <IoClose className="text-sm" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
