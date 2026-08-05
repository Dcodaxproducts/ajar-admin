import {
  getReminderSettings,
  updateReminderSetting,
} from "@/services/reminderSettings";
import { ReminderSettingUpdate } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useReminderSettings() {
  return useQuery({
    queryKey: ["reminder-settings"],
    queryFn: getReminderSettings,
  });
}

export function useUpdateReminderSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      type,
      data,
    }: {
      type: string;
      data: ReminderSettingUpdate;
    }) => updateReminderSetting({ type, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-settings"] });
      toast.success("Reminder setting updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });
}
