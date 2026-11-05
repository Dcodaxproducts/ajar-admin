import { api } from "@/lib/axios";
import { ApiResponse, Ticket } from "../types";

type GetTicketsResponse = ApiResponse<{
  page: number;
  limit: number;
  total: number;
  tickets: Ticket[];
}>;

type GetTicketResponse = ApiResponse<Ticket>;
export type TicketDecisionPayload = {
  decision: "approved" | "rejected";
  reason: string;
  approvedAmount: number;
  currency: "SAR";
  evidenceReferences: string[];
  expectedVersion: number;
  idempotencyKey: string;
};
// ✅ Fetch paginated tickets
export const getTickets = async ({
  page = 1,
  limit = 10,
  status,
}: {
  page: number;
  limit: number;
  status?: string;
}): Promise<GetTicketsResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(Math.min(limit, 50)) });
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
export const decideTicket = async (
  ticketId: string,
  decision: TicketDecisionPayload
) => {
  const response = await api.post(`/tickets/${ticketId}/decision`, decision);
  return response.data;
};

// ✅ Delete a ticket
export const deleteTicket = async (ticketId: string) => {
  const response = await api.delete(`/tickets/${ticketId}`);
  return response.data;
};
