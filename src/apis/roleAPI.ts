import { getToken } from '@/utils/token';
import { createAuthAxiosInstance } from '@/utils/axios';

export interface Role {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  permissions: string | null;
}

export interface RoleListParams {
  page: number;
  size: number;
}

export interface RoleListMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface RoleListResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: {
    meta: RoleListMeta;
    result: Role[];
  };
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  active: boolean;
}

export interface CreateRoleResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: Role;
}

export interface UpdateRolePayload {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface UpdateRoleResponse {
  statusCode: number;
  message: string;
  data: Role;
}

export interface DeleteRoleResponse {
  statusCode: number;
  message: string;
}

export const getRoles = async ({ page, size }: RoleListParams): Promise<RoleListResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.get('/api/v1/roles', {
    params: { page, size },
  });
  return res.data;
};

export const createRole = async (payload: CreateRolePayload): Promise<CreateRoleResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.post('/api/v1/roles', payload);
  return res.data;
};

export const updateRole = async (payload: UpdateRolePayload): Promise<UpdateRoleResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.put('/api/v1/roles', payload);
  return res.data;
};

export const deleteRole = async (id: number): Promise<DeleteRoleResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.delete(`/api/v1/roles/${id}`);
  return res.data;
};