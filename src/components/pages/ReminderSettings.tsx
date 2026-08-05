"use client";

import { useReminderSettings, useUpdateReminderSetting } from "@/hooks/useReminderSettings";
import {
  ReminderChannel,
  ReminderOffsetUnit,
  ReminderSetting,
  ReminderSettingUpdate,
} from "@/types";
import { Bell, Clock3, Mail, MessageSquareText, Smartphone } from "lucide-react";
import { useMemo } from "react";
import ResponseError from "../ResponseError";
import TableSkeleton from "../skeletons/TableSkeleton";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";

const channels: ReminderChannel[] = ["push", "email", "sms"];
const offsetUnits: ReminderOffsetUnit[] = ["minutes", "hours", "days"];
const channelIcons = {
  push: Smartphone,
  email: Mail,
  sms: MessageSquareText,
};

const ReminderSettings = () => {
  const { data: reminders = [], isLoading, error } = useReminderSettings();
  const {
    mutate: updateReminder,
    isPending,
    variables,
  } = useUpdateReminderSetting();

  const groupedReminders = useMemo(() => {
    return reminders.reduce<Record<string, ReminderSetting[]>>((acc, reminder) => {
      acc[reminder.audience] = [...(acc[reminder.audience] || []), reminder];
      return acc;
    }, {});
  }, [reminders]);

  if (isLoading) {
    return <TableSkeleton cols={5} rows={6} />;
  }

  if (error) {
    return <ResponseError error={error.message} />;
  }

  const update = (type: string, data: ReminderSettingUpdate) => {
    updateReminder({ type, data });
  };

  const updateChannels = (reminder: ReminderSetting, channel: ReminderChannel) => {
    const hasChannel = reminder.channels.includes(channel);
    const nextChannels = hasChannel
      ? reminder.channels.filter((item) => item !== channel)
      : [...reminder.channels, channel];

    if (nextChannels.length === 0) return;

    update(reminder.type, { channels: nextChannels });
  };

  const getTimingLabel = (reminder: ReminderSetting) => {
    const unit = reminder.offsetValue === 1
      ? reminder.offsetUnit.replace(/s$/, "")
      : reminder.offsetUnit;

    return `${reminder.offsetValue} ${unit} ${reminder.timing}`;
  };

  const enabledCount = reminders.filter((reminder) => reminder.enabled).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Reminder types</p>
          <p className="mt-1 text-2xl font-semibold">{reminders.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Enabled</p>
          <p className="mt-1 text-2xl font-semibold">{enabledCount}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">Channels</p>
          <p className="mt-2 flex flex-wrap gap-2">
            {channels.map((channel) => (
              <Badge key={channel} variant="outline" className="capitalize">
                {channel}
              </Badge>
            ))}
          </p>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="h-80 flex items-center justify-center rounded-xl border text-muted-foreground text-sm">
          No reminder settings found
        </div>
      ) : (
        Object.entries(groupedReminders).map(([audience, items]) => (
          <section key={audience} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold capitalize">{audience}</h3>
              <Badge variant="secondary">{items.length} reminders</Badge>
            </div>

            <div className="grid gap-3">
              {items.map((reminder) => {
                const rowPending = isPending && variables?.type === reminder.type;

                return (
                  <Card key={reminder.type} className="rounded-lg py-0">
                    <CardContent className="grid gap-4 p-4 xl:grid-cols-[1.5fr_1fr_1.3fr_auto] xl:items-center">
                      <div className="flex gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-aqua/10 text-aqua">
                          <Bell className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{reminder.label}</p>
                            <Badge variant="outline" className="capitalize">
                              {reminder.timing}
                            </Badge>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {reminder.type}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="flex items-center gap-2 text-sm font-medium">
                          <Clock3 className="size-4 text-muted-foreground" />
                          {getTimingLabel(reminder)}
                        </p>
                        <div className="flex items-center gap-2">
                          <Input
                            key={`${reminder.type}-${reminder.offsetValue}`}
                            type="number"
                            min={0}
                            step="0.1"
                            defaultValue={reminder.offsetValue}
                            disabled={rowPending}
                            className="w-20"
                            onBlur={(event) => {
                              const value = Number(event.target.value);
                              if (
                                Number.isNaN(value) ||
                                value < 0 ||
                                value === reminder.offsetValue
                              ) {
                                event.target.value = reminder.offsetValue.toString();
                                return;
                              }

                              update(reminder.type, { offsetValue: value });
                            }}
                          />
                          <Select
                            value={reminder.offsetUnit}
                            disabled={rowPending}
                            onValueChange={(offsetUnit: ReminderOffsetUnit) =>
                              update(reminder.type, { offsetUnit })
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {offsetUnits.map((unit) => (
                                <SelectItem
                                  key={unit}
                                  value={unit}
                                  className="capitalize"
                                >
                                  {unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span className="text-sm text-muted-foreground">
                            {reminder.timing}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {channels.map((channel) => {
                          const Icon = channelIcons[channel];
                          const comingSoon = channel !== "push";

                          return (
                            <label
                              key={channel}
                              className="flex min-h-9 items-center gap-2 rounded-md border px-3 text-sm capitalize"
                            >
                              <Checkbox
                                checked={reminder.channels.includes(channel)}
                                disabled={rowPending}
                                onCheckedChange={() =>
                                  updateChannels(reminder, channel)
                                }
                              />
                              <Icon className="size-4 text-muted-foreground" />
                              <span>{channel}</span>
                              {comingSoon && (
                                <span className="text-[10px] text-muted-foreground">
                                  Soon
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2 xl:justify-end">
                        <Switch
                          checked={reminder.enabled}
                          disabled={rowPending}
                          onCheckedChange={(enabled) =>
                            update(reminder.type, { enabled })
                          }
                        />
                        <span className="min-w-8 text-sm text-muted-foreground">
                          {reminder.enabled ? "On" : "Off"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
};

export default ReminderSettings;
