import { useState, useEffect, useCallback } from 'react';
import { container } from '../di/container.ts';
import { ProductDTO } from '../../core/application/dtos/ProductDTO.ts';
import { OrderDTO } from '../../core/application/dtos/OrderDTO.ts';
import { QueueStatsDTO } from '../../core/application/use-cases/GetQueueStatsUseCase.ts';
import { AppNotification } from '../../core/application/services/INotificationService.ts';

export interface AuditActionLog {
  id: string;
  useCaseName: string;
  layer: 'Application' | 'Domain' | 'Infrastructure';
  timestamp: Date;
  summary: string;
}

export function useCafeteria() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [activeOrders, setActiveOrders] = useState<OrderDTO[]>([]);
  const [allOrders, setAllOrders] = useState<OrderDTO[]>([]);
  const [currentStudentOrder, setCurrentStudentOrder] = useState<OrderDTO | null>(null);
  const [queueStats, setQueueStats] = useState<QueueStatsDTO>({
    pendingCount: 3,
    completedCount: 42,
    estimatedWaitMinutes: 4,
    isOpen: true,
    statusMessage: 'Espera actual: 3 pedidos',
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditActionLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const addAuditLog = useCallback((useCaseName: string, summary: string, layer: AuditActionLog['layer'] = 'Application') => {
    setAuditLogs(prev => [
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        useCaseName,
        layer,
        timestamp: new Date(),
        summary,
      },
      ...prev.slice(0, 19),
    ]);
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [prods, activeOrds, allOrds, stats, studentLatest] = await Promise.all([
        container.getProductsUseCase.execute(),
        container.getOrdersUseCase.getActiveOrders(),
        container.getOrdersUseCase.getAllOrders(),
        container.getQueueStatsUseCase.execute(),
        container.getOrdersUseCase.getCustomerLatestOrder('Matías Valenzuela'),
      ]);

      setProducts(prods);
      setActiveOrders(activeOrds);
      setAllOrders(allOrds);
      setQueueStats(stats);
      setCurrentStudentOrder(studentLatest);
    } catch (err: any) {
      console.error('Error fetching cafeteria data', err);
      setError(err?.message || 'Error al cargar los datos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();

    // Subscribe to notifications
    const unsubscribe = container.notificationService.subscribe(notif => {
      setNotifications(prev => [notif, ...prev.slice(0, 9)]);
    });

    return () => {
      unsubscribe();
    };
  }, [refreshData]);

  // Actions adhering to Clean Architecture
  const placeOrder = async (productId: string, quantity: number = 1, customerName: string = 'Matías Valenzuela') => {
    try {
      setError(null);
      const newOrder = await container.createOrderUseCase.execute({
        customerName,
        items: [{ productId, quantity }],
        paymentMethod: 'Tarjeta Universitaria',
      });

      addAuditLog(
        'CreateOrderUseCase',
        `Orden ${newOrder.orderNumber} creada para ${customerName} con subtotal ${newOrder.formattedTotal}. Stock descontado.`
      );

      await refreshData();
      return newOrder;
    } catch (err: any) {
      setError(err?.message || 'No se pudo realizar el pedido.');
      throw err;
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    try {
      setError(null);
      const updated = await container.updateStockUseCase.execute(productId, newStock);
      addAuditLog(
        'UpdateStockUseCase',
        `Stock de "${updated.name}" actualizado a ${updated.stock} unidades.`
      );
      await refreshData();
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el stock.');
      throw err;
    }
  };

  const markOrderAsDelivered = async (orderId: string) => {
    try {
      setError(null);
      const updated = await container.updateOrderStatusUseCase.execute(orderId, 'DELIVERED');
      addAuditLog(
        'UpdateOrderStatusUseCase',
        `Orden ${updated.orderNumber} para ${updated.customerName} marcada como ENTREGADA.`
      );
      await refreshData();
      return updated;
    } catch (err: any) {
      setError(err?.message || 'Error al cambiar estado.');
      throw err;
    }
  };

  const toggleStudentOrderStatus = async () => {
    if (!currentStudentOrder) return;
    try {
      setError(null);
      const nextStatus = currentStudentOrder.status === 'PREPARING' ? 'READY' : 'PREPARING';
      const updated = await container.updateOrderStatusUseCase.execute(currentStudentOrder.id, nextStatus);
      addAuditLog(
        'UpdateOrderStatusUseCase (Simulación)',
        `Estado de pedido ${updated.orderNumber} cambiado a: ${updated.statusLabel}`
      );
      await refreshData();
    } catch (err: any) {
      setError(err?.message || 'Error en simulación');
    }
  };

  const resetAllData = async () => {
    await container.resetData();
    addAuditLog('SystemReset', 'Restablecimiento de datos mock iniciales completado.');
    await refreshData();
  };

  return {
    products,
    activeOrders,
    allOrders,
    currentStudentOrder,
    queueStats,
    notifications,
    auditLogs,
    isLoading,
    error,
    refreshData,
    placeOrder,
    updateProductStock,
    markOrderAsDelivered,
    toggleStudentOrderStatus,
    resetAllData,
  };
}
