// hooks/useRentalListings.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getRentalListings,
  getRentalListing,
  updateRentalListingStatus,
  deleteRentalListing,
} from "../services/rentalListings";
import { toast } from "sonner";

export const useRentalListings = ({
  page = 1,
  limit = 10,
  zone,
  search,
  status,
}: {
  page: number;
  limit: number;
  zone?: string;
  search?: string;
  status?: "pending" | "approved" | "rejected";
}) => {
  return useQuery({
    queryKey: ["rental-listings", page, limit, zone, search, status],
    queryFn: () => getRentalListings({ page, limit, zone, search, status }),
  });
};

export const useRentalListing = (id: string) => {
  return useQuery({
    queryKey: ["rental-listing", id],
    queryFn: () => getRentalListing(id),
  });
};

export const useUpdateRentalListing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      rejectionNote,
    }: {
      id: string;
      status: "approved" | "rejected";
      rejectionNote?: string;
    }) => updateRentalListingStatus(id, status, rejectionNote),

    onSuccess: (_, { id, status }) => {
      toast.success(`Listing ${status} successfully`);
      queryClient.invalidateQueries({ queryKey: ["rental-listings"] });
      queryClient.invalidateQueries({ queryKey: ["rental-listing", id] });
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update rental listing status");
    },
  });
};

export const useDeleteRentalListing = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRentalListing(id),
    onSuccess: (_, id) => {
      toast.success("Rental listing deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["rental-listings"] });
      queryClient.invalidateQueries({ queryKey: ["rental-listing", id] });
    },
    onError: (error: any) => {
      toast.error("Failed to delete rental listing", error);
    },
  });
};
