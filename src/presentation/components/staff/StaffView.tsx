import React from 'react';
import { ChefHat, CheckCircle2, Receipt, User, ThumbsUp } from 'lucide-react';
import { OrderDTO } from '../../../core/application/dtos/OrderDTO.ts';
import { ProductDTO } from '../../../core/application/dtos/ProductDTO.ts';
import { QueueStatsDTO } from '../../../core/application/use-cases/GetQueueStatsUseCase.ts';
import { InventoryTable } from './InventoryTable.tsx';

interface StaffViewProps {
  orders: OrderDTO[];
  products: ProductDTO[];
  queueStats: QueueStatsDTO;
  onDeliverOrder: (orderId: string) => Promise<unknown>;
  onUpdateStock: (productId: string, newStock: number) => Promise<unknown>;
  onResetMockData: () => Promise<unknown>;
}

export const StaffView: React.FC<StaffViewProps> = ({
  orders,
  products,
  queueStats,
  onDeliverOrder,
  onUpdateStock,
  onResetMockData,
}) => {
  const activeOrders = orders.filter(
    o => o.status === 'PENDING' || o.status === 'PREPARING' || o.status === 'READY'
  );

  return (
    <section className="w-full transition-opacity duration-200 py-4 sm:py-6">
      {/* Desktop Header Info */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              Panel de Control & Cafetería
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
              Turno Mañana
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de pedidos en tiempo real e inventario del campus universitario.
          </p>
        </div>

        {/* Quick Counters */}
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-[12px] px-4 py-2 border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ChefHat className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase">En Cola</p>
              <p className="text-base font-bold text-gray-900 leading-none tabular-nums">
                {activeOrders.length} pedidos
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[12px] px-4 py-2 border border-gray-200/80 shadow-xs flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase">Entregados Hoy</p>
              <p className="text-base font-bold text-gray-900 leading-none tabular-nums">
                {queueStats.completedCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Desktop Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Pedidos Entrantes (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-[12px] border border-gray-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-[8px] bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Pedidos Entrantes</h3>
                  <p className="text-xs text-gray-400">Ordenados por orden de llegada</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                En vivo
              </span>
            </div>

            {/* List of incoming orders with Student Name and Big 'Marcar como Entregado' button */}
            {activeOrders.length > 0 ? (
              <div className="space-y-3">
                {activeOrders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-[12px] border border-gray-200/90 bg-white hover:border-emerald-300 transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-500">{order.orderNumber}</span>
                        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                          <span>{order.customerName}</span>
                        </h4>
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          {order.elapsedTimeString}
                        </span>
                        {order.status === 'READY' && (
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            ¡Listo para entrega!
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 font-medium">
                        {order.itemsSummary}
                      </p>

                      <p className="text-[11px] text-gray-400 tabular-nums">
                        Total: {order.formattedTotal} • {order.paymentMethod}
                      </p>
                    </div>

                    {/* Big Button 'Marcar como Entregado' */}
                    <button
                      onClick={() => onDeliverOrder(order.id)}
                      className="shrink-0 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm px-5 py-3 rounded-[12px] shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Marcar como Entregado</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ThumbsUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h5 className="text-sm font-bold text-gray-900">¡Al día!</h5>
                <p className="text-xs text-gray-500">No hay pedidos pendientes en este momento.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Gestión de Inventario (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <InventoryTable
            products={products}
            onUpdateStock={onUpdateStock}
            onResetMockData={onResetMockData}
          />
        </div>
      </div>
    </section>
  );
};
