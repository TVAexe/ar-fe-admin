import { toastError } from "./toast";
import { MESSAGES } from "@/config/const";

export const handleApiError = (
  error: any,
  fallbackMessage = MESSAGES.INTERNAL_SERVER_ERROR
) => {
  console.error("API ERROR:", error);

  const status = error?.response?.status;
  const apiMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message;

  switch (status) {
    case 400:
      toastError(apiMessage || "Invalid data. Please check your input.");
      break;

    case 401:
      toastError(apiMessage || "Unauthorized. Please login again.");
      break;

    case 403:
      toastError("You don't have permission to perform this action.");
      break;

    case 404:
      toastError(apiMessage || "Resource not found.");
      break;

    case 409:
      toastError(apiMessage || "This resource already exists.");
      break;

    case 429:
      toastError("Too many requests. Please try again later.");
      break;

    case 500:
      toastError(MESSAGES.INTERNAL_SERVER_ERROR);
      break;

    default:
      toastError(apiMessage || fallbackMessage);
      break;
  }
};
