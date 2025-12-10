'use client';

import Button from '@/components/common/Button';
import Table, { Column } from '@/components/common/Table';
import { Order, OrderStatus } from '@/apis/orderAPI';

interface DisplayOrdersProps {
  orders: Order[];
  page: number;
  totalPages: number;
  total: number;
  isFetching: boolean;
  onPageChange: (newPage: number) => void;
  onViewDetails: (order: Order) => void;
}

const DisplayOrders: React.FC<DisplayOrdersProps> = ({
  orders,
  page,
  totalPages,
  total,
  isFetching,
  onPageChange,
  onViewDetails,
}) => {
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

  const columns: Column<Order>[] = [
    {
      header: 'Order ID',
      accessor: 'orderId',
      className: 'text-grey-800 font-semibold',
    },
    {
      header: 'Customer',
      accessor: 'createdBy',
      className: 'text-grey-700',
    },
    {
      header: 'Items',
      accessor: (row) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold">
            {row.items.length}
          </span>
        </div>
      ),
      className: 'text-center',
    },
    {
      header: 'Total Amount',
      accessor: (row) => (
        <span className="font-bold text-primary">${row.totalAmount.toFixed(2)}</span>
      ),
      className: 'text-grey-800',
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
          {row.status}
        </span>
      ),
      className: 'text-center',
    },
    {
      header: 'Shipping Address',
      accessor: 'shippingAddress',
      cell: (value) => (
        <span className="text-sm text-grey-600 line-clamp-2" title={value}>
          {value}
        </span>
      ),
      className: 'text-grey-700',
    },
    {
      header: 'Created At',
      accessor: 'createdAt',
      cell: (value) => new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      className: 'text-grey-600 text-sm',
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center justify-center">
          <Button
            variant="outlined"
            size="small"
            onClick={() => onViewDetails(row)}
            classes="w-auto px-3"
          >
            View Details
          </Button>
        </div>
      ),
      className: 'text-center',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-grey-900">Orders Management</h1>
          <div className="text-sm text-grey-600 mt-1">
            Page {page + 1} of {totalPages} · Total {total} orders
          </div>
        </div>

        {/* Status Legend */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
            <span className="text-xs text-grey-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-400"></span>
            <span className="text-xs text-grey-600">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-purple-400"></span>
            <span className="text-xs text-grey-600">Shipping</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-400"></span>
            <span className="text-xs text-grey-600">Delivered</span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <Table
        columns={columns}
        data={orders}
        rowKey="orderId"
        emptyMessage="No orders found."
        pagination={{
          currentPage: page,
          totalPages,
          onPageChange,
          isLoading: isFetching,
        }}
      />
    </div>
  );
};

export default DisplayOrders;