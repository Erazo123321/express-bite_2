import { IOrderRepository } from '../../domain/repositories/IOrderRepository.ts';

export interface QueueStatsDTO {
  pendingCount: number;
  completedCount: number;
  estimatedWaitMinutes: number;
  isOpen: boolean;
  statusMessage: string;
}

export class GetQueueStatsUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(): Promise<QueueStatsDTO> {
    const pendingCount = await this.orderRepository.countPendingAndPreparing();
    const completedCount = await this.orderRepository.countDeliveredToday();

    // Domain heuristic: 2.5 minutes average wait per pending order
    const estimatedWaitMinutes = Math.max(2, Math.round(pendingCount * 2.5));

    let statusMessage = 'Fila despejada';
    if (pendingCount > 5) {
      statusMessage = 'Alta demanda en barra';
    } else if (pendingCount > 0) {
      statusMessage = `Espera actual: ${pendingCount} pedidos`;
    }

    return {
      pendingCount,
      completedCount,
      estimatedWaitMinutes,
      isOpen: true,
      statusMessage,
    };
  }
}
