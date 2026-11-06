import {
  getTickets,
  getTicket,
  addTicket,
  deleteTicket,
  decideTicket,
  getSecurityDepositStatus,
  retryTicketSettlement,
} from "@/services/tickets";
import type { TicketDecisionPayload } from "@/services/tickets";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ✅ Get all tickets
export const useGetTickets = ({
  page = 1,
  limit = 10,
  status,
}: {
  page: number;
  limit: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["tickets", page, limit, status],
    queryFn: () => getTickets({ page, limit, status }),
    placeholderData: (prev) => prev,
  });
};

// ✅ Get single ticket
export const useGetTicket = (ticketId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getTicket(ticketId),
    enabled,
    placeholderData: (prev) => prev,
  });
};

export const useGetSecurityDepositStatus = (
  bookingId: string | undefined
) => useQuery({
  queryKey: ["security-deposit", bookingId],
  queryFn: () => getSecurityDepositStatus(bookingId as string),
  enabled: Boolean(bookingId),
  refetchInterval: 30_000,
});

export const useRetryTicketSettlement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: retryTicketSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-deposit"] });
      queryClient.invalidateQueries({ queryKey: ["ticket"] });
      toast.success("Settlement retry scheduled");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Settlement retry failed");
    },
  });
};

// ✅ Add new ticket
export const useAddTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket"] });
      toast.success("Ticket created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create ticket");
    },
  });
};

// ✅ Update ticket
export const useDecideTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...decision }: { id: string } & TicketDecisionPayload) =>
      decideTicket(id, decision),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", variables.id] });
      toast.success("Decision recorded. Payment execution remains pending.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update ticket");
    },
  });
};

// ✅ Delete ticket
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTicket(id),
    onSuccess: ({ data }: { data: { _id: string } }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast.success("Ticket deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete ticket");
    },
  });
};
