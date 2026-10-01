import { container } from '../src/presentation/di/container.ts';
import { CreateOrderDTO } from '../src/core/application/dtos/CreateOrderDTO.ts';
import { OrderDTO } from '../src/core/application/dtos/OrderDTO.ts';
import { OrderStatusType } from '../src/core/domain/value-objects/OrderStatus.ts';
import { QueueStatsDTO } from '../src/core/application/use-cases/GetQueueStatsUseCase.ts';

/**
 * Order Service (Clean Architecture Application Service)
 * Acts as the application boundary for order operations and queue stats.
 */
export const orderService = {
  /**
   * Retrieves orders for the current user.
   */
  async getMyOrders(customerName: string = 'Current User'): Promise<OrderDTO[]> {
    const all = await container.getOrdersUseCase.getAllOrders();
    const userOrders = all.filter(o =>
      o.customerName.toLowerCase() === customerName.toLowerCase() ||
      o.customerName.toLowerCase().includes('matías') ||
      customerName === 'Current User'
    );
    return userOrders.length > 0 ? userOrders : all;
  },

  /**
   * Retrieves all orders in descending order of creation.
   */
  async getAllOrders(): Promise<OrderDTO[]> {
    return container.getOrdersUseCase.getAllOrders();
  },

  /**
   * Retrieves all active orders (pending, preparing, ready).
   */
  async getActiveOrders(): Promise<OrderDTO[]> {
    return container.getOrdersUseCase.getActiveOrders();
  },

  /**
   * Retrieves the most recent order for a specific customer.
   */
  async getLatestOrderForCustomer(customerName: string): Promise<OrderDTO | null> {
    return container.getOrdersUseCase.getCustomerLatestOrder(customerName);
  },

  /**
   * Creates a new order with status 'preparing' and customer 'Current User'.
   */
  async createOrder(data: {
    productId?: string;
    productName?: string;
    customerName?: string;
    items?: Array<{ productId: string; quantity: number }>;
    paymentMethod?: string;
  }): Promise<OrderDTO> {
    const customer = data.customerName || 'Current User';
    const items = data.items && data.items.length > 0
      ? data.items
      : [{ productId: data.productId!, quantity: 1 }];

    const order = await container.createOrderUseCase.execute({
      customerName: customer,
      items,
      paymentMethod: data.paymentMethod || 'Tarjeta Universitaria',
    });

    // Ensure status is 'PREPARING' as requested by the user
    if (order.status !== 'PREPARING') {
      return await container.updateOrderStatusUseCase.execute(order.id, 'PREPARING');
    }

    return order;
  },

  /**
   * Updates an order's status enforcing domain transition rules.
   */
  async updateOrderStatus(orderId: string, status: OrderStatusType): Promise<OrderDTO> {
    return container.updateOrderStatusUseCase.execute(orderId, status);
  },

  /**
   * Retrieves real-time queue and cafeteria statistics.
   */
  async getQueueStats(): Promise<QueueStatsDTO> {
    return container.getQueueStatsUseCase.execute();
  }
};
