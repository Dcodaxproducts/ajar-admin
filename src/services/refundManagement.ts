import { api } from "@/lib/axios";
import { isAxiosError } from "axios";
import type { RefundPolicyPayload } from "@/lib/refundPolicy";

export const getRefundRequests = async ({ page, limit }: { page: number; limit: number }) => {
  const response = await api.get(`/refund-requests?page=${page}&limit=${limit}`);
  return response.data;
};

export const getRefundRequest = async (id: string) => {
  const response = await api.get(`/refund-requests/${id}`);
  return response.data;
};

export const updateRefundRequest = async (id: string, data: Record<string, unknown>) => {
  const response = await api.patch(`/refund-requests/${id}/status`, data);
  return response.data;
};

export const deleteRefundRequest = async (id: string) => {
  const response = await api.delete(`/refund-requests/${id}`);
  return response.data;
};

export const getRefundPolicy = async ({ zone, subCategory }: { zone: string; subCategory: string }) => {
  try {
    const response = await api.get(`/refund-policies/${zone}/${subCategory}`);
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) {
      return { success: true, data: null };
    }
    throw error;
  }
};

export const saveRefundPolicy = async ({ zone, subCategory, data }: { zone: string; subCategory: string; data: RefundPolicyPayload }) => {
  const response = await api.patch(`/refund-policies/${zone}/${subCategory}`, data);
  return response.data;
};
