'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  CreateProductDTOPayload,
  UpdateProductDTOPayload,
} from '@/apis/productAPI';
import { toastSuccess } from '@/utils/toast';
import { handleApiError } from '@/utils/handleApiError';

// CREATE PRODUCT
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateProductDTOPayload) => createProduct(payload),

    onSuccess: () => {
      toastSuccess('Product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },

    onError: (error: Error & { response?: { status?: number } }) => {
      handleApiError(error, 'Failed to create product.');
    },
  });
};

// UPDATE PRODUCT
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDTOPayload }) =>
      updateProduct(id, data),

    onSuccess: (_, { id }) => {
      toastSuccess('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },

    onError: (error: Error & { response?: { status?: number } }) => {
      handleApiError(error, 'Failed to update product.');
    },
  });
};

// DELETE PRODUCT
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),

    onSuccess: () => {
      toastSuccess('Product deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },

    onError: (error: Error & { response?: { status?: number } }) => {
      handleApiError(error, "Failed to delete product.");
    },
  });
};
