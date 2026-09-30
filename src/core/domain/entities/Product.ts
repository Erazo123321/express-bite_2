import { Money } from '../value-objects/Money.ts';

export interface ProductProps {
  id: string;
  name: string;
  description: string;
  price: Money;
  stock: number;
  imageUrl: string;
  category: 'coffee' | 'bakery' | 'beverage' | 'sandwich' | 'snack';
  badge?: string;
  badgeType?: 'popular' | 'fresh' | 'natural' | 'gourmet';
  isAvailable?: boolean;
}

/**
 * Domain Entity: Product
 * Represents an item sold in the campus cafeteria.
 * Follows DDD and Clean Architecture principles:
 * - Encapsulates identity and invariants (stock, pricing)
 * - Self-validating
 * - Pure business rules, agnostic of database or frameworks
 */
export class Product {
  private readonly _id: string;
  private _name: string;
  private _description: string;
  private _price: Money;
  private _stock: number;
  private _imageUrl: string;
  private _category: ProductProps['category'];
  private _badge?: string;
  private _badgeType?: ProductProps['badgeType'];
  private _isAvailable: boolean;

  constructor(props: ProductProps) {
    if (!props.id || props.id.trim() === '') {
      throw new Error('Product ID cannot be empty');
    }
    if (!props.name || props.name.trim() === '') {
      throw new Error('Product Name cannot be empty');
    }
    if (props.stock < 0) {
      throw new Error('Product Stock cannot be negative');
    }

    this._id = props.id;
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._stock = props.stock;
    this._imageUrl = props.imageUrl;
    this._category = props.category;
    this._badge = props.badge;
    this._badgeType = props.badgeType;
    this._isAvailable = props.isAvailable ?? props.stock > 0;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): Money {
    return this._price;
  }

  get stock(): number {
    return this._stock;
  }

  get imageUrl(): string {
    return this._imageUrl;
  }

  get category(): ProductProps['category'] {
    return this._category;
  }

  get badge(): string | undefined {
    return this._badge;
  }

  get badgeType(): ProductProps['badgeType'] | undefined {
    return this._badgeType;
  }

  get isAvailable(): boolean {
    return this._isAvailable && this._stock > 0;
  }

  // Domain Business Methods
  hasAvailableStock(requestedQuantity: number): boolean {
    if (requestedQuantity <= 0) return false;
    return this._stock >= requestedQuantity;
  }

  decrementStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Decrement quantity must be greater than zero');
    }
    if (!this.hasAvailableStock(quantity)) {
      throw new Error(`Insufficient stock for "${this._name}". Requested: ${quantity}, available: ${this._stock}`);
    }
    this._stock -= quantity;
    if (this._stock === 0) {
      this._isAvailable = false;
    }
  }

  incrementStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Increment quantity must be greater than zero');
    }
    this._stock += quantity;
    this._isAvailable = true;
  }

  updateStock(newStock: number): void {
    if (newStock < 0) {
      throw new Error('Stock cannot be negative');
    }
    this._stock = newStock;
    this._isAvailable = newStock > 0;
  }

  updateDetails(name: string, description: string, price: Money): void {
    if (!name || name.trim() === '') {
      throw new Error('Product name cannot be empty');
    }
    this._name = name;
    this._description = description;
    this._price = price;
  }

  isOutOfStock(): boolean {
    return this._stock <= 0;
  }

  isLowStock(threshold: number = 5): boolean {
    return this._stock > 0 && this._stock <= threshold;
  }
}
