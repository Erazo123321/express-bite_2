import { Order, OrderItem } from '../../domain/entities/Order.ts';
import { Money } from '../../domain/value-objects/Money.ts';

export function createInitialOrders(): Order[] {
  const now = Date.now();

  // Order 1: Matías Valenzuela (#EB-108) - 1x Café Artesanal + 1x Empanada Rellena (Preparando)
  const order1 = new Order({
    id: 'ord-eb-108',
    orderNumber: '#EB-108',
    customerName: 'Matías Valenzuela',
    items: [
      new OrderItem('prod-cafe-artesanal', 'Café Artesanal', Money.fromNumber(2400), 1),
      new OrderItem('prod-empanada-rellena', 'Empanada Rellena', Money.fromNumber(2800), 1),
    ],
    status: 'PREPARING',
    createdAt: new Date(now - 2 * 60 * 1000), // 2 minutes ago
    estimatedMinutes: 2,
    paymentMethod: 'Tarjeta Universitaria',
    pickupCounter: 'Barra 1',
  });

  // Order 2: Camila Soto (#EB-109) - 1x Sándwich Gourmet, 1x Jugo Natural
  const order2 = new Order({
    id: 'ord-eb-109',
    orderNumber: '#EB-109',
    customerName: 'Camila Soto',
    items: [
      new OrderItem('prod-sandwich-gourmet', 'Sándwich Gourmet', Money.fromNumber(3900), 1),
      new OrderItem('prod-jugo-natural', 'Jugo Natural', Money.fromNumber(2100), 1),
    ],
    status: 'PENDING',
    createdAt: new Date(now - 4 * 60 * 1000), // 4 minutes ago
    estimatedMinutes: 5,
    paymentMethod: 'Código QR',
    pickupCounter: 'Barra 2',
  });

  // Order 3: Ignacio Morales (#EB-110) - 2x Café Artesanal
  const order3 = new Order({
    id: 'ord-eb-110',
    orderNumber: '#EB-110',
    customerName: 'Ignacio Morales',
    items: [
      new OrderItem('prod-cafe-artesanal', 'Café Artesanal', Money.fromNumber(2400), 2),
    ],
    status: 'PENDING',
    createdAt: new Date(now - 7 * 60 * 1000), // 7 minutes ago
    estimatedMinutes: 6,
    paymentMethod: 'Efectivo en Caja',
    pickupCounter: 'Barra 1',
  });

  return [order1, order2, order3];
}
