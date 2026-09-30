import { IOrderRepository } from '../../domain/repositories/IOrderRepository.ts';
import { OrderDTO, OrderDTOMapper } from '../dtos/OrderDTO.ts';

export class GetOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async getActiveOrders(): Promise<OrderDTO[]> {
    const orders = await this.orderRepository.findActiveOrders();
    return orders.map(order => OrderDTOMapper.toDTO(order));
  }

  async getAllOrders(): Promise<OrderDTO[]> {
    const orders = await this.orderRepository.findAll();
    return orders.map(order => OrderDTOMapper.toDTO(order));
  }

  async getCustomerLatestOrder(customerName: string): Promise<OrderDTO | null> {
    const order = await this.orderRepository.getLatestOrderForCustomer(customerName);
    return order ? OrderDTOMapper.toDTO(order) : null;
  }
}
