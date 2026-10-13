// hooks/useZones.ts

import {
  getZones,
  getZone,
  addZone,
  updateZone,
  updateZoneCategories,
  deleteZone,
} from "@/services/zones";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Fetch zones
export const useGetZones = ({
  page = 1,
  limit = 10,
}: {
  page: number;
  limit: number;
}) =>
  useQuery({
    queryKey: ["zones", page, limit],
    queryFn: () => getZones({ page, limit }),
    placeholderData: (previousData) => previousData,
  });

export const useGetZone = (zoneId: string, enabled?: boolean) => {
  return useQuery({
    queryKey: ["zone", zoneId],
    queryFn: () => getZone(zoneId),
    enabled,
    placeholderData: (previousData) => previousData,
  });
};

// Add zone
export const useAddZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addZone,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["zones"], exact: false });
      toast.success("Zone added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
};

// Update zone
export const useUpdateZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateZone(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["zones"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["zone", id], exact: false });
      toast.success("Zone updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
};

// Update zone categories
export const useUpdateZoneCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateZoneCategories(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["zones"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["zone", id], exact: false });
      toast.success("Zone categories updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
};

// Delete zone
export const useDeleteZone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteZone(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["zones"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["zone", id], exact: false });
      toast.success("Zone deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
};
