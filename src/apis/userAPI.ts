import { getToken } from '@/utils/token';
import { createAuthAxiosInstance } from '@/utils/axios';

export interface UserListParams {
  page: number;
  size: number;
}

export interface Role {
  id: number;
  name: string; // Changed from optional to required
  description?: string | null;
  active?: boolean;
}

export interface UserItem {
  id: number;
  email: string;
  name: string;
  phoneNumber: string | null;
  age: number | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  address: string | null;
  role: Role; // Now includes full role object with name
  createdAt: string;
  updatedAt: string | null;
}

export interface UserListMeta {
  page: number;
  pageSize: number;
  pages: number;
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

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  role: {
    id: number;
  };
}

export interface CreateUserResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: UserItem;
}

export interface UpdateUserPayload {
  id: number;
  name: string;
  email: string;
  password?: string;
  phoneNumber: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  role: {
    id: number;
  };
}

export interface UpdateUserResponse {
  statusCode: number;
  message: string;
  data: UserItem;
}

export interface DeleteUserResponse {
  statusCode: number;
  message: string;
}

export const getUsers = async ({ page, size }: UserListParams): Promise<UserListResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.get('/api/v1/users', { params: { page, size } });
  return res.data;
};

export const createUser = async (payload: CreateUserPayload): Promise<CreateUserResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.post('/api/v1/users', payload);
  return res.data;
};

export const updateUser = async (payload: UpdateUserPayload): Promise<UpdateUserResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.put('/api/v1/users', payload);
  return res.data;
};

export const deleteUser = async (id: number): Promise<DeleteUserResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.delete(`/api/v1/users/${id}`);
  return res.data;
};