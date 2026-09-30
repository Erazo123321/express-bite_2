import { Money } from '../value-objects/Money.ts';
import { OrderStatus, OrderStatusType } from '../value-objects/OrderStatus.ts';
import { Product } from './Product.ts';

/**
 * Value Object: OrderItem
 * Immutably links a product snapshot to a quantity and calculates subtotal.
 */
export class OrderItem {
  private readonly _productId: string;
  private readonly _productName: string;
  private readonly _unitPrice: Money;
  private readonly _quantity: number;

  constructor(productId: string, productName: string, unitPrice: Money, quantity: number) {
    if (quantity <= 0) {
      throw new Error('OrderItem quantity must be at least 1');
    }
    this._productId = productId;
    this._productName = productName;
    this._unitPrice = unitPrice;
    this._quantity = Math.floor(quantity);
  }

  get productId(): string {
    return this._productId;
  }

  get productName(): string {
    return this._productName;
  }

  get unitPrice(): Money {
    return this._unitPrice;
  }

  get quantity(): number {
    return this._quantity;
  }

  getSubtotal(): Money {
    return this._unitPrice.multiply(this._quantity);
  }

  static fromProduct(product: Product, quantity: number): OrderItem {
    return new OrderItem(product.id, product.name, product.price, quantity);
  }
}

export interface OrderProps {
  id: string;
  orderNumber: string; // e.g. '#EB-108'
  customerName: string; // e.g. 'Matías Valenzuela'
  items: OrderItem[];
  status?: OrderStatusType;
  createdAt?: Date;
  estimatedMinutes?: number;
  paymentMethod?: string;
  pickupCounter?: string; // e.g. 'Barra 1'
}

/**
 * Domain Entity: Order
 * Represents a customer order in the cafeteria.
 * Implements rich business rules:
 * - State transition enforcement (PENDING -> PREPARING -> READY -> DELIVERED)
 * - Automatic monetary calculation
 * - Estimation logic based on item complexity
 */
export class Order {
  private readonly _id: string;
  private readonly _orderNumber: string;
  private readonly _customerName: string;
  private readonly _items: OrderItem[];
  private _status: OrderStatus;
  private readonly _createdAt: Date;
  private _estimatedMinutes: number;
  private readonly _paymentMethod: string;
  private readonly _pickupCounter: string;

  constructor(props: OrderProps) {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Order ID cannot be empty');
    }
    if (!props.orderNumber || props.orderNumber.trim() === '') {
      throw new Error('Order Number cannot be empty');
    }
    if (!props.customerName || props.customerName.trim() === '') {
      throw new Error('Customer Name cannot be empty');
    }
    if (!props.items || props.items.length === 0) {
      throw new Error('An order must contain at least one item');
    }

    this._id = props.id;
    this._orderNumber = props.orderNumber;
    this._customerName = props.customerName;
    this._items = [...props.items];
    this._status = new OrderStatus(props.status ?? OrderStatus.PENDING);
    this._createdAt = props.createdAt ?? new Date();
    this._estimatedMinutes = props.estimatedMinutes ?? this.calculateEstimatedMinutes();
    this._paymentMethod = props.paymentMethod ?? 'Tarjeta Universitaria';
    this._pickupCounter = props.pickupCounter ?? 'Barra 1';
  }

  get id(): string {
    return this._id;
  }

  get orderNumber(): string {
    return this._orderNumber;
  }

  get customerName(): string {
    return this._customerName;
  }

  get items(): readonly OrderItem[] {
    return this._items;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get estimatedMinutes(): number {
    return this._estimatedMinutes;
  }

  get paymentMethod(): string {
    return this._paymentMethod;
  }

  get pickupCounter(): string {
    return this._pickupCounter;
  }

  // Domain Calculations
  calculateTotal(): Money {
    return this._items.reduce((total, item) => total.add(item.getSubtotal()), Money.zero());
  }

  getItemsSummary(): string {
    return this._items
      .map(item => `${item.quantity}x ${item.productName}`)
      .join(', ');
  }

  // State Transition Business Rules
  transitionTo(nextStatus: OrderStatusType): void {
    if (!this._status.canTransitionTo(nextStatus)) {
      throw new Error(
        `Invalid status transition: Cannot change order ${this._orderNumber} from ${this._status.value} to ${nextStatus}`
      );
    }
    this._status = new OrderStatus(nextStatus);

    if (nextStatus === OrderStatus.READY) {
      this._estimatedMinutes = 0;
    }
  }

  markAsPreparing(estimatedMinutes?: number): void {
    this.transitionTo(OrderStatus.PREPARING);
    if (estimatedMinutes !== undefined) {
      this._estimatedMinutes = Math.max(1, estimatedMinutes);
    }
  }

  markAsReady(): void {
    this.transitionTo(OrderStatus.READY);
  }

  markAsDelivered(): void {
    this.transitionTo(OrderStatus.DELIVERED);
  }

  cancel(): void {
    this.transitionTo(OrderStatus.CANCELLED);
  }

  private calculateEstimatedMinutes(): number {
    // Basic domain heuristic: 1 min base + 1 min per 2 items
    const totalItems = this._items.reduce((sum, item) => sum + item.quantity, 0);
    return Math.max(2, Math.min(8, Math.ceil(totalItems * 1.5)));
  }
}
