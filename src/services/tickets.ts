import { api } from "@/lib/axios";
import { ApiResponse, Ticket } from "../types";

type GetTicketsResponse = ApiResponse<{
  page: number;
  limit: number;
  total: number;
  tickets: Ticket[];
}>;

type GetTicketResponse = ApiResponse<Ticket>;
export type TicketStatusUpdatePayload = {
  status: "approved" | "partially_approved" | "rejected";
  adminNote: string;
  approvedAmount?: number;
};
// ✅ Fetch paginated tickets
export const getTickets = async ({
  page = 1,
  limit = 10,
  status,
}: {
  page: number;
  limit: number;
  status?: "pending" | "approved" | "partially_approved" | "rejected";
}): Promise<GetTicketsResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set("status", status);
  const response = await api.get(`/tickets?${params.toString()}`);
  return response.data;
};

// ✅ Get single ticket by ID
export const getTicket = async (
  ticketId: string
): Promise<GetTicketResponse> => {
  const response = await api.get(`/tickets/${ticketId}`);
  return response.data;
};

// ✅ Create a new ticket
export const addTicket = async (ticketData: Partial<Ticket>) => {
  const response = await api.post("/tickets", ticketData);
  return response.data;
};

// ✅ Update a ticket
export const updateTicketStatus = async (
  ticketId: string,
  ticketData: TicketStatusUpdatePayload
) => {
  const response = await api.patch(`/tickets/${ticketId}/status`, ticketData);
  return response.data;
};

// ✅ Delete a ticket
export const deleteTicket = async (ticketId: string) => {
  const response = await api.delete(`/tickets/${ticketId}`);
  return response.data;
};
