import { api } from "@/lib/axios";
// import { RentalPolicies } from "@/types";

interface RentalPolicies {
  securityDepositRules: {
    depositRequired: boolean;
    depositAmount: number;
    depositConditions: string;
    disputeWindowDays: number;
  };
  damageLiabilityTerms: {
    responsibilityClause: string;
    inspectionRequired: boolean;
    insuranceRequired: boolean;
  };
  rentalDurationLimits: {
    minimumDuration: { value: number; unit: string };
    maximumDuration: { value: number; unit: string };
    extensionAllowed: boolean;
  };
}

// Response structure for rental policies
export interface GetRentalPoliciesResponse {
  success: boolean;
  message: string;
  data: RentalPolicies;
}

// Service to get security deposit rules for a specific zone
export const getSecurityDepositRules = async (zoneId: string, subCategoryId: string) => {
  const response = await api.get(
    `/zones/${zoneId}/subcategories/${subCategoryId}/rental-policies/security-deposit-rules`
  );
  return response.data;
};

// Service to update security deposit rules for a specific zone
export const updateSecurityDepositRules = async (
  zoneId: string,
  subCategoryId: string,
  depositRules: any
) => {
  const response = await api.patch(
    `/zones/${zoneId}/subcategories/${subCategoryId}/rental-policies/security-deposit-rules`,
    depositRules
  );
  return response.data;
};

// Service to get damage liability terms for a specific zone
export const getDamageLiabilityTerms = async (zoneId: string, subCategoryId: string) => {
  const response = await api.get(
    `/zones/${zoneId}/subcategories/${subCategoryId}/rental-policies/damage-liability-terms`
  );
  return response.data;
};

// Service to update damage liability terms for a specific zone
export const updateDamageLiabilityTerms = async (
  zoneId: string,
  subCategoryId: string,
  liabilityTerms: any
) => {
  const response = await api.patch(
    `/zones/${zoneId}/subcategories/${subCategoryId}/rental-policies/damage-liability-terms`,
    liabilityTerms
  );
  return response.data;
};

// Service to get rental duration limits for a specific zone
export const getRentalDurationLimits = async (zoneId: string, subCategoryId: string) => {
  const response = await api.get(
    `/zones/${zoneId}/subcategories/${subCategoryId}/rental-policies/rental-duration-limits`
  );
  return response.data;
};

// Service to update rental duration limits for a specific zone
export const updateRentalDurationLimits = async (
  zoneId: string,
  subCategoryId: string,
  durationLimits: any
) => {
  const response = await api.patch(
    `/zones/${zoneId}/subcategories/${subCategoryId}/rental-policies/rental-duration-limits`,
    durationLimits
  );
  return response.data;
};
