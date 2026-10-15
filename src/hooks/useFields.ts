// hooks/useFields.ts

import {
  getFields,
  getField,
  addField,
  updateField,
  deleteField,
  getFieldsList,
  type FieldMutationPayload,
  type FieldResponse,
} from "@/services/field";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const errorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return axiosError.response?.data?.message || "Something went wrong";
};

export const useGetFields = ({
  page = 1,
  limit = 10,
  search = "",
}: {
  page: number;
  limit: number;
  search?: string;
}) =>
  useQuery({
    queryKey: ["fields", page, limit, search],
    queryFn: () => getFields({ page, limit, search }),
    placeholderData: (previousData) => previousData,
  });

export const useGetFieldsList = ({ enabled = true }: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["fields-list"],
    queryFn: () => getFieldsList({}),
    placeholderData: (previousData) => previousData,
    enabled,
  });

export const useGetChoiceFieldsList = ({ enabled = true }: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["choice-fields-list"],
    queryFn: () => getFieldsList({ isChoiceField: true }),
    placeholderData: (previousData) => previousData,
    enabled,
  });

export const useGetField = (fieldId: string, enabled?: boolean) =>
  useQuery({
    queryKey: ["field", fieldId],
    queryFn: () => getField(fieldId),
    enabled,
    placeholderData: (previousData) => previousData,
  });

const invalidateFieldLists = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ["fields"], exact: false });
  queryClient.invalidateQueries({ queryKey: ["fields-list"] });
  queryClient.invalidateQueries({ queryKey: ["choice-fields-list"] });
};

export const useAddField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addField,
    onSuccess: ({ data }: FieldResponse) => {
      invalidateFieldLists(queryClient);
      queryClient.setQueryData(["field", data._id], { success: true, message: "", data });
      toast.success("Field added successfully");
    },
    onError: (error: unknown) => toast.error(errorMessage(error)),
  });
};

export const useUpdateField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FieldMutationPayload }) =>
      updateField(id, data),
    onSuccess: (response: FieldResponse) => {
      invalidateFieldLists(queryClient);
      queryClient.setQueryData(["field", response.data._id], response);
      toast.success("Field updated successfully");
    },
    onError: (error: unknown) => toast.error(errorMessage(error)),
  });
};

export const useDeleteField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteField(id),
    onSuccess: ({ data }: FieldResponse) => {
      invalidateFieldLists(queryClient);
      queryClient.removeQueries({ queryKey: ["field", data._id] });
      toast.success("Field deleted successfully");
    },
    onError: (error: unknown) => toast.error(errorMessage(error)),
  });
};
