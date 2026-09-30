import { InMemoryProductRepository } from '../../core/infrastructure/repositories/InMemoryProductRepository.ts';
import { InMemoryOrderRepository } from '../../core/infrastructure/repositories/InMemoryOrderRepository.ts';
import { BrowserNotificationService } from '../../core/infrastructure/services/BrowserNotificationService.ts';

import { GetProductsUseCase } from '../../core/application/use-cases/GetProductsUseCase.ts';
import { UpdateStockUseCase } from '../../core/application/use-cases/UpdateStockUseCase.ts';
import { CreateOrderUseCase } from '../../core/application/use-cases/CreateOrderUseCase.ts';
import { GetOrdersUseCase } from '../../core/application/use-cases/GetOrdersUseCase.ts';
import { UpdateOrderStatusUseCase } from '../../core/application/use-cases/UpdateOrderStatusUseCase.ts';
import { GetQueueStatsUseCase } from '../../core/application/use-cases/GetQueueStatsUseCase.ts';

/**
 * Dependency Injection (DI) & Inversion of Control (IoC) Container
 * Adheres to the Dependency Inversion Principle (DIP):
 * Assembles concrete infrastructure implementations and provides them to the application use cases.
 */
class DIContainer {
  // Infrastructure singletons
  public readonly productRepository: InMemoryProductRepository;
  public readonly orderRepository: InMemoryOrderRepository;
  public readonly notificationService: BrowserNotificationService;

  // Application Use Cases
  public readonly getProductsUseCase: GetProductsUseCase;
  public readonly updateStockUseCase: UpdateStockUseCase;
  public readonly createOrderUseCase: CreateOrderUseCase;
  public readonly getOrdersUseCase: GetOrdersUseCase;
  public readonly updateOrderStatusUseCase: UpdateOrderStatusUseCase;
  public readonly getQueueStatsUseCase: GetQueueStatsUseCase;

  constructor() {
    // 1. Instantiate Infrastructure Repositories & Services
    this.productRepository = new InMemoryProductRepository();
    this.orderRepository = new InMemoryOrderRepository();
    this.notificationService = new BrowserNotificationService();

    // 2. Inject dependencies into Use Cases
    this.getProductsUseCase = new GetProductsUseCase(this.productRepository);
    this.updateStockUseCase = new UpdateStockUseCase(this.productRepository, this.notificationService);
    this.createOrderUseCase = new CreateOrderUseCase(
      this.productRepository,
      this.orderRepository,
      this.notificationService
    );
    this.getOrdersUseCase = new GetOrdersUseCase(this.orderRepository);
    this.updateOrderStatusUseCase = new UpdateOrderStatusUseCase(
      this.orderRepository,
      this.notificationService
    );
    this.getQueueStatsUseCase = new GetQueueStatsUseCase(this.orderRepository);
  }

  async resetData(): Promise<void> {
    await this.productRepository.resetToInitialMock();
    await this.orderRepository.resetToInitialMock();
    this.notificationService.notify({
      type: 'info',
      title: 'Datos Restablecidos',
      message: 'El inventario y pedidos han vuelto al estado inicial de demostración.',
    });
  }
}

// Global Singleton Export
export const container = new DIContainer();
