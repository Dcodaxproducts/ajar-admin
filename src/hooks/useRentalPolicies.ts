import {
  getSecurityDepositRules,
  updateSecurityDepositRules,
  getDamageLiabilityTerms,
  updateDamageLiabilityTerms,
  getRentalDurationLimits,
  updateRentalDurationLimits,
} from "@/services/rentalPolicies";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Fetch security deposit rules
export const useGetSecurityDepositRules = (zoneId: string, subCategoryId: string) =>
  useQuery({
    queryKey: ["security-deposit-rules", zoneId, subCategoryId],
    queryFn: () => getSecurityDepositRules(zoneId, subCategoryId),
    placeholderData: (previousData) => previousData,
    enabled: !!zoneId && !!subCategoryId,
  });

// Update security deposit rules
export const useUpdateSecurityDepositRules = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zoneId, subCategoryId, data }: { zoneId: string; subCategoryId: string; data: any }) =>
      updateSecurityDepositRules(zoneId, subCategoryId, data),
    onSuccess: (_, { zoneId, subCategoryId }) => {
      queryClient.invalidateQueries({
        queryKey: ["security-deposit-rules", zoneId, subCategoryId],
      });
      toast.success("Security deposit rules updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
};

// Fetch damage liability terms
export const useGetDamageLiabilityTerms = (zoneId: string, subCategoryId: string) =>
  useQuery({
    queryKey: ["damage-liability-terms", zoneId, subCategoryId],
    queryFn: () => getDamageLiabilityTerms(zoneId, subCategoryId),
    placeholderData: (previousData) => previousData,
    enabled: !!zoneId && !!subCategoryId,
  });

// Update damage liability terms
export const useUpdateDamageLiabilityTerms = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zoneId, subCategoryId, data }: { zoneId: string; subCategoryId: string; data: any }) =>
      updateDamageLiabilityTerms(zoneId, subCategoryId, data),
    onSuccess: (_, { zoneId, subCategoryId }) => {
      queryClient.invalidateQueries({
        queryKey: ["damage-liability-terms", zoneId, subCategoryId],
      });
      toast.success("Damage liability terms updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
};

// Fetch rental duration limits
export const useGetRentalDurationLimits = (zoneId: string, subCategoryId: string) =>
  useQuery({
    queryKey: ["rental-duration-limits", zoneId, subCategoryId],
    queryFn: () => getRentalDurationLimits(zoneId, subCategoryId),
    placeholderData: (previousData) => previousData,
    enabled: !!zoneId && !!subCategoryId,
  });

// Update rental duration limits
export const useUpdateRentalDurationLimits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zoneId, subCategoryId, data }: { zoneId: string; subCategoryId: string; data: any }) =>
      updateRentalDurationLimits(zoneId, subCategoryId, data),
    onSuccess: (_, { zoneId, subCategoryId }) => {
      queryClient.invalidateQueries({
        queryKey: ["rental-duration-limits", zoneId, subCategoryId],
      });
      toast.success("Rental duration limits updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
};
