// /services/field.ts

import { api } from "@/lib/axios";
import { ApiResponse, Field, Pagination } from "@/types";
type GetFieldsListResponse = ApiResponse<Pagination & { fields: Field[] }>;

export type FieldResponse = ApiResponse<Field>;
export type FieldMutationPayload = Partial<Field>;

export const getFields = async ({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search?: string;
}): Promise<GetFieldsListResponse> => {
  const response = await api.get("/fields", { params: { page, limit, search } });
  return response.data;
};

export const getFieldsList = async ({
  isChoiceField,
}: {
  isChoiceField?: boolean;
}): Promise<GetFieldsListResponse> => {
  const params: { isChoiceField?: boolean; page: number; limit: number } = {
    page: 1,
    limit: 200,
  };
  if (isChoiceField !== undefined) {
    params.isChoiceField = isChoiceField;
  }
  const response = await api.get("/fields/list", { params });
  return response.data;
};

export const getField = async (fieldId: string): Promise<FieldResponse> => {
  const response = await api.get(`/fields/${fieldId}`);
  return response.data;
};

export const addField = async (fieldData: FieldMutationPayload): Promise<FieldResponse> => {
  const response = await api.post("/fields", fieldData);
  return response.data;
};

export const updateField = async (fieldId: string, fieldData: FieldMutationPayload): Promise<FieldResponse> => {
  const response = await api.patch(`/fields/${fieldId}`, fieldData);
  return response.data;
};

export const deleteField = async (fieldId: string): Promise<FieldResponse> => {
  const response = await api.delete(`/fields/${fieldId}`);
  return response.data;
};
