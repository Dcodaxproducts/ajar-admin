import { api } from "@/lib/axios";
import { ApiResponse, ZoneForm } from "@/types";

// ---------------- Types ----------------

export type GetZoneFormsResponse = ApiResponse<{
  forms: ZoneForm[];
  total: number;
  page: number;
  limit: number;
}>;

type GetZoneFormDetailsResponse = ApiResponse<ZoneForm>;

// ---------------- API Services ----------------

export const getAllZoneForms = async (): Promise<GetZoneFormsResponse> => {
  const response = await api.get("/forms");
  return response.data;
};

export const getZoneFormById = async (
  formId: string
): Promise<GetZoneFormDetailsResponse> => {
  const response = await api.get(`/forms/${formId}`);
  return response.data;
};

export const getZoneFormByZoneAndSubCategory = async (
  zoneId: string,
  subCategoryId: string
): Promise<GetZoneFormDetailsResponse> => {
  const response = await api.get(`/forms/form`, {
    params: {
      zone: zoneId,
      subCategory: subCategoryId,
      isAdmin: true
    },
  });
  return response.data;
};

export const addZoneForm = async (formData: Omit<ZoneForm, "_id">) => {
  const response = await api.post("/forms", formData);
  return response.data;
};

export const updateZoneForm = async (
  formId: string,
  formData: Partial<ZoneForm>
) => {
  const response = await api.patch(`/forms/${formId}`, formData);
  return response.data;
};

export const deleteZoneForm = async (formId: string) => {
  const response = await api.delete(`/forms/${formId}`);
  return response.data;
};


export type ReorderZoneFormFieldsResponse = ApiResponse<{
  _id: string;
  version: number;
  fields: Array<{ fieldId: string; order: number }>;
}>;

export const reorderZoneFormFields = async (
  formId: string,
  fieldIds: string[],
  version: number
): Promise<ReorderZoneFormFieldsResponse> => {
  const response = await api.patch(`/forms/${formId}/fields/order`, {
    fieldIds,
    version,
  });
  return response.data;
};
