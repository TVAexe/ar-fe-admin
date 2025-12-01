'use client';

import { useQuery } from '@tanstack/react-query';
import { getProducts, getProductById, ProductsResponse } from '@/apis/productAPI';
import { handleApiError } from '@/utils/handleApiError';

// GET ALL PRODUCTS
// export const useProducts = () => {
//   return useQuery({
//     queryKey: ['products'],
//     queryFn: async () => {
//       try {
//         return await getProducts();
//       } catch (error: any) {
//         handleApiError(error, 'Failed to fetch products.');
//         throw error;
//       }
//     },
//   });
// };

// Hook lấy danh sách products theo page
export const useProducts = (page: number, pageSize: number = 50) => {
  return useQuery<ProductsResponse>({
    queryKey: ['products', page],
    queryFn: async () => {
      try {
        return await getProducts(page, pageSize);
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
