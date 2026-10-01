'use client';

import { useState, useEffect } from 'react';
import { Coffee, Bell, Users, Clock, Hourglass, Plus, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ProductDTO } from '../src/core/application/dtos/ProductDTO.ts';
import { OrderDTO } from '../src/core/application/dtos/OrderDTO.ts';
import { apiFetch } from '../services/apiClient.ts';

/**
 * Next.js App Router: `app/page.tsx` (Client Component)
 * Refactorizado según las especificaciones de la práctica:
 * - Parte 1: Consumo concurrente (GET) con Promise.all a /api/products y /api/orders, spinner y filtro de activos.
 * - Parte 2: Mutación (POST) con handleOrder(product), estado isOrdering ("Procesando..."),
 *   y actualización reactiva instantánea: setOrders(prev => [...prev, newOrder]).
 */
export default function CafeteriaPage() {
  // =========================================================================
  // PASO 2 (PARTE 1): ESTADOS LOCALES PARA LECTURA
  // =========================================================================
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // =========================================================================
  // PASO 3 (PARTE 2): ESTADO PARA MUTACIÓN Y ESCRITURA
  // =========================================================================
  const [isOrdering, setIsOrdering] = useState<boolean>(false);
  const [activeOrderingId, setActiveOrderingId] = useState<string | null>(null);

  // Consumo concurrente al montar el componente
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch concurrente usando Promise.all a /api/products y /api/orders
        const [productsRes, ordersRes] = await Promise.all([
          apiFetch('/api/products', { cache: 'no-store' }),
          apiFetch('/api/orders', { cache: 'no-store' }),
        ]);

        if (!productsRes.ok) {
          throw new Error(`Error ${productsRes.status} al cargar /api/products`);
        }
        if (!ordersRes.ok) {
          throw new Error(`Error ${ordersRes.status} al cargar /api/orders`);
        }

        const productsData: ProductDTO[] = await productsRes.json();
        const ordersData: OrderDTO[] = await ordersRes.json();

        setProducts(productsData);
        setOrders(ordersData);
      } catch (err: any) {
        console.error('Error al obtener datos iniciales de la API:', err);
        setError(err?.message || 'Error de conexión con la API RESTful.');
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // =========================================================================
  // PASO 3 (PARTE 2): FUNCIÓN DE MUTACIÓN handleOrder
  // =========================================================================
  const handleOrder = async (product: ProductDTO) => {
    if (product.isOutOfStock || isOrdering) return;

    try {
      setIsOrdering(true);
      setActiveOrderingId(product.id);
      setError(null);

      // Petición POST a /api/orders enviando productId y productName en el body como JSON
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: Falló la creación del pedido.`);
      }

      // Obtener el nuevo pedido creado con status 201
      const newOrder: OrderDTO = await res.json();

      // Actualizar el estado local para que aparezca instantáneamente sin recargar
      setOrders(prev => [...prev, newOrder]);

      // Decrementar stock local en el producto correspondiente
      setProducts(prevProducts =>
        prevProducts.map(p => {
          if (p.id === product.id) {
            const nextStock = Math.max(0, p.stock - 1);
            return {
              ...p,
              stock: nextStock,
              isOutOfStock: nextStock <= 0,
              isAvailable: nextStock > 0,
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      console.error('Error en mutación handleOrder:', err);
      setError(err?.message || 'Error al procesar el pedido.');
    } finally {
      setIsOrdering(false);
      setActiveOrderingId(null);
    }
  };

  // Filtrar pedidos activos (aquellos cuyo estado no sea 'delivered' ni 'cancelled')
  const activeOrders = orders.filter(
    order => order.status?.toLowerCase() !== 'delivered' && order.status?.toLowerCase() !== 'cancelled'
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1D1D1F] flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Coffee className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                Express<span className="text-emerald-600">Bite</span>
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Next.js RESTful App Router
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <span className="text-xs font-semibold text-gray-600 hidden sm:inline">Cafetería Abierta</span>
          </div>
        </div>
      </header>

      {/* Error Alert Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2.5 text-xs text-red-700 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
        {/* ========================================================================= */}
        {/* SPINNER DE CARGA MIENTRAS isLoading SEA TRUE                              */}
        {/* ========================================================================= */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-9 h-9 text-emerald-600 animate-spin" />
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">Cargando datos desde la API RESTful...</p>
              <p className="text-xs text-gray-400 mt-0.5">Consultando /api/products y /api/orders</p>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* RENDERIZADO DE PRODUCTOS Y PEDIDOS ACTIVOS                                */
          /* ========================================================================= */
          <div className="w-full max-w-[420px] bg-white rounded-[24px] shadow-2xl border border-gray-200/90 overflow-hidden flex flex-col pb-3">
            {/* Header del Dispositivo Móvil */}
            <div className="bg-white/95 px-5 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[10px] bg-emerald-600 flex items-center justify-center text-white">
                    <Coffee className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-none">
                      Express<span className="text-emerald-600">Bite</span>
                    </h2>
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">Cafetería Universitaria</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200/60 flex items-center justify-center text-gray-600">
                  <Bell className="w-4 h-4" />
                </button>
              </div>

              {/* Indicador de Estado de la Fila */}
              <div className="flex items-center justify-between bg-emerald-50/70 border border-emerald-100/90 rounded-[12px] p-2.5 px-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-900">Estado de la Fila</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-200/50 shadow-2xs">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Espera actual: {activeOrders.length} pedidos</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="px-5 py-4 space-y-5 custom-scrollbar max-h-[calc(100vh-220px)] overflow-y-auto">
              {/* Sección Menú Exprés */}
              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">Menú Exprés</h3>
                  <p className="text-xs text-gray-500">Pide y retira sin hacer filas</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-[8px]">
                  Entrega en ~4 min
                </span>
              </div>

              {/* Cuadrícula de Productos */}
              <div className="grid grid-cols-2 gap-3.5">
                {products.map(product => {
                  const isCurrentOrdering = isOrdering && activeOrderingId === product.id;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-[12px] p-2.5 border border-gray-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="relative w-full aspect-square rounded-[10px] overflow-hidden bg-gray-100 mb-2">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                            product.isOutOfStock ? 'grayscale opacity-60' : ''
                          }`}
                        />
                        {product.badge && (
                          <span className="absolute top-2 left-2 bg-white/95 text-gray-800 text-[10px] font-bold px-1.5 py-0.5 rounded-[6px] shadow-2xs">
                            {product.badge}
                          </span>
                        )}
                        {product.isOutOfStock && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              Agotado
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm leading-snug line-clamp-1">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 mb-2 line-clamp-1">{product.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-gray-100 mt-auto">
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900 tabular-nums">
                          {product.formattedPrice}
                        </span>

                        {product.isOutOfStock ? (
                          <span className="text-[11px] font-semibold text-gray-400 px-2 py-1">
                            Sin stock
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOrder(product)}
                            disabled={isOrdering}
                            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold px-2.5 py-1.5 rounded-[8px] transition-all flex items-center gap-1 shadow-2xs disabled:opacity-50 cursor-pointer"
                          >
                            {isCurrentOrdering ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Procesando...</span>
                              </>
                            ) : (
                              <>
                                <span>Pedir</span>
                                <Plus className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ========================================================================= */}
              {/* SECCIÓN "MI PEDIDO ACTUAL" / PEDIDOS ACTIVOS                              */}
              {/* ========================================================================= */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Mi Pedido Actual
                  </h4>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {activeOrders.length} activo(s)
                  </span>
                </div>

                {activeOrders.length > 0 ? (
                  activeOrders.map(order => {
                    const isReady = order.status?.toLowerCase() === 'ready';

                    return (
                      <div
                        key={order.id}
                        className={`rounded-[12px] p-4 transition-all duration-300 border ${
                          isReady
                            ? 'bg-[#22C55E]/15 border-[#22C55E] text-emerald-950 shadow-xs'
                            : 'bg-amber-500/10 border-amber-300 text-amber-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-[10px] text-white flex items-center justify-center shrink-0 shadow-xs ${
                                isReady ? 'bg-[#16A34A]' : 'bg-amber-500'
                              }`}
                            >
                              {isReady ? (
                                <Bell className="w-5 h-5 animate-bounce" />
                              ) : (
                                <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                    isReady ? 'bg-[#16A34A] text-white' : 'bg-amber-500 text-white'
                                  }`}
                                >
                                  {isReady ? '¡Listo para recoger!' : 'Preparando'}
                                </span>
                                <span className="text-xs font-semibold text-gray-600">
                                  {order.orderNumber}
                                </span>
                              </div>

                              <p className="text-sm font-bold text-gray-900 mt-1">
                                {order.itemsSummary}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {isReady
                                  ? `Pasa por el mostrador con tu código ${order.orderNumber}.`
                                  : 'El barista está preparando tu pedido.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-3 border-t border-black/10 flex items-center justify-between text-xs">
                          <span className="font-medium flex items-center gap-1.5 text-amber-900">
                            {isReady ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Entrega inmediata en Barra 1</span>
                              </>
                            ) : (
                              <>
                                <Hourglass className="w-3.5 h-3.5" />
                                <span>Tiempo estimado: <strong>{order.estimatedMinutes || 2} minutos</strong></span>
                              </>
                            )}
                          </span>
                          <span className="font-bold text-gray-900">{order.formattedTotal}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-[12px] border border-dashed border-gray-300 text-center bg-gray-50/60">
                    <p className="text-xs font-semibold text-gray-700">Sin pedidos activos</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Haz clic en "Pedir" en cualquier producto para enviar una orden a /api/orders.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="mt-auto px-5 py-2.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
              <span>
                Estudiante: <strong className="text-gray-700 font-semibold">Current User</strong>
              </span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Conectado (REST API)
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
