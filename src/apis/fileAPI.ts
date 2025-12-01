import { getToken } from '@/utils';
import axios, { createAuthAxiosInstance } from "@/utils/axios";

const authAxios = () => {
    const token = getToken();
    if (!token) {
        throw new Error('No token found');
    }
    return createAuthAxiosInstance(token || '');
};

// UPLOAD FILES return fileName + UUID
export const uploadMultipleFiles = async (
    files: File[]
) : Promise<string[]> => {
    if (files.length === 0) return [];

    const axiosInstance = authAxios();
    const formData = new FormData();
    files.forEach((file) => {
        formData.append('files', file);
    });

    const response = await axiosInstance.post(
        '/api/v1/files/multiple',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    //backend trả về fileName + UUID
    return response.data?.data?.fileUrls || [];
};

export const getFileUrls = async (
    fileNames: string[],
): Promise<string[]> => {
    if (fileNames.length === 0) return [];
    const axiosInstance = authAxios();
    const response = await axiosInstance.post(
        '/api/v1/files/urls',
        { fileNames }
    );
    //backend trả về public URLs
    return response.data?.data?.fileUrls || [];
};

// Public get URLs (no token needed)
export const getFileUrlsPublic = async (fileNames: string[]): Promise<string[]> => {
    if (fileNames.length === 0) return [];
    const response = await axios.post('/api/v1/files/urls/public', { fileNames });
    return response.data?.data?.fileUrls || [];
};

export const uploadAndGetFileUrls = async (
    files: File[]
): Promise<string[]> => {
    const fileNames = await uploadMultipleFiles(files);
    const fileUrls = await getFileUrls(fileNames);
    return fileUrls;
};
