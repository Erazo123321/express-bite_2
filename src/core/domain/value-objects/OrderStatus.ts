/**
 * Value Object / Enum: OrderStatus
 * Represents the lifecycle stages of a cafeteria order.
 */
export type OrderStatusType = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export class OrderStatus {
  public static readonly PENDING: OrderStatusType = 'PENDING';
  public static readonly PREPARING: OrderStatusType = 'PREPARING';
  public static readonly READY: OrderStatusType = 'READY';
  public static readonly DELIVERED: OrderStatusType = 'DELIVERED';
  public static readonly CANCELLED: OrderStatusType = 'CANCELLED';

  private readonly _value: OrderStatusType;

  constructor(value: OrderStatusType) {
    this._value = value;
  }

  get value(): OrderStatusType {
    return this._value;
  }

  get label(): string {
    switch (this._value) {
      case 'PENDING':
        return 'En Cola';
      case 'PREPARING':
        return 'Preparando';
      case 'READY':
        return '¡Listo para recoger!';
      case 'DELIVERED':
        return 'Entregado';
      case 'CANCELLED':
        return 'Cancelado';
    }
  }

  canTransitionTo(next: OrderStatusType): boolean {
    const transitions: Record<OrderStatusType, OrderStatusType[]> = {
      PENDING: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['DELIVERED', 'CANCELLED'],
      DELIVERED: [],
      CANCELLED: [],
    };

    return transitions[this._value]?.includes(next) ?? false;
  }

  isTerminal(): boolean {
    return this._value === 'DELIVERED' || this._value === 'CANCELLED';
  }

  isActive(): boolean {
    return !this.isTerminal();
  }

  static fromString(status: string): OrderStatus {
    const normalized = status.toUpperCase() as OrderStatusType;
    if (['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].includes(normalized)) {
      return new OrderStatus(normalized);
    }
    throw new Error(`Invalid order status: ${status}`);
  }
}
