import { container } from '../src/presentation/di/container.ts';
import { ProductDTO } from '../src/core/application/dtos/ProductDTO.ts';

/**
 * Product Service (Clean Architecture Application Service)
 * Acts as the application boundary for product-related operations.
 */
export const productService = {
  /**
   * Retrieves all available products mapped to DTOs.
   */
  async getAllProducts(): Promise<ProductDTO[]> {
    return container.getProductsUseCase.execute();
  },

  /**
   * Retrieves products by category.
   */
  async getProductsByCategory(category: string): Promise<ProductDTO[]> {
    return container.getProductsUseCase.execute(category);
  },

  /**
   * Retrieves a single product by ID.
   */
  async getProductById(id: string): Promise<ProductDTO | null> {
    const product = await container.productRepository.findById(id);
    if (!product) return null;
    const { ProductDTOMapper } = await import('../src/core/application/dtos/ProductDTO.ts');
    return ProductDTOMapper.toDTO(product);
  },

  /**
   * Updates product stock inventory.
   */
  async updateStock(id: string, newStock: number): Promise<ProductDTO> {
    return container.updateStockUseCase.execute(id, newStock);
  }
};
