import { getToken } from '@/utils/token';
import { createAuthAxiosInstance } from '@/utils/axios';

export interface UserListParams {
  page: number;
  size: number;
}

export interface UserItem {
  id: number;
  email: string;
  name: string;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface UserListMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface UserListResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: {
    meta: UserListMeta;
    result: UserItem[];
  };
}

export const getUsers = async ({ page, size }: UserListParams) => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.get('/api/v1/users', { params: { page, size } });
  return res.data;
};

