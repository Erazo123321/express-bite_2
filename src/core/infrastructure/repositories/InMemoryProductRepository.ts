import { IProductRepository } from '../../domain/repositories/IProductRepository.ts';
import { Product } from '../../domain/entities/Product.ts';
import { Money } from '../../domain/value-objects/Money.ts';
import { createInitialProducts } from '../mocks/mockProducts.ts';

const STORAGE_KEY = 'expressbite_products_v1';

export class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.products.clear();
            for (const item of parsed) {
              this.products.set(
                item.id,
                new Product({
                  id: item.id,
                  name: item.name,
                  description: item.description,
                  price: Money.fromNumber(item.price),
                  stock: item.stock,
                  imageUrl: item.imageUrl,
                  category: item.category,
                  badge: item.badge,
                  badgeType: item.badgeType,
                  isAvailable: item.isAvailable,
                })
              );
            }
            return;
          }
        } catch (e) {
          console.error('Failed to parse cached products, falling back to mock seeds', e);
        }
      }
    }

    // Default initialization
    const initialList = createInitialProducts();
    this.products.clear();
    for (const p of initialList) {
      this.products.set(p.id, p);
    }
    this.persist();
  }

  private persist(): void {
    if (typeof window !== 'undefined') {
      const serialized = Array.from(this.products.values()).map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price.amount,
        stock: p.stock,
        imageUrl: p.imageUrl,
        category: p.category,
        badge: p.badge,
        badgeType: p.badgeType,
        isAvailable: p.isAvailable,
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    }
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) ?? null;
  }

  async findByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.category === category);
  }

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
    this.persist();
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error(`Producto ${id} no encontrado en el inventario.`);
    }

    product.updateStock(newStock);
    this.persist();
    return product;
  }

  async decrementStock(id: string, quantity: number): Promise<Product> {
    const product = this.products.get(id);
    if (!product) {
      throw new Error(`Producto ${id} no encontrado en el inventario.`);
    }

    product.decrementStock(quantity);
    this.persist();
    return product;
  }

  async resetToInitialMock(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.initialize();
  }
}
