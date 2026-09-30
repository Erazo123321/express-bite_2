import { Order } from '../../domain/entities/Order.ts';
import { OrderStatusType } from '../../domain/value-objects/OrderStatus.ts';

export interface OrderItemDTO {
  productId: string;
  productName: string;
  unitPrice: number;
  formattedUnitPrice: string;
  quantity: number;
  subtotal: number;
  formattedSubtotal: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  customerName: string;
  items: OrderItemDTO[];
  itemsSummary: string;
  status: OrderStatusType;
  statusLabel: string;
  total: number;
  formattedTotal: string;
  createdAt: string;
  elapsedTimeString: string;
  estimatedMinutes: number;
  paymentMethod: string;
  pickupCounter: string;
  canBeDelivered: boolean;
}

export class OrderDTOMapper {
  static toDTO(order: Order): OrderDTO {
    const totalMoney = order.calculateTotal();

    const items: OrderItemDTO[] = order.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      unitPrice: item.unitPrice.amount,
      formattedUnitPrice: item.unitPrice.format(),
      quantity: item.quantity,
      subtotal: item.getSubtotal().amount,
      formattedSubtotal: item.getSubtotal().format(),
    }));

    const elapsedMs = Date.now() - order.createdAt.getTime();
    const elapsedMinutes = Math.max(0, Math.floor(elapsedMs / 60000));
    const elapsedTimeString = elapsedMinutes <= 0 ? 'Hace un momento' : `Hace ${elapsedMinutes}m`;

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      items,
      itemsSummary: order.getItemsSummary(),
      status: order.status.value,
      statusLabel: order.status.label,
      total: totalMoney.amount,
      formattedTotal: totalMoney.format(),
      createdAt: order.createdAt.toISOString(),
      elapsedTimeString,
      estimatedMinutes: order.estimatedMinutes,
      paymentMethod: order.paymentMethod,
      pickupCounter: order.pickupCounter,
      canBeDelivered: order.status.value !== 'DELIVERED' && order.status.value !== 'CANCELLED',
    };
  }
}
