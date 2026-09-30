import { Order } from '../../domain/entities/Order.ts';
import { Product } from '../../domain/entities/Product.ts';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
}

export interface INotificationService {
  notify(notification: Omit<AppNotification, 'id' | 'timestamp'>): void;
  notifyOrderStatusChanged(order: Order): void;
  notifyLowStock(product: Product): void;
  subscribe(listener: (notification: AppNotification) => void): () => void;
  getRecentNotifications(): AppNotification[];
}
