import { Order } from '../entities/Order.ts';

export interface IOrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findActiveOrders(): Promise<Order[]>;
  findByCustomer(customerName: string): Promise<Order[]>;
  getLatestOrderForCustomer(customerName: string): Promise<Order | null>;
  save(order: Order): Promise<void>;
  update(order: Order): Promise<void>;
  countPendingAndPreparing(): Promise<number>;
  countDeliveredToday(): Promise<number>;
  resetToInitialMock(): Promise<void>;
}
