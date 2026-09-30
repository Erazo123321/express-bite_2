import { IProductRepository } from '../../domain/repositories/IProductRepository.ts';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository.ts';
import { INotificationService } from '../services/INotificationService.ts';
import { Order, OrderItem } from '../../domain/entities/Order.ts';
import { CreateOrderDTO } from '../dtos/CreateOrderDTO.ts';
import { OrderDTO, OrderDTOMapper } from '../dtos/OrderDTO.ts';

/**
 * Use Case: CreateOrderUseCase
 * Orchestrates multi-entity transactional logic:
 * 1. Verifies stock availability for each item.
 * 2. Creates the Order entity.
 * 3. Decrements stock for each Product entity.
 * 4. Saves the Order in repository.
 * 5. Dispatches notifications.
 */
export class CreateOrderUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly notificationService?: INotificationService
  ) {}

  async execute(dto: CreateOrderDTO): Promise<OrderDTO> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('El pedido debe tener al menos un producto.');
    }

    const orderItems: OrderItem[] = [];

    // Step 1: Validate stock for all products
    for (const itemDto of dto.items) {
      const product = await this.productRepository.findById(itemDto.productId);
      if (!product) {
        throw new Error(`Producto con ID ${itemDto.productId} no encontrado.`);
      }

      if (!product.hasAvailableStock(itemDto.quantity)) {
        throw new Error(
          `Stock insuficiente para ${product.name}. Solicitado: ${itemDto.quantity}, disponible: ${product.stock}`
        );
      }

      orderItems.push(OrderItem.fromProduct(product, itemDto.quantity));
    }

    // Step 2: Generate order number and ID
    const nextNumber = Math.floor(100 + Math.random() * 900);
    const orderNumber = `#EB-${nextNumber}`;
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Step 3: Instantiate domain entity
    const newOrder = new Order({
      id: orderId,
      orderNumber,
      customerName: dto.customerName || 'Estudiante',
      items: orderItems,
      status: 'PENDING',
      createdAt: new Date(),
      paymentMethod: dto.paymentMethod ?? 'Tarjeta Universitaria',
    });

    // Step 4: Decrement stock for all items
    for (const item of orderItems) {
      await this.productRepository.decrementStock(item.productId, item.quantity);
    }

    // Step 5: Save order
    await this.orderRepository.save(newOrder);

    // Step 6: Dispatch notification
    this.notificationService?.notify({
      type: 'info',
      title: 'Nuevo Pedido Ingresado',
      message: `Pedido ${orderNumber} para ${newOrder.customerName} recibido en cocina.`,
    });

    return OrderDTOMapper.toDTO(newOrder);
  }
}
