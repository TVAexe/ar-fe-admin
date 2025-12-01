import { getToken } from '@/utils';
import axios, { createAuthAxiosInstance } from "@/utils/axios";

export interface CreateProductDTOPayload {
    name: string;
    oldPrice: number;
    saleRate?: number;
    quantity: number;
    description?: string;
    imageUrl?: string[];
    categoryId: number;
}

export interface UpdateProductDTOPayload {
    name?: string;
    oldPrice?: number;
    saleRate?: number;
    quantity?: number;
    description?: string;
    imageUrl?: string[];
    categoryId?: number;
}

export interface ProductDTOResponse {
    id: number;
    name: string;
    oldPrice: number;
    saleRate: number;
    quantity: number;
    description: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    imageUrl: string[];
    category: {
        id: number;
        name: string;
    };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  pages: number;
  total: number;
}

export interface ProductsResponse {
  meta: PaginationMeta;
  result: ProductDTOResponse[];
}

// Helper function to get authenticated axios instance
const authAxios = () => {
    const token = getToken();
    if (!token) {
        throw new Error('No token found');
    } 
    return createAuthAxiosInstance(token || '');
}

// GET ALL PRODUCTS (public)
// export const getProducts = async (): Promise<ProductDTOResponse[]> => {
//     const response = await axios.get('/api/v1/products');
//     return response.data.data;
// }

// GET products có pagination
export const getProducts = async (
  page: number,
  pageSize: number
): Promise<ProductsResponse> => {
  const res = await axios.get<ProductsResponse>('/api/v1/products', {
    params: { page, pageSize },
  });
  return res.data;
};

// GET PRODUCT BY ID (public)
export const getProductById = async (id: number): Promise<ProductDTOResponse> => {
    const response = await axios.get(`/api/v1/products/${id}`);
    return response.data.data;
}

// CREATE PRODUCT (requires token)
export const createProduct = async (
    params: CreateProductDTOPayload
): Promise<ProductDTOResponse> => {
    const axiosInstance = authAxios();
    const response = await axiosInstance.post('/api/v1/products', params);
    return response.data;
}

// UPDATE PRODUCT (requires token)
export const updateProduct = async (
    id: number,
    params: UpdateProductDTOPayload
): Promise<ProductDTOResponse> => {
    const axiosInstance = authAxios();
    const response = await axiosInstance.put(`/api/v1/products/${id}`, params);
    return response.data;
}

// DELETE PRODUCT (requires token)
export const deleteProduct = async (id: number): Promise<void> => {
    const axiosInstance = authAxios();
    await axiosInstance.delete(`/api/v1/products/${id}`);
}

