import { orderService } from '../../../services/orderService.ts';

/**
 * Next.js App Router Route Handler: GET & POST /api/orders
 * Exposes order retrieval and creation via RESTful API.
 */
export async function GET(_request?: Request): Promise<Response> {
  try {
    const orders = await orderService.getMyOrders('Current User');

    return Response.json(orders, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Error al obtener los pedidos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { productId, productName } = body;

    if (!productId) {
      return Response.json(
        { error: 'Debe especificarse el productId en el cuerpo de la petición.' },
        { status: 400 }
      );
    }

    const createdOrder = await orderService.createOrder({
      productId,
      productName,
      customerName: 'Current User',
    });

    return Response.json(createdOrder, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || 'Error al crear el pedido' },
      { status: 400 }
    );
  }
}
