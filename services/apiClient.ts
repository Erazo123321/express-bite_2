import { GET as getProducts } from '../app/api/products/route.ts';
import { GET as getOrders, POST as postOrder } from '../app/api/orders/route.ts';
import { GET as getOrderById, PATCH as patchOrder } from '../app/api/orders/[id]/route.ts';

/**
 * Safe RESTful API Client
 * Dispatches directly to the Next.js App Router route handlers in preview mode,
 * without attempting to mutate the browser's global window.fetch.
 */
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const parsedUrl = new URL(input, origin);
  const pathname = parsedUrl.pathname;
  const method = (init?.method || 'GET').toUpperCase();
  const request = new Request(parsedUrl.toString(), init);

  try {
    if (pathname === '/api/products' && method === 'GET') {
      return await getProducts(request);
    }

    if (pathname === '/api/orders' && method === 'GET') {
      return await getOrders(request);
    }

    if (pathname === '/api/orders' && method === 'POST') {
      return await postOrder(request);
    }

    const matchOrder = pathname.match(/^\/api\/orders\/([^/]+)$/);
    if (matchOrder) {
      const id = matchOrder[1];
      if (method === 'PATCH') {
        return await patchOrder(request, { params: { id } });
      }
      if (method === 'GET') {
        return await getOrderById(request, { params: { id } });
      }
    }
  } catch (err: any) {
    console.error('Error invoking Route Handler via apiFetch:', err);
    return Response.json({ error: err?.message || 'Error en servidor' }, { status: 500 });
  }

  // Fallback to native fetch for external URLs
  return fetch(input, init);
}
