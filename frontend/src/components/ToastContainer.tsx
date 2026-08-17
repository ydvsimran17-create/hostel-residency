/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { Toast as ToastType } from '../types';

interface ToastContainerProps {
  toasts: ToastType[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let borderColorClass = 'border-blue-gray-medium/30';
          let iconColorClass = 'text-blue-gray-medium';
          let textColorClass = 'text-charcoal';

          if (toast.type === 'success') {
            Icon = CheckCircle;
            borderColorClass = 'border-[#567A5E]';
            iconColorClass = 'text-[#567A5E]';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderColorClass = 'border-[#C8B89A]';
            iconColorClass = 'text-[#C8B89A]';
          } else if (toast.type === 'error') {
            Icon = XCircle;
            borderColorClass = 'border-red-500';
            iconColorClass = 'text-red-500';
          }

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } }}
              className={`flex items-start gap-3 p-4 rounded-xl border bg-[#F7F5F2] shadow-xl pointer-events-auto ${borderColorClass}`}
              id={`toast-${toast.id}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Icon className={`h-5 w-5 ${iconColorClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold leading-relaxed ${textColorClass}`}>
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors rounded p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
