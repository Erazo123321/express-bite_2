import { useState } from 'react';
import { Header, ActiveTab } from './presentation/components/Header.tsx';
import { StudentView } from './presentation/components/student/StudentView.tsx';
import { StaffView } from './presentation/components/staff/StaffView.tsx';
import { CleanArchitectureExplorer } from './presentation/components/architecture/CleanArchitectureExplorer.tsx';
import { NotificationToast } from './presentation/components/NotificationToast.tsx';
import { useCafeteria } from './presentation/hooks/useCafeteria.ts';
import { ProductDTO } from './core/application/dtos/ProductDTO.ts';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('student');
  const {
    products,
    allOrders,
    currentStudentOrder,
    queueStats,
    notifications,
    auditLogs,
    error,
    placeOrder,
    updateProductStock,
    markOrderAsDelivered,
    toggleStudentOrderStatus,
    resetAllData,
  } = useCafeteria();

  const handleStudentOrder = async (product: ProductDTO) => {
    try {
      await placeOrder(product.id, 1, 'Matías Valenzuela');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSimulateInitialOrder = async () => {
    try {
      const cafe = products.find(p => p.id === 'prod-cafe-artesanal');
      if (cafe) {
        await placeOrder(cafe.id, 1, 'Matías Valenzuela');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1D1D1F]">
      {/* Top Navbar Switcher Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingOrdersCount={queueStats.pendingCount}
      />

      {/* Global Error Banner if any */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-700 flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col justify-start">
        {activeTab === 'student' && (
          <StudentView
            products={products}
            currentOrder={currentStudentOrder}
            queueStats={queueStats}
            onOrderProduct={handleStudentOrder}
            onToggleStatus={toggleStudentOrderStatus}
            onSimulateInitialOrder={handleSimulateInitialOrder}
          />
        )}

        {activeTab === 'admin' && (
          <StaffView
            orders={allOrders}
            products={products}
            queueStats={queueStats}
            onDeliverOrder={markOrderAsDelivered}
            onUpdateStock={updateProductStock}
            onResetMockData={resetAllData}
          />
        )}

        {activeTab === 'architecture' && (
          <CleanArchitectureExplorer auditLogs={auditLogs} />
        )}
      </main>

      {/* In-app Toast Notifications */}
      <NotificationToast notifications={notifications} />
    </div>
  );
}
