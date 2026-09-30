import React from 'react';
import { Clock, Bell, CheckCircle2, Hourglass, RefreshCw } from 'lucide-react';
import { OrderDTO } from '../../../core/application/dtos/OrderDTO.ts';

interface ActiveOrderCardProps {
  order: OrderDTO | null;
  onToggleStatus: () => void;
  onSimulateNewOrder: () => void;
}

export const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({
  order,
  onToggleStatus,
  onSimulateNewOrder,
}) => {
  if (!order) {
    return (
      <div className="rounded-[12px] p-4 border border-dashed border-gray-300 bg-gray-50/70 text-center">
        <p className="text-xs font-semibold text-gray-700">No tienes ningún pedido activo en este momento.</p>
        <p className="text-[11px] text-gray-500 mt-0.5">Elige un producto del menú exprés para pedir sin filas.</p>
        <button
          onClick={onSimulateNewOrder}
          className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-[8px] transition shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Generar Pedido de Prueba (#EB-108)</span>
        </button>
      </div>
    );
  }

  const isReady = order.status === 'READY';
  const isDelivered = order.status === 'DELIVERED';

  // Dynamic color styling: Orange for Preparing, Bright green for Ready
  let containerStyles = 'bg-amber-500/10 border-amber-300 text-amber-900';
  let badgeStyles = 'bg-amber-500 text-white';
  let iconWrapperStyles = 'bg-amber-500 text-white';
  let badgeLabel = 'PREPARING';
  let subtitleText = 'El barista está preparando tu pedido.';
  let footnoteIcon = <Hourglass className="w-3.5 h-3.5 text-amber-700" />;
  let footnoteText = (
    <span>
      Tiempo estimado: <strong>{order.estimatedMinutes || 2} minutos</strong>
    </span>
  );

  if (isReady) {
    containerStyles = 'bg-[#22C55E]/15 border-[#22C55E] text-emerald-950 shadow-sm';
    badgeStyles = 'bg-[#16A34A] text-white animate-pulse';
    iconWrapperStyles = 'bg-[#16A34A] text-white shadow-sm';
    badgeLabel = '¡LISTO PARA RECOGER!';
    subtitleText = `Pasa por el mostrador con tu código ${order.orderNumber}.`;
    footnoteIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    footnoteText = <span>Entrega inmediata en <strong>{order.pickupCounter || 'Barra 1'}</strong></span>;
  } else if (isDelivered) {
    containerStyles = 'bg-gray-100 border-gray-200 text-gray-800';
    badgeStyles = 'bg-gray-700 text-white';
    iconWrapperStyles = 'bg-gray-600 text-white';
    badgeLabel = 'ENTREGADO';
    subtitleText = 'Pedido completado. ¡Buen provecho!';
    footnoteIcon = <CheckCircle2 className="w-3.5 h-3.5 text-gray-500" />;
    footnoteText = <span>Entregado exitosamente</span>;
  }

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Mi Pedido Actual
        </h3>
        <button
          onClick={onToggleStatus}
          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline transition cursor-pointer"
        >
          Simular cambio de estado
        </button>
      </div>

      {/* Dynamic Ticket Box */}
      <div className={`rounded-[12px] p-4 transition-all duration-300 border ${containerStyles}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 shadow-xs transition-colors ${iconWrapperStyles}`}
            >
              {isReady ? (
                <Bell className="w-5 h-5 animate-bounce" />
              ) : isDelivered ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Clock className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${badgeStyles}`}
                >
                  {isReady ? '¡Listo para recoger!' : order.statusLabel}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {order.itemsSummary || '1x Café Artesanal + 1x Empanada'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{subtitleText}</p>
            </div>
          </div>
        </div>

        {/* Progress footnote */}
        <div className="mt-3.5 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
          <div className="font-medium flex items-center gap-1.5">
            {footnoteIcon}
            {footnoteText}
          </div>
          <span className="font-extrabold text-gray-900 tabular-nums">
            {order.formattedTotal}
          </span>
        </div>
      </div>
    </div>
  );
};
