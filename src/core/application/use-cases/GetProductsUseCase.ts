import { IProductRepository } from '../../domain/repositories/IProductRepository.ts';
import { ProductDTO, ProductDTOMapper } from '../dtos/ProductDTO.ts';

/**
 * Use Case: GetProductsUseCase (SRP)
 * Retrieves cafeteria products, optionally filtered by category.
 */
export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(category?: string): Promise<ProductDTO[]> {
    const products = category
      ? await this.productRepository.findByCategory(category)
      : await this.productRepository.findAll();

    return products.map(product => ProductDTOMapper.toDTO(product));
  }
}
