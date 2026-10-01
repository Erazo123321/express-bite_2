import { orderService } from '../../../../services/orderService.ts';
import { OrderStatusType } from '../../../../src/core/domain/value-objects/OrderStatus.ts';

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * Next.js App Router Route Handler: GET & PATCH /api/orders/[id]
 */
export async function GET(
  _request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { id } = await Promise.resolve(context.params);
    const orders = await orderService.getAllOrders();
    const order = orders.find(o => o.id === id || o.orderNumber === id);

    if (!order) {
      return Response.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    return Response.json(order, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Error en servidor' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
): Promise<Response> {
  try {
    const { id } = await Promise.resolve(context.params);
    const body = await request.json();
    const newStatus = body?.status as OrderStatusType;

    if (!newStatus) {
      return Response.json(
        { error: 'Debe especificarse el campo status (e.g. PREPARING, READY, DELIVERED).' },
        { status: 400 }
      );
    }

    const updatedOrder = await orderService.updateOrderStatus(id, newStatus);
    return Response.json(updatedOrder, { status: 200 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'Error al actualizar pedido' }, { status: 400 });
  }
}
