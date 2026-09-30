import React, { useState } from 'react';
import { Coffee, Bell, Users, CheckCircle2 } from 'lucide-react';
import { ProductDTO } from '../../../core/application/dtos/ProductDTO.ts';
import { OrderDTO } from '../../../core/application/dtos/OrderDTO.ts';
import { QueueStatsDTO } from '../../../core/application/use-cases/GetQueueStatsUseCase.ts';
import { ProductCard } from './ProductCard.tsx';
import { ActiveOrderCard } from './ActiveOrderCard.tsx';

interface StudentViewProps {
  products: ProductDTO[];
  currentOrder: OrderDTO | null;
  queueStats: QueueStatsDTO;
  onOrderProduct: (product: ProductDTO) => Promise<void>;
  onToggleStatus: () => void;
  onSimulateInitialOrder: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  products,
  currentOrder,
  queueStats,
  onOrderProduct,
  onToggleStatus,
  onSimulateInitialOrder,
}) => {
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <section className="w-full flex flex-col items-center justify-center py-2 sm:py-6">
      {/* Device simulation container for previewing mobile experience seamlessly */}
      <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl border border-gray-200/90 overflow-hidden flex flex-col relative pb-3 transition-all">
        {/* Mobile Header Bar */}
        <div className="bg-white/95 backdrop-blur-sm px-5 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Coffee className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900 tracking-tight leading-none">
                  Express<span className="text-emerald-600">Bite</span>
                </h1>
                <p className="text-[11px] font-medium text-gray-400 mt-0.5">Cafetería Universitaria</p>
              </div>
            </div>

            {/* Profile / Fast notification */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                aria-label="Ver notificaciones"
                className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200/70 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                <Bell className="w-4 h-4" />
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-64 p-3 bg-white rounded-[12px] shadow-xl border border-gray-100 z-30 text-xs">
                  <div className="font-bold text-gray-900 mb-1">Notificaciones</div>
                  <p className="text-gray-500 text-[11px]">
                    Tu tarjeta universitaria tiene saldo disponible. Retiros en Barra 1 y Barra 2.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Indicador de 'Estado de la Fila' */}
          <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-100/90 rounded-[12px] p-2.5 px-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-900">Estado de la Fila</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200/50 shadow-xs">
              <Users className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              <span>Espera actual: {queueStats.pendingCount} pedidos</span>
            </div>
          </div>
        </div>

        {/* Scrollable Student Body */}
        <div className="px-5 py-4 space-y-5 custom-scrollbar max-h-[calc(100vh-220px)] overflow-y-auto">
          {/* Banner / Greetings */}
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Menú Exprés</h2>
              <p className="text-xs text-gray-500">Pide y retira sin hacer filas</p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-[8px] border border-emerald-100/60">
              Entrega en ~{queueStats.estimatedWaitMinutes} min
            </span>
          </div>

          {/* Cuadrícula de 4 tarjetas de productos */}
          <div className="grid grid-cols-2 gap-3.5">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onOrder={async prod => {
                  await onOrderProduct(prod);
                }}
              />
            ))}
          </div>

          {/* Dynamic Active Order Section */}
          <ActiveOrderCard
            order={currentOrder}
            onToggleStatus={onToggleStatus}
            onSimulateNewOrder={onSimulateInitialOrder}
          />
        </div>

        {/* Simple mobile footer branding */}
        <div className="mt-auto px-5 py-2.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
          <span>
            Estudiante: <strong className="text-gray-700 font-semibold">M. Valenzuela</strong>
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Conectado
          </span>
        </div>
      </div>
    </section>
  );
};
