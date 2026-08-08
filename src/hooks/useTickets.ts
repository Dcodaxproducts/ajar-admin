import {
  getTickets,
  getTicket,
  addTicket,
  deleteTicket,
  updateTicketStatus,
} from "@/services/tickets";
import type { TicketStatusUpdatePayload } from "@/services/tickets";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ✅ Get all tickets
export const useGetTickets = ({
  page = 1,
  limit = 10,
}: {
  page: number;
  limit: number;
}) => {
  return useQuery({
    queryKey: ["tickets", page, limit],
    queryFn: () => getTickets({ page, limit }),
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
export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...ticketData }: { id: string } & TicketStatusUpdatePayload) =>
      updateTicketStatus(id, ticketData),
    onSuccess: ({ data }: { data: { _id: string } }) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", data._id] });
      toast.success("Ticket updated successfully");
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
