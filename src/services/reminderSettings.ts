import { api } from "@/lib/axios";
import { ReminderSetting, ReminderSettingUpdate } from "@/types";

export async function getReminderSettings() {
  const { data } = await api.get(`/reminder-settings`);
  return data.data as ReminderSetting[];
}

export async function updateReminderSetting({
  type,
  data,
}: {
  type: string;
  data: ReminderSettingUpdate;
}) {
  const response = await api.patch(`/reminder-settings/${type}`, data);
  return response.data;
}
