import { IOrderRepository } from '../../domain/repositories/IOrderRepository.ts';
import { INotificationService } from '../services/INotificationService.ts';
import { OrderStatusType } from '../../domain/value-objects/OrderStatus.ts';
import { OrderDTO, OrderDTOMapper } from '../dtos/OrderDTO.ts';

export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly notificationService?: INotificationService
  ) {}

  async execute(orderId: string, newStatus: OrderStatusType): Promise<OrderDTO> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error(`Pedido con ID ${orderId} no encontrado.`);
    }

    // Domain business rule validation
    order.transitionTo(newStatus);
    await this.orderRepository.update(order);

    // Notify student / staff
    this.notificationService?.notifyOrderStatusChanged(order);

    return OrderDTOMapper.toDTO(order);
  }
}
