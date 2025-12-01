import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from '@/utils';
import axios, { createAuthAxiosInstance } from "@/utils/axios";

export interface Category {
  id: number;
  name: string;
}

const authAxios = () => {
    const token = getToken();
    if (!token) {
        throw new Error('No token found');
    } 
    return createAuthAxiosInstance(token || '');
}

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const axiosInstance = authAxios();
      const res = await axiosInstance.get("/api/v1/categories");
      return res.data.data as Category[];
    },
  });
};

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const axiosInstance = authAxios();
      const res = await axiosInstance.post("/api/v1/categories", payload);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useUpdateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number; name: string }) => {
      const axiosInstance = authAxios();
      const res = await axiosInstance.put(`/api/v1/categories/${payload.id}`, {
        name: payload.name,
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const axiosInstance = authAxios();
      await axiosInstance.delete(`/api/v1/categories/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
};
