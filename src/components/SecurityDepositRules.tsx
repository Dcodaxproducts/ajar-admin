"use client";

import {
  useGetSecurityDepositRules,
  useUpdateSecurityDepositRules,
} from "@/hooks/useRentalPolicies";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import Switch from "./forms/fields/Switch";
import TextInput from "./forms/fields/TextInput";
import SelectInput from "./forms/fields/SelectInput";
import { Button } from "./ui/button";
import Loader from "./Loader";
import ResponseError from "./ResponseError";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

type DisputeWindowUnit = "hours" | "days";

interface SecurityDepositRulesFormValues {
  depositRequired: boolean;
  depositAmount: number;
  depositConditions: string;
  disputeWindow: {
    duration: number;
    unit: DisputeWindowUnit;
  };
}

const disputeWindowUnitOptions = [
  { label: "hours", value: "hours" },
  { label: "days", value: "days" },
];

const SecurityDepositRules = ({
  zone,
  subCategory,
}: {
  zone: string;
  subCategory: string;
}) => {
  const t = useTranslations("translation");
  const { data, isLoading, error } = useGetSecurityDepositRules(
    zone,
    subCategory
  );

  const rules = data?.data?.securityDepositRules || {};
  const depositRequired = rules.depositRequired ?? false;
  const depositAmount = rules.depositAmount ?? 0;
  const depositConditions = rules.depositConditions ?? "";
  const disputeWindow = rules.disputeWindow ?? {
    duration: rules.disputeWindowDays ?? 7,
    unit: "days" as const,
  };

  const initialData: SecurityDepositRulesFormValues = {
    depositRequired,
    depositAmount,
    depositConditions,
    disputeWindow,
  };

  const schema = z
    .object({
      depositRequired: z.boolean(),
      depositAmount: z.number(),
      depositConditions: z.string(),
      disputeWindow: z.object({
        duration: z.number().int().min(1),
        unit: z.enum(["hours", "days"]),
      }),
    })
    .superRefine((value, context) => {
      const maximum = value.disputeWindow.unit === "hours" ? 720 : 30;
      if (value.disputeWindow.duration > maximum) {
        context.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum,
          inclusive: true,
          type: "number",
          path: ["disputeWindow", "duration"],
          message: t("disputeWindowRange", { maximum }),
        });
      }
    });

  const methods = useForm<SecurityDepositRulesFormValues>({
    defaultValues: initialData,
    resolver: zodResolver(schema),
  });

  const { handleSubmit, control, reset } = methods;

  useEffect(() => {
    reset({
      depositRequired,
      depositAmount,
      depositConditions,
      disputeWindow: {
        duration: disputeWindow.duration,
        unit: disputeWindow.unit,
      },
    });
  }, [reset, depositRequired, depositAmount, depositConditions, disputeWindow.duration, disputeWindow.unit]);

  const {
    mutate: update,
    isPending: updating,
    error: updateError,
  } = useUpdateSecurityDepositRules();

  const onSubmit = (formData: SecurityDepositRulesFormValues) => {
    update({
      zoneId: zone,
      subCategoryId: subCategory,
      data: {
        ...formData,
        ...(formData.disputeWindow.unit === "days"
          ? { disputeWindowDays: formData.disputeWindow.duration }
          : {}),
      },
    });
  };

  if (isLoading) return <Loader />;
  if (error) return <ResponseError error={error?.message} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Switch
            name="depositRequired"
            label="securityDepositRules"
            control={control}
          />
          <TextInput
            name="depositAmount"
            label="depositAmount"
            type="number"
            control={control}
            placeholder={t("enterDepositAmount")}
          />
          <TextInput
            name="depositConditions"
            label="depositConditions"
            control={control}
            placeholder={t("enterDepositConditions")}
            type="textarea"
            className="col-span-2"
          />
          <TextInput
            name="disputeWindow.duration"
            label="disputeWindowDuration"
            type="number"
            control={control}
            placeholder={t("enterDisputeWindowDuration")}
          />
          <SelectInput
            name="disputeWindow.unit"
            label="disputeWindowUnit"
            control={control}
            options={disputeWindowUnitOptions}
          />
        </div>

        <p className="text-sm text-muted-foreground">
          {t("disputeWindowHelp")}
        </p>

        <div className="flex justify-end">
          <Button
            variant="button"
            type="submit"
            disabled={isLoading || updating}
          >
            {updating ? t("saving") : t("save")}
          </Button>
        </div>
        {updateError && (
          <p className="text-red-500">
            {updateError?.message || t("failedToUpdateSecurityDepositRules")}
          </p>
        )}
      </form>
    </FormProvider>
  );
};

export default SecurityDepositRules;
