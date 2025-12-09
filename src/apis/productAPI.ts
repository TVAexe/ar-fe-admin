import { getToken } from '@/utils/token';
import { createAuthAxiosInstance } from '@/utils/axios';

export interface ProductListParams {
  page: number;
  size: number;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductItem {
  id: number;
  name: string;
  oldPrice: number;
  saleRate: number;
  quantity: number;
  description: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  imageUrl: string[];
  category: Category;
}

export interface ProductListMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface ProductListResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: {
    meta: ProductListMeta;
    result: ProductItem[];
  };
}

export interface CreateProductPayload {
  name: string;
  oldPrice: number;
  saleRate: number;
  quantity: number;
  description: string;
  categoryId: number;
  images: File[];
}

export interface CreateProductResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: ProductItem;
}

export const getProducts = async ({ page, size }: ProductListParams): Promise<ProductListResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.get('/api/v1/products/with-category', { 
    params: { page, size } 
  });
  return res.data;
};

export const createProduct = async (payload: CreateProductPayload): Promise<CreateProductResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('oldPrice', payload.oldPrice.toString());
  formData.append('saleRate', payload.saleRate.toString());
  formData.append('quantity', payload.quantity.toString());
  formData.append('description', payload.description);
  formData.append('categoryId', payload.categoryId.toString());

  payload.images.forEach((image) => {
    formData.append('images', image);
  });

  const res = await authAxios.post('/api/v1/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export interface UpdateProductPayload {
  name: string;
  oldPrice: number;
  saleRate: number;
  quantity: number;
  description: string;
  categoryId: number;
  imageUrl: string[];
}

export interface UpdateProductResponse {
  statusCode: number;
  message: string;
  data: ProductItem;
}

export const getProductById = async (id: number): Promise<{ data: ProductItem }> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.get(`/api/v1/products/${id}`);
  return res.data;
};

export const updateProduct = async (
  id: number,
  payload: UpdateProductPayload
): Promise<UpdateProductResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.put(`/api/v1/products/${id}`, payload);
  return res.data;
};

export interface DeleteProductResponse {
  statusCode: number;
  message: string;
}

export const deleteProduct = async (id: number): Promise<DeleteProductResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.delete(`/api/v1/products/${id}`);
  return res.data;
};