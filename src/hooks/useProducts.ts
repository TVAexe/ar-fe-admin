'use client';

import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductById, ProductPageResponse } from '@/apis/productAPI';
import { handleApiError } from '@/utils/handleApiError';

// Hook lấy danh sách products theo page
export const useProducts = (
  page: number, 
  pageSize: number, 
  search?: string, 
  categoryId?: number
) => {
  return useQuery<ProductPageResponse>({
    queryKey: ['products', page, pageSize, search, categoryId],
    queryFn: async () => {
      try {
        return await getProducts(page, pageSize, search, categoryId);
      } catch (error: any) {
        handleApiError(error, 'Failed to fetch products.');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData
  });
};

// GET PRODUCT BY ID
export const useProduct = (id: number) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      try {
        return await getProductById(id);
      } catch (error: any) {
        handleApiError(error, 'Failed to fetch product details.');
        throw error;
      }
    },
    enabled: !!id,
  });
};
