import { IOrderRepository } from '../../domain/repositories/IOrderRepository.ts';
import { Order, OrderItem } from '../../domain/entities/Order.ts';
import { Money } from '../../domain/value-objects/Money.ts';
import { OrderStatusType } from '../../domain/value-objects/OrderStatus.ts';
import { createInitialOrders } from '../mocks/mockOrders.ts';

const STORAGE_KEY = 'expressbite_orders_v1';
const DELIVERED_COUNT_KEY = 'expressbite_delivered_count_v1';

export class InMemoryOrderRepository implements IOrderRepository {
  private orders: Map<string, Order> = new Map();
  private baseDeliveredCount: number = 42; // Initial seed from user's mockup

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window !== 'undefined') {
      const storedCount = localStorage.getItem(DELIVERED_COUNT_KEY);
      if (storedCount) {
        this.baseDeliveredCount = parseInt(storedCount, 10) || 42;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.orders.clear();
            for (const item of parsed) {
              const orderItems = item.items.map(
                (it: any) => new OrderItem(it.productId, it.productName, Money.fromNumber(it.unitPrice), it.quantity)
              );
              this.orders.set(
                item.id,
                new Order({
                  id: item.id,
                  orderNumber: item.orderNumber,
                  customerName: item.customerName,
                  items: orderItems,
                  status: item.status as OrderStatusType,
                  createdAt: new Date(item.createdAt),
                  estimatedMinutes: item.estimatedMinutes,
                  paymentMethod: item.paymentMethod,
                  pickupCounter: item.pickupCounter,
                })
              );
            }
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached orders, restoring initial mock', e);
        }
      }
    }

    const initial = createInitialOrders();
    this.orders.clear();
    for (const o of initial) {
      this.orders.set(o.id, o);
    }
    this.persist();
  }

  private persist(): void {
    if (typeof window !== 'undefined') {
      const serialized = Array.from(this.orders.values()).map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        items: o.items.map(it => ({
          productId: it.productId,
          productName: it.productName,
          unitPrice: it.unitPrice.amount,
          quantity: it.quantity,
        })),
        status: o.status.value,
        createdAt: o.createdAt.toISOString(),
        estimatedMinutes: o.estimatedMinutes,
        paymentMethod: o.paymentMethod,
        pickupCounter: o.pickupCounter,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
      localStorage.setItem(DELIVERED_COUNT_KEY, this.baseDeliveredCount.toString());
    }
  }

  async findAll(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.get(id) ?? null;
  }

  async findActiveOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(o => o.status.isActive())
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async findByCustomer(customerName: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      o => o.customerName.toLowerCase() === customerName.toLowerCase()
    );
  }

  async getLatestOrderForCustomer(customerName: string): Promise<Order | null> {
    const list = await this.findByCustomer(customerName);
    if (list.length === 0) return null;
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
  }

  async save(order: Order): Promise<void> {
    this.orders.set(order.id, order);
    this.persist();
  }

  async update(order: Order): Promise<void> {
    this.orders.set(order.id, order);
    if (order.status.value === 'DELIVERED') {
      this.baseDeliveredCount += 1;
    }
    this.persist();
  }

  async countPendingAndPreparing(): Promise<number> {
    return Array.from(this.orders.values()).filter(
      o => o.status.value === 'PENDING' || o.status.value === 'PREPARING'
    ).length;
  }

  async countDeliveredToday(): Promise<number> {
    return this.baseDeliveredCount;
  }

  async resetToInitialMock(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(DELIVERED_COUNT_KEY);
    }
    this.baseDeliveredCount = 42;
    this.initialize();
  }
}
