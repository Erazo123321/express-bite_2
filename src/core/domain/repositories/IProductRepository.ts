import { Product } from '../entities/Product.ts';

/**
 * Interface Segregation Principle (ISP) & Dependency Inversion Principle (DIP):
 * High-level business use cases depend on this interface, not low-level database details.
 */
export interface IProductRepository {
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  save(product: Product): Promise<void>;
  updateStock(id: string, newStock: number): Promise<Product>;
  decrementStock(id: string, quantity: number): Promise<Product>;
  resetToInitialMock(): Promise<void>;
}
