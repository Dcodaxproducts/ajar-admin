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
import { Button } from "./ui/button";
import Loader from "./Loader";
import ResponseError from "./ResponseError";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

interface SecurityDepositRulesFormValues {
  depositRequired: boolean;
  depositAmount: number;
  depositConditions: string;
  disputeWindowDays: number;
}

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

  const {
    depositRequired = false,
    depositAmount = 0,
    depositConditions = "",
    disputeWindowDays = 7,
  } = data?.data?.securityDepositRules || {};

  const initialData = {
    depositRequired,
    depositAmount,
    depositConditions,
    disputeWindowDays,
  };

  const schema = z.object({
    depositRequired: z.boolean(),
    depositAmount: z.number(),
    depositConditions: z.string(),
    disputeWindowDays: z.number(),
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
      disputeWindowDays,
    });
  }, [reset, depositRequired, depositAmount, depositConditions, disputeWindowDays]);

  const {
    mutate: update,
    isPending: updating,
    error: updateError,
  } = useUpdateSecurityDepositRules();

  const onSubmit = (data: any) => {
    update({ zoneId: zone, subCategoryId: subCategory, data });
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
            name="disputeWindowDays"
            label="disputeWindowDays"
            type="number"
            control={control}
            placeholder={t("enterDisputeWindowDays")}
          />
        </div>

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
