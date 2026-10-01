import React, { useState } from 'react';
import { Send, ArrowDownCircle, ArrowUpCircle, CheckCircle2, Clock, FileCode, Copy, Check } from 'lucide-react';
import { ProductDTO } from '../../../core/application/dtos/ProductDTO.ts';
import { OrderDTO } from '../../../core/application/dtos/OrderDTO.ts';
import { apiFetch } from '../../../../services/apiClient.ts';

interface RestApiExplorerProps {
  products: ProductDTO[];
  orders: OrderDTO[];
  onRefreshAll: () => Promise<void>;
}

export const RestApiExplorer: React.FC<RestApiExplorerProps> = ({
  products,
  orders,
  onRefreshAll,
}) => {
  const [activeTab, setActiveTab] = useState<'tester' | 'code'>('tester');
  const [selectedEndpoint, setSelectedEndpoint] = useState<'get-products' | 'get-orders' | 'post-order' | 'patch-order'>('get-products');
  const [responseLog, setResponseLog] = useState<{
    status: number;
    statusText: string;
    durationMs: number;
    url: string;
    method: string;
    body: any;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  // Form for POST /api/orders
  const [postCustomerName, setPostCustomerName] = useState('Matías Valenzuela');
  const [postProductId, setPostProductId] = useState(products[0]?.id || 'prod-cafe-artesanal');
  const [postQuantity, setPostQuantity] = useState(1);

  const executeGetProducts = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await apiFetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setResponseLog({
        status: res.status,
        statusText: res.statusText || 'OK',
        durationMs: duration,
        url: '/api/products',
        method: 'GET',
        body: data,
      });
      await onRefreshAll();
    } catch (err: any) {
      setResponseLog({
        status: 500,
        statusText: 'Internal Error',
        durationMs: 0,
        url: '/api/products',
        method: 'GET',
        body: { error: err?.message },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeGetOrders = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await apiFetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setResponseLog({
        status: res.status,
        statusText: res.statusText || 'OK',
        durationMs: duration,
        url: '/api/orders',
        method: 'GET',
        body: data,
      });
      await onRefreshAll();
    } catch (err: any) {
      setResponseLog({
        status: 500,
        statusText: 'Internal Error',
        durationMs: 0,
        url: '/api/orders',
        method: 'GET',
        body: { error: err?.message },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executePostOrder = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const targetProd = products.find(p => p.id === postProductId);
      const payload = {
        productId: postProductId,
        productName: targetProd?.name || 'Producto Seleccionado',
      };

      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setResponseLog({
        status: res.status,
        statusText: res.status === 201 ? 'Created' : 'Error',
        durationMs: duration,
        url: '/api/orders',
        method: 'POST',
        body: data,
      });
      await onRefreshAll();
    } catch (err: any) {
      setResponseLog({
        status: 500,
        statusText: 'Internal Error',
        durationMs: 0,
        url: '/api/orders',
        method: 'POST',
        body: { error: err?.message },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executePatchOrderStatus = async () => {
    if (orders.length === 0) return;
    const targetOrder = orders[0];
    const newStatus = targetOrder.status === 'PREPARING' ? 'READY' : 'PREPARING';

    setIsLoading(true);
    const start = performance.now();
    try {
      const res = await apiFetch(`/api/orders/${targetOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      const duration = Math.round(performance.now() - start);
      setResponseLog({
        status: res.status,
        statusText: 'OK',
        durationMs: duration,
        url: `/api/orders/${targetOrder.id}`,
        method: 'PATCH',
        body: data,
      });
      await onRefreshAll();
    } catch (err: any) {
      setResponseLog({
        status: 500,
        statusText: 'Internal Error',
        durationMs: 0,
        url: `/api/orders/${targetOrder.id}`,
        method: 'PATCH',
        body: { error: err?.message },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filesCode: Record<string, { path: string; code: string }> = {
    'api-products': {
      path: 'app/api/products/route.ts',
      code: `import { productService } from '@/services/productService';

export async function GET(request?: Request): Promise<Response> {
  try {
    const products = await productService.getAllProducts();
    return Response.json(products, { status: 200 });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Error al obtener productos' },
      { status: 500 }
    );
  }
}`,
    },
    'api-orders': {
      path: 'app/api/orders/route.ts',
      code: `import { orderService } from '@/services/orderService';
import { CreateOrderDTO } from '@/src/core/application/dtos/CreateOrderDTO';

export async function GET(): Promise<Response> {
  try {
    const orders = await orderService.getAllOrders();
    return Response.json(orders, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: CreateOrderDTO = await request.json();
    const newOrder = await orderService.createOrder(body);
    return Response.json(newOrder, { status: 201 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}`,
    },
    'product-service': {
      path: 'services/productService.ts',
      code: `import { container } from '@/src/presentation/di/container';

export const productService = {
  async getAllProducts() {
    return container.getProductsUseCase.execute();
  },
  async updateStock(id: string, newStock: number) {
    return container.updateStockUseCase.execute(id, newStock);
  }
};`,
    },
    'order-service': {
      path: 'services/orderService.ts',
      code: `import { container } from '@/src/presentation/di/container';
import { CreateOrderDTO } from '@/src/core/application/dtos/CreateOrderDTO';

export const orderService = {
  async getAllOrders() {
    return container.getOrdersUseCase.getAllOrders();
  },
  async createOrder(dto: CreateOrderDTO) {
    return container.createOrderUseCase.execute(dto);
  },
  async updateOrderStatus(orderId: string, status: any) {
    return container.updateOrderStatusUseCase.execute(orderId, status);
  }
};`,
    },
  };

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(key);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-6 space-y-6">
      {/* Header banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <FileCode className="w-5 h-5 text-emerald-700" />
            </span>
            <h2 className="text-xl font-bold text-gray-900">
              Next.js RESTful API & Refactorización App Router
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Endpoints RESTful desacoplados que exponen <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">productService</code> y{' '}
            <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">orderService</code> para consumo (GET) y mutación (POST/PATCH).
          </p>
        </div>

        <div className="flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/60">
          <button
            onClick={() => setActiveTab('tester')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'tester' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
            }`}
          >
            Playground Interactivo
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'code' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600'
            }`}
          >
            Código Fuente de Rutas
          </button>
        </div>
      </div>

      {activeTab === 'tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Seleccionar Operación RESTful</h3>

              {/* Endpoint Selection buttons */}
              <div className="space-y-2">
                {/* GET /api/products */}
                <button
                  onClick={() => {
                    setSelectedEndpoint('get-products');
                    executeGetProducts();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    selectedEndpoint === 'get-products'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-blue-100 text-blue-800">
                      GET
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-900">/api/products</span>
                  </div>
                  <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                </button>

                {/* GET /api/orders */}
                <button
                  onClick={() => {
                    setSelectedEndpoint('get-orders');
                    executeGetOrders();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    selectedEndpoint === 'get-orders'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-blue-100 text-blue-800">
                      GET
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-900">/api/orders</span>
                  </div>
                  <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                </button>

                {/* POST /api/orders */}
                <div
                  className={`p-3.5 rounded-xl border transition space-y-3 ${
                    selectedEndpoint === 'post-order'
                      ? 'border-emerald-500 bg-emerald-50/30 shadow-2xs'
                      : 'border-gray-200'
                  }`}
                >
                  <div
                    onClick={() => setSelectedEndpoint('post-order')}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        POST
                      </span>
                      <span className="font-mono text-xs font-bold text-gray-900">/api/orders</span>
                    </div>
                    <ArrowUpCircle className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div className="pt-2 border-t border-gray-100 space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500">Cliente:</label>
                      <input
                        type="text"
                        value={postCustomerName}
                        onChange={e => setPostCustomerName(e.target.value)}
                        className="w-full mt-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-gray-500">Producto:</label>
                        <select
                          value={postProductId}
                          onChange={e => setPostProductId(e.target.value)}
                          className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.stock} disp.)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-gray-500">Cantidad:</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={postQuantity}
                          onChange={e => setPostQuantity(parseInt(e.target.value, 10) || 1)}
                          className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <button
                      onClick={executePostOrder}
                      disabled={isLoading}
                      className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Enviando...' : 'Enviar POST /api/orders'}</span>
                    </button>
                  </div>
                </div>

                {/* PATCH /api/orders/[id] */}
                <button
                  onClick={() => {
                    setSelectedEndpoint('patch-order');
                    executePatchOrderStatus();
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                    selectedEndpoint === 'patch-order'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-2xs'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-amber-100 text-amber-800">
                      PATCH
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-900">/api/orders/[id]</span>
                  </div>
                  <span className="text-[11px] text-gray-500">Simular estado</span>
                </button>
              </div>
            </div>
          </div>

          {/* Response Viewer (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-gray-700">Respuesta HTTP</span>
                  {responseLog && (
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                        responseLog.status >= 200 && responseLog.status < 300
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {responseLog.status} {responseLog.statusText}
                    </span>
                  )}
                </div>

                {responseLog && (
                  <span className="flex items-center gap-1 text-[11px] text-gray-500 font-mono">
                    <Clock className="w-3 h-3 text-gray-400" />
                    {responseLog.durationMs}ms
                  </span>
                )}
              </div>

              <div className="p-4 bg-gray-950 text-gray-100 font-mono text-xs max-h-[480px] overflow-y-auto custom-scrollbar">
                {responseLog ? (
                  <div>
                    <div className="text-gray-400 text-[11px] pb-2 mb-2 border-b border-gray-800">
                      // {responseLog.method} {responseLog.url}
                    </div>
                    <pre className="text-emerald-400 leading-relaxed text-[11px]">
                      {JSON.stringify(responseLog.body, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="py-16 text-center text-gray-500 text-xs">
                    Haz clic en una de las rutas a la izquierda para enviar una petición HTTP y observar el resultado.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'code' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(filesCode).map(([key, item]) => (
              <div key={key} className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gray-800">{item.path}</span>
                  <button
                    onClick={() => copyToClipboard(key, item.code)}
                    className="p-1 text-gray-500 hover:text-gray-900 transition cursor-pointer"
                    title="Copiar código"
                  >
                    {copiedFile === key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div className="p-3.5 bg-gray-900 text-gray-100 font-mono text-[11px] max-h-64 overflow-y-auto">
                  <pre>{item.code}</pre>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Archivos listos para producción en Next.js (App Router)</p>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Todos los archivos creados en <code className="font-mono bg-white px-1 py-0.5 rounded">app/api/products/route.ts</code>,{' '}
                <code className="font-mono bg-white px-1 py-0.5 rounded">app/api/orders/route.ts</code> y{' '}
                <code className="font-mono bg-white px-1 py-0.5 rounded">app/page.tsx</code> siguen la arquitectura limpia y son 100% compatibles con Next.js 14 y 15.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
