'use client';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Loading from '@/components/common/Loading';
import DisplayOrders from '@/components/pages/orders/DisplayOrders';
import OrderDetailsModal from '@/components/pages/orders/OrderModal';
import { getOrders, Order } from '@/apis/orderAPI';

const OrdersPage = () => {
  const [page, setPage] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const size = 10;

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['orders', page, size] as const,
    queryFn: () => getOrders({ page, size }),
    placeholderData: keepPreviousData,
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrder(null);
  };

  if (isLoading) return <Loading />;

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-grey-900 mb-1">Failed to load orders</h3>
            <p className="text-sm text-grey-600">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const orders = data?.data?.result ?? [];
  const meta = data?.data?.meta;
  const totalPages = meta?.pages ?? 1;
  const total = meta?.total ?? 0;

  return (
    <DashboardLayout>
      <DisplayOrders
        orders={orders}
        page={page}
        totalPages={totalPages}
        total={total}
        isFetching={isFetching}
        onPageChange={setPage}
        onViewDetails={handleViewDetails}
      />

      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </DashboardLayout>
  );
};

export default OrdersPage;

