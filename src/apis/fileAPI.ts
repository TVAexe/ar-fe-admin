import { getToken } from '@/utils/token';
import { createAuthAxiosInstance } from '@/utils/axios';

export interface UploadFilesResponse {
  statusCode: number;
  error: string | null;
  message: string;
  data: {
    fileUrls: string[];
  };
}

export interface DeleteFileResponse {
  statusCode: number;
  error: string | null;
  message: string;
}

const S3_BASE_URL = 'https://funiture-shop-storage.s3.ap-southeast-1.amazonaws.com';

export const uploadMultipleFiles = async (files: File[]): Promise<UploadFilesResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const res = await authAxios.post('/api/v1/files/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Ensure URLs have the full S3 path
  const responseData = res.data;
  if (responseData.data && responseData.data.fileUrls) {
    responseData.data.fileUrls = responseData.data.fileUrls.map((url: string) => {
      // If URL doesn't start with http, prepend S3 base URL
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `${S3_BASE_URL}/${url}`;
      }
      return url;
    });
  }
  
  return responseData;
};

export const deleteFile = async (fileUrl: string): Promise<DeleteFileResponse> => {
  const token = getToken();
  if (!token) throw new Error('Missing token');
  const authAxios = createAuthAxiosInstance(token);
  const res = await authAxios.delete('/api/v1/files', {
    params: { fileUrl },
  });
  return res.data;
};