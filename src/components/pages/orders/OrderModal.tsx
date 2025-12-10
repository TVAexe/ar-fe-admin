'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Image from 'next/image';
import { Order, OrderStatus, updateOrderStatus } from '@/apis/orderAPI';
import { toastError, toastSuccess } from '@/utils/toast';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: OrderStatus }) =>
      updateOrderStatus(orderId, { status }),
    onSuccess: () => {
      toastSuccess('Order status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    },
    onError: (error: Error) => {
      toastError(error.message || 'Failed to update order status');
    },
  });

  const handleUpdateStatus = (newStatus: OrderStatus) => {
    if (!order) return;
    updateStatusMutation.mutate({ orderId: order.orderId, status: newStatus });
  };

  if (!isOpen || !order) return null;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.SHIPPING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.SHIPPED:
        return 'bg-indigo-100 text-indigo-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatuses = (currentStatus: OrderStatus): OrderStatus[] => {
    switch (currentStatus) {
      case OrderStatus.PENDING:
        return [OrderStatus.CONFIRMED, OrderStatus.CANCELLED];
      case OrderStatus.CONFIRMED:
        return [OrderStatus.SHIPPING, OrderStatus.CANCELLED];
      case OrderStatus.SHIPPING:
        return [OrderStatus.SHIPPED, OrderStatus.CANCELLED];
      case OrderStatus.SHIPPED:
        return [OrderStatus.DELIVERED];
      default:
        return [];
    }
  };

  const nextStatuses = getNextStatuses(order.status);

  return (
    <Modal isOpen={isOpen} handleClose={onClose} title={`Order #${order.orderId}`} noFooter>
      <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-1 md:pr-2">
        {/* Order Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Order Information</h3>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-600">Shipping Address:</p>
              <p className="font-medium text-gray-800">{order.shippingAddress}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount:</p>
              <p className="font-bold text-lg text-primary">${order.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-600">Created By:</p>
              <p className="font-medium text-gray-800">{order.createdBy}</p>
            </div>
            <div>
              <p className="text-gray-600">Created At:</p>
              <p className="font-medium text-gray-800">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            {order.updatedAt && (
              <>
                <div>
                  <p className="text-gray-600">Updated By:</p>
                  <p className="font-medium text-gray-800">{order.updatedBy || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Updated At:</p>
                  <p className="font-medium text-gray-800">
                    {new Date(order.updatedAt).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Order Items ({order.items.length})
          </h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 flex-shrink-0">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover rounded"
                    sizes="80px"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 truncate">{item.productName}</h4>
                  <p className="text-sm text-gray-600">{item.productType}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-primary">
                      ${item.priceAtPurchase.toFixed(2)}
                    </span>
                    {item.oldPrice > item.priceAtPurchase && (
                      <span className="text-xs text-gray-500 line-through">
                        ${item.oldPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity & Total */}
                <div className="text-right">
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  <p className="font-bold text-gray-800">
                    ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Update Status Section */}
        {nextStatuses.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-800 mb-3">Update Order Status</h3>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={status === OrderStatus.CANCELLED ? 'warning' : 'contained'}
                  size="small"
                  onClick={() => handleUpdateStatus(status)}
                  disabled={updateStatusMutation.isPending}
                  classes="w-auto px-4"
                >
                  {status === OrderStatus.CANCELLED ? 'Cancel Order' : `Mark as ${status}`}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outlined"
            size="small"
            onClick={onClose}
            disabled={updateStatusMutation.isPending}
            classes="w-auto px-4"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;