import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { AppNotification } from '../../core/application/services/INotificationService.ts';

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss?: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  if (notifications.length === 0) return null;

  // Display top 3 most recent
  const visible = notifications.slice(0, 3);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {visible.map(notif => {
        let icon = <Info className="w-4 h-4 text-blue-500" />;
        let borderClass = 'border-blue-200 bg-white';

        if (notif.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
          borderClass = 'border-emerald-200 bg-emerald-50/90 text-emerald-950';
        } else if (notif.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
          borderClass = 'border-amber-200 bg-amber-50/90 text-amber-950';
        } else if (notif.type === 'error') {
          icon = <XCircle className="w-4 h-4 text-red-500" />;
          borderClass = 'border-red-200 bg-red-50/90 text-red-950';
        }

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto p-3.5 rounded-[12px] border shadow-lg backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-slide-in ${borderClass}`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold leading-tight">{notif.title}</h5>
              <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{notif.message}</p>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(notif.id)}
                className="shrink-0 text-gray-400 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
