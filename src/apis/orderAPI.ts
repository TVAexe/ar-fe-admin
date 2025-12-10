import { getToken } from '@/utils/token';
import { createAuthAxiosInstance } from '@/utils/axios';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPING = 'SHIPPING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface OrderItem {
  productId: number;
  productName: string;
  productType: string;
  quantity: number;
  priceAtPurchase: number;
  oldPrice: number;
  imageUrl: string;
}

export interface Order {
  orderId: number;
  shippingAddress: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
}

export interface OrderListParams {
  page: number;
  size: number;
}

export interface OrderListMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface OrderListResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: {
    meta: OrderListMeta;
    result: Order[];
  };
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdateOrderStatusResponse {
  statusCode: number;
  message: string;
  data: Order;
}

export const getOrders = async ({ page, size }: OrderListParams): Promise<OrderListResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.get('/api/v1/orders/admin/all-orders', {
    params: { page, size },
  });
  return res.data;
};

export const updateOrderStatus = async (
  orderId: number,
  payload: UpdateOrderStatusPayload
): Promise<UpdateOrderStatusResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.put(`/api/v1/orders/admin/${orderId}/status`, payload);
  return res.data;
};