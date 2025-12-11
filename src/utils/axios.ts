import { MESSAGES } from '@/config/const';
import { toastError } from '@/utils/toast';
import axios, { AxiosInstance } from 'axios';
import { resetToken } from '@/utils';

const BASE_URL = 'https://arbe-production.up.railway.app';
const TIMEOUT = 10000;
const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

export enum AxiosErrorCode {
  TooManyRequests = 429,
  BadRequest = 400,
  InternalServerError = 500,
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: COMMON_HEADERS,
});

// Function to create an Axios instance with Bearer token
export const createAuthAxiosInstance = (token: string) => {
  const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
      ...COMMON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
  });
  attachInterceptors(axiosInstance);

  return axiosInstance;
};

// Function to attach interceptors to any Axios instance
const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response, // Pass successful responses through
    (error) => {
      if (error.response) {
        if (error.response.status === 500) {
          toastError(MESSAGES.INTERNAL_SERVER_ERROR);
          console.warn('Server error! Please try again later.');
        }

        // when multiple 401 errors occur, ensure the toast is shown only once
        if (
          error.response.status === 401 &&
          !localStorage.getItem('isShowingErrorToast')
        ) {
          localStorage.setItem('isShowingErrorToast', 'true');
          toastError(MESSAGES.TOKEN_EXPIRED);
          setTimeout(() => {
            resetToken();
            window.location.href = '/login';

            // Reset the isShowingErrorToast flag after redirecting to the login page
            localStorage.removeItem('isShowingErrorToast');
          }, 2000);
        }
      } else if (error.request) {
        console.error('Network error! Please check your connection.');
      } else {
        console.error('Request error:', error.message);
      }

      return Promise.reject(error);
    },
  );
};

attachInterceptors(axiosInstance);

export default axiosInstance;
