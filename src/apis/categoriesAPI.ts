import { getToken } from '@/utils/token';
import { createAuthAxiosInstance } from '@/utils/axios';

export interface Category {
  id: number;
  name: string;
}

export interface CategoriesResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: Category[];
}

export interface CreateCategoryPayload {
  name: string;
}

export interface CreateCategoryResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: Category;
}

export const getCategories = async (): Promise<CategoriesResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.get('/api/v1/categories');
  return res.data;
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<CreateCategoryResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.post('/api/v1/categories', payload);
  return res.data;
};