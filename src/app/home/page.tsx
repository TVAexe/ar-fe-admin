'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Loading from '@/components/common/Loading';
import Button from '@/components/common/Button';
import { getToken } from '@/utils';
import ROUTES from '@/config/route';
import { getOrders, OrderStatus } from '@/apis/orderAPI';

const DashboardPage = () => {
  const router = useRouter();
  const token = getToken();

  // Fetch orders data for statistics
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders-stats'],
    queryFn: () => getOrders({ page: 0, size: 100 }), // Get larger sample for stats
    enabled: !!token,
  });

  if (!token) {
    router.replace(ROUTES.LOGIN);
    return <Loading />;
  }

  if (ordersLoading) {
    return <Loading />;
  }

  const orders = ordersData?.data?.result ?? [];
  const totalOrders = ordersData?.data?.meta?.total ?? 0;
  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const confirmedCount = orders.filter(o => o.status === OrderStatus.CONFIRMED).length;
  const inTransitCount = orders.filter(o => [OrderStatus.SHIPPING, OrderStatus.SHIPPED].includes(o.status)).length;
  const deliveredCount = orders.filter(o => o.status === OrderStatus.DELIVERED).length;

  const statsCards = [
    {
      title: 'Pending Orders',
      value: pendingCount.toString(),
      subtitle: `${totalOrders} total orders`,
      changeType: 'neutral' as const,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      icon: (
        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Confirmed',
      value: confirmedCount.toString(),
      subtitle: 'Ready to ship',
      changeType: 'positive' as const,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'In Transit',
      value: inTransitCount.toString(),
      subtitle: 'Shipping + Shipped',
      changeType: 'neutral' as const,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-400',
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Delivered',
      value: deliveredCount.toString(),
      subtitle: 'Completed orders',
      changeType: 'positive' as const,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-grey-800 mb-2">Welcome to AR Admin Dashboard</h1>
          <p className="text-grey-600">Manage your AR application from this central hub</p>
        </div>

        {/* Order Statistics */}
        <div>
          <h2 className="text-lg font-bold text-grey-800 mb-4">Order Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((card, index) => (
              <div 
                key={index} 
                className={`${card.bgColor} rounded-lg shadow-sm p-4 border-l-4 ${card.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-grey-600">{card.title}</p>
                    <p className="text-2xl font-bold text-grey-900 mt-1">{card.value}</p>
                    {card.subtitle && (
                      <p className="text-xs text-grey-500 mt-1">{card.subtitle}</p>
                    )}
                  </div>
                  <div className="shrink-0 ml-4">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-grey-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="contained"
              size="normal"
              onClick={() => router.push(ROUTES.ORDERS)}
              classes="w-full"
            >
              View All Orders
            </Button>
            <Button
              variant="outlined"
              size="normal"
              onClick={() => router.push(ROUTES.PRODUCTS)}
              classes="w-full"
            >
              Manage Products
            </Button>
            <Button
              variant="outlined"
              size="normal"
              onClick={() => router.push(ROUTES.USERS)}
              classes="w-full"
            >
              Manage Users
            </Button>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-grey-800 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {[
              { action: 'New order #12345 received', time: '5 minutes ago', type: 'order' },
              { action: 'Product "AR Glasses Model X" updated', time: '1 hour ago', type: 'product' },
              { action: 'User "john@example.com" registered', time: '2 hours ago', type: 'user' },
              { action: 'Order #12344 shipped', time: '3 hours ago', type: 'order' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 py-2 border-b border-grey-100 last:border-0">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'order' ? 'bg-blue-500' :
                  activity.type === 'product' ? 'bg-green-500' : 'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-grey-800">{activity.action}</p>
                  <p className="text-xs text-grey-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;