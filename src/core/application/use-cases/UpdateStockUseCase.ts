import { IProductRepository } from '../../domain/repositories/IProductRepository.ts';
import { INotificationService } from '../services/INotificationService.ts';
import { ProductDTO, ProductDTOMapper } from '../dtos/ProductDTO.ts';

/**
 * Use Case: UpdateStockUseCase (SRP)
 * Updates product stock inventory, validates boundaries, and notifies on low/out-of-stock.
 */
export class UpdateStockUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly notificationService?: INotificationService
  ) {}

  async execute(productId: string, newStock: number): Promise<ProductDTO> {
    if (newStock < 0) {
      throw new Error('El stock no puede ser un número negativo.');
    }

    const updatedProduct = await this.productRepository.updateStock(productId, newStock);

    if (updatedProduct.isOutOfStock()) {
      this.notificationService?.notify({
        type: 'warning',
        title: 'Producto Agotado',
        message: `${updatedProduct.name} se ha quedado sin existencias.`,
      });
    } else if (updatedProduct.isLowStock(5)) {
      this.notificationService?.notifyLowStock(updatedProduct);
    }

    return ProductDTOMapper.toDTO(updatedProduct);
  }
}
