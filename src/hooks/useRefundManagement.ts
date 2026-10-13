import {
  getRefundRequests,
  getRefundRequest,
  updateRefundRequest,
  deleteRefundRequest,
  getRefundPolicy,
  saveRefundPolicy,
} from "@/services/refundManagement";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { RefundPolicyPayload } from "@/lib/refundPolicy";

export const useGetRefundRequests = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["refund-requests", page, limit],
    queryFn: () => getRefundRequests({ page, limit }),
    placeholderData: (prev) => prev,
  });
};

export const useGetRefundRequest = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["refund-request", id],
    queryFn: () => getRefundRequest(id),
    enabled,
    placeholderData: (prev) => prev,
  });
};

export const useUpdateRefundRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateRefundRequest(id, data),
    onSuccess: ({ data }: { data: { _id: string } }) => {
      queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
      queryClient.invalidateQueries({ queryKey: ["refund-request", data._id] });
      toast.success("Refund request updated successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update refund request"
      );
    },
  });
};

export const useDeleteRefundRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRefundRequest(id),
    onSuccess: ({ data }: { data: { _id: string } }) => {
      queryClient.invalidateQueries({ queryKey: ["refund-requests"] });
      queryClient.invalidateQueries({ queryKey: ["refund-request", data._id] });
      toast.success("Refund request deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to delete refund request"
      );
    },
  });
};

export const useGetRefundPolicy = (zone: string, subCategory: string) => {
  return useQuery({
    queryKey: ["refund-policy", zone, subCategory],
    queryFn: () => getRefundPolicy({ zone, subCategory }),
    placeholderData: (prev) => prev,
    enabled: !!zone && !!subCategory,
  });
};

export const useSaveRefundPolicy = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("translation");
  return useMutation({
    mutationFn: ({
      zone,
      subCategory,
      data,
    }: {
      zone: string;
      subCategory: string;
      data: RefundPolicyPayload;
    }) => saveRefundPolicy({ zone, subCategory, data }),
    onSuccess: (_, { zone, subCategory }) => {
      queryClient.invalidateQueries({ queryKey: ["refund-policy", zone, subCategory] });
      toast.success(t("refundPolicySaved"));
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || t("failedToSaveRefundPolicy")
      );
    },
  });
};
