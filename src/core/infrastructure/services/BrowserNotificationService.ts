import { INotificationService, AppNotification } from '../../application/services/INotificationService.ts';
import { Order } from '../../domain/entities/Order.ts';
import { Product } from '../../domain/entities/Product.ts';

export class BrowserNotificationService implements INotificationService {
  private listeners: Set<(notification: AppNotification) => void> = new Set();
  private history: AppNotification[] = [];

  notify(notification: Omit<AppNotification, 'id' | 'timestamp'>): void {
    const item: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date(),
      ...notification,
    };

    this.history.unshift(item);
    if (this.history.length > 30) {
      this.history.pop();
    }

    this.listeners.forEach(fn => {
      try {
        fn(item);
      } catch (err) {
        console.error('Error invoking notification listener', err);
      }
    });
  }

  notifyOrderStatusChanged(order: Order): void {
    const isReady = order.status.value === 'READY';
    const isDelivered = order.status.value === 'DELIVERED';

    let title = `Pedido ${order.orderNumber}: ${order.status.label}`;
    let message = `El estado del pedido para ${order.customerName} ahora es "${order.status.label}".`;

    if (isReady) {
      title = `🔔 ¡Tu pedido ${order.orderNumber} está listo!`;
      message = `Pasa a retirarlo por ${order.pickupCounter}.`;
    } else if (isDelivered) {
      title = `✅ Pedido ${order.orderNumber} entregado`;
      message = `Entrega completada exitosamente a ${order.customerName}.`;
    }

    this.notify({
      type: isReady || isDelivered ? 'success' : 'info',
      title,
      message,
    });
  }

  notifyLowStock(product: Product): void {
    this.notify({
      type: 'warning',
      title: 'Alerta de Stock Bajo',
      message: `${product.name} tiene solo ${product.stock} unidades restantes. Considera reabastecer.`,
    });
  }

  subscribe(listener: (notification: AppNotification) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getRecentNotifications(): AppNotification[] {
    return [...this.history];
  }
}
