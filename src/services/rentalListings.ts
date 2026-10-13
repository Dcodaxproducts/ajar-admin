import { api } from "@/lib/axios";
import { ApiResponse, Pagination } from "@/types";
import { RentalListing } from "../types";

export interface GetRentalListingsResponse {
  success: boolean;
  message: string;
  data: {
    page: number;
    limit: number;
    total: number;
    listings: RentalListing[];
  };
}

export interface GetRentalListingResponse {
  success: boolean;
  message: string;
  data: RentalListing;
}

export const getRentalListings = async ({
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
}): Promise<GetRentalListingsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(zone && { zone }),
    ...(search && { search }),
  });
  if (status) params.set("status", status);
  const response = await api.get(`/marketplace-listings?${params}`);
  return response.data;
};

export const getRentalListing = async (
  id: string
): Promise<GetRentalListingResponse> => {
  const response = await api.get(`/marketplace-listings/${id}`);
  return response.data;
};

export const updateRentalListingStatus = async (
  id: string,
  status: "approved" | "rejected",
  rejectionNote?: string
): Promise<GetRentalListingResponse> => {
  const response = await api.patch(`/marketplace-listings/${id}/status`, {
    status,
    rejectionNote,
  });
  return response.data;
};

export const deleteRentalListing = async (id: string) => {
  const response = await api.delete(`/marketplace-listings/${id}`);
  return response.data;
};
