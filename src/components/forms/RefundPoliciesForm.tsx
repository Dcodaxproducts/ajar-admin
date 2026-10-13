"use client";

import { limit } from "@/config/constants";
import {
  useGetRefundPolicy,
  useSaveRefundPolicy,
} from "@/hooks/useRefundManagement";
import { useGetZone, useGetZones } from "@/hooks/useZones";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { H4 } from "../Typography";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import Switch from "./fields/Switch";
import TextInput from "./fields/TextInput";
import { useTranslations } from "next-intl";
import { Trash2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import {
  validateTierThresholds,
  type CancellationTier,
  type EarlyReturnTier,
  type RefundPolicyPayload,
} from "@/lib/refundPolicy";

type RefundPolicyFormValues = RefundPolicyPayload;

const DEFAULT_TIER: CancellationTier = {
  hoursBeforeCheckIn: 0,
  percentage: 0,
  label: "",
};

const DEFAULT_EARLY_RETURN_TIER: EarlyReturnTier = {
  hoursBeforeCheckOut: 0,
  percentage: 0,
  label: "",
};

// ─── component ───────────────────────────────────────────────────────────────

const RefundPoliciesForm = () => {
  const t = useTranslations("translation");

  const [page] = useState(1);
  const [zone, setZone] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // ── fetching ───────────────────────────────────────────────────────────────

  const { data: zonesData, isLoading: zonesLoading } = useGetZones({
    page,
    limit,
  });
  const zones = zonesData?.data?.zones ?? [];

  const {
    data: zoneDetails,
    isLoading: zoneLoading,
    error: zoneError,
  } = useGetZone(zone, !!zone);
  const subCategories = zoneDetails?.data?.subCategories ?? [];

  const { data: refundPolicy, isLoading: refundPolicyLoading } =
    useGetRefundPolicy(zone, subCategory);

  const refundPolicyData = useMemo(
    () => refundPolicy?.data ?? null,
    [refundPolicy]
  );

  // ── form ───────────────────────────────────────────────────────────────────

  const methods = useForm<RefundPolicyFormValues>({
    defaultValues: {
      allowRefund: false,
      noteText: "",
      tiers: [],
      earlyReturnTiers: [],
    },
  });

  const { control, handleSubmit, reset } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tiers",
  });

  const {
    fields: earlyReturnFields,
    append: appendEarlyReturnTier,
    remove: removeEarlyReturnTier,
  } = useFieldArray({
    control,
    name: "earlyReturnTiers",
  });

  useEffect(() => {
    if (refundPolicyData) {
      reset({
        allowRefund: refundPolicyData.allowRefund ?? false,
        noteText: refundPolicyData.noteText ?? "",
        tiers: refundPolicyData.tiers ?? [],
        earlyReturnTiers: refundPolicyData.earlyReturnTiers ?? [],
      });
    } else {
      reset({
        allowRefund: false,
        noteText: "",
        tiers: [],
        earlyReturnTiers: [],
      });
    }
  }, [refundPolicyData, reset]);

  // ── mutation ───────────────────────────────────────────────────────────────

  const { mutateAsync: saveRefundPolicy, isPending } = useSaveRefundPolicy();

  const onSubmit = async (values: RefundPolicyFormValues) => {
    if (!zone || !subCategory) return;
    const validationKey = validateTierThresholds(values);
    if (validationKey) {
      toast.error(t(validationKey));
      return;
    }

    await saveRefundPolicy({
      zone,
      subCategory,
      data: {
        ...values,
        tiers: values.tiers.map((tier) => ({
          hoursBeforeCheckIn: Number(tier.hoursBeforeCheckIn),
          percentage: Number(tier.percentage),
          label: tier.label.trim(),
        })),
        earlyReturnTiers: values.earlyReturnTiers.map((tier) => ({
          hoursBeforeCheckOut: Number(tier.hoursBeforeCheckOut),
          percentage: Number(tier.percentage),
          label: tier.label.trim(),
        })),
      },
    });
  };

  const disabled =
    zonesLoading || zoneLoading || refundPolicyLoading || isPending;

  const canSubmit = !!zone && !!subCategory && !disabled;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Zone + SubCategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("zone")}</Label>
            <Select
              value={zone}
              onValueChange={(val) => {
                setZone(val);
                setSubCategory("");
              }}
              disabled={zonesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={zonesLoading ? t("loading") : t("selectZone")}
                />
              </SelectTrigger>
              <SelectContent>
                {zones.map((z: any) => (
                  <SelectItem key={z._id} value={z._id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t("subCategory")}</Label>
            <Select
              value={subCategory}
              onValueChange={setSubCategory}
              disabled={!zone || zoneLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    zoneLoading ? t("loading") : t("selectCategory")
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {subCategories.map((sc: any) => (
                  <SelectItem key={sc._id} value={sc._id}>
                    {sc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {zoneError && (
              <p className="text-sm text-destructive">{zoneError.message}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Allow refund + note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Switch name="allowRefund" label="allowRefund" control={control} />
          <TextInput
            name="noteText"
            label="noteText"
            control={control}
            placeholder={t("enterValue", { value: t("noteText") })}
            type="textarea"
          />
        </div>

        <Separator />

        {/* Cancellation tiers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <H4>{t("cancellationTiers")}</H4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append(DEFAULT_TIER)}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              {t("addTier")}
            </Button>
          </div>

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              {t("noTiersAdded")}
            </p>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg"
            >
              <TextInput
                name={`tiers.${index}.hoursBeforeCheckIn`}
                label="hoursBeforeCheckIn"
                type="number"
                control={control}
                placeholder="0"
                min={0}
                step={1}
                rules={{
                  required: t("requiredField"),
                  min: { value: 0, message: t("minZero") },
                  validate: (value) => Number.isSafeInteger(Number(value)) || t("wholeNumbersRequired"),
                }}
              />

              <TextInput
                name={`tiers.${index}.percentage`}
                label="deductionPercentage"
                type="number"
                control={control}
                placeholder="0"
                min={0}
                max={100}
                step={1}
                rules={{
                  required: t("requiredField"),
                  min: { value: 0, message: t("minZero") },
                  max: { value: 100, message: t("max100") },
                  validate: (value) => Number.isSafeInteger(Number(value)) || t("wholeNumbersRequired"),
                }}
              />

              <TextInput
                name={`tiers.${index}.label`}
                label="tierLabel"
                type="text"
                control={control}
                placeholder={t("eg_earlyCancel")}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={disabled}
                className="text-destructive hover:text-destructive self-end mb-1"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>

        {/* Early return tiers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <H4>{t("earlyReturnTiers")}</H4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendEarlyReturnTier(DEFAULT_EARLY_RETURN_TIER)}
              disabled={disabled}
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              {t("addTier")}
            </Button>
          </div>

          {earlyReturnFields.length === 0 && (
            <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
              {t("noEarlyReturnTiersAdded")}
            </p>
          )}

          {earlyReturnFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end p-4 border rounded-lg"
            >
              <TextInput
                name={`earlyReturnTiers.${index}.hoursBeforeCheckOut`}
                label="hoursBeforeCheckOut"
                type="number"
                control={control}
                placeholder="0"
                min={0}
                step={1}
                rules={{
                  required: t("requiredField"),
                  min: { value: 0, message: t("minZero") },
                  validate: (value) => Number.isSafeInteger(Number(value)) || t("wholeNumbersRequired"),
                }}
              />

              <TextInput
                name={`earlyReturnTiers.${index}.percentage`}
                label="deductionPercentage"
                type="number"
                control={control}
                placeholder="0"
                min={0}
                max={100}
                step={1}
                rules={{
                  required: t("requiredField"),
                  min: { value: 0, message: t("minZero") },
                  max: { value: 100, message: t("max100") },
                  validate: (value) => Number.isSafeInteger(Number(value)) || t("wholeNumbersRequired"),
                }}
              />

              <TextInput
                name={`earlyReturnTiers.${index}.label`}
                label="tierLabel"
                type="text"
                control={control}
                placeholder={t("eg_earlyReturn")}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEarlyReturnTier(index)}
                disabled={disabled}
                className="text-destructive hover:text-destructive self-end mb-1"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <Button type="submit" variant="button" disabled={!canSubmit}>
            {isPending ? t("saving") : t("saveInformation")}
          </Button>
        </div>

      </form>
    </FormProvider>
  );
};

export default RefundPoliciesForm;


// "use client";

// import { limit } from "@/config/constants";
// import {
//   useGetRefundPolicy,
//   useSaveRefundPolicy,
// } from "@/hooks/useRefundManagement";
// import { useGetZone, useGetZones } from "@/hooks/useZones";
// import { useEffect, useMemo, useState } from "react";
// import { FormProvider, useForm } from "react-hook-form";
// import { H4 } from "../Typography";
// import { Button } from "../ui/button";
// import { Label } from "../ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Separator } from "../ui/separator";
// import SelectInput from "./fields/SelectInput";
// import Switch from "./fields/Switch";
// import TextInput from "./fields/TextInput";
// import { useTranslations } from "next-intl";

// const RefundPoliciesForm = () => {
//   const t = useTranslations("translation");
//   const [page, setPage] = useState(1);
//   const [zone, setZone] = useState("");
//   const [subCategory, setSubCategory] = useState("");

//   const { data, isLoading, error } = useGetZones({ page, limit });
//   const zones = data?.data?.zones;

//   const {
//     data: zoneDetails,
//     isLoading: zoneLoading,
//     error: zoneError,
//   } = useGetZone(zone, !!zone);
//   const subCategories = zoneDetails?.data?.subCategories || [];

//   const { data: refundPolicy, isLoading: refundPolicyLoading } =
//     useGetRefundPolicy(zone, subCategory);

//   const refundPolicyData = useMemo(
//     () => refundPolicy?.data || {},
//     [refundPolicy]
//   );

//   const methods = useForm({
//     defaultValues: {
//       allowFund: refundPolicyData?.allowFund || false,
//       refundWindow: refundPolicyData?.refundWindow || "",
//       cancellationCutoffTime: {
//         days: refundPolicyData?.cancellationCutoffTime?.days || 0,
//         hours: refundPolicyData?.cancellationCutoffTime?.hours || 0,
//       },
//       flatFee: {
//         amount: refundPolicyData?.flatFee?.amount || 0,
//         days: refundPolicyData?.flatFee?.days || 0,
//         hours: refundPolicyData?.flatFee?.hours || 0,
//       },
//       noteText: refundPolicyData?.noteText || "",
//     },
//   });

//   useEffect(() => {
//     if (refundPolicyData) {
//       const currentValues = methods.getValues();
//       const newValues = {
//         allowFund: refundPolicyData?.allowFund || false,
//         refundWindow: refundPolicyData?.refundWindow || "",
//         cancellationCutoffTime: {
//           days: refundPolicyData?.cancellationCutoffTime?.days || 0,
//           hours: refundPolicyData?.cancellationCutoffTime?.hours || 0,
//         },
//         flatFee: {
//           amount: refundPolicyData?.flatFee?.amount || 0,
//           days: refundPolicyData?.flatFee?.days || 0,
//           hours: refundPolicyData?.flatFee?.hours || 0,
//         },
//         noteText: refundPolicyData?.noteText || "",
//       };

//       if (JSON.stringify(currentValues) !== JSON.stringify(newValues)) {
//         methods.reset(newValues);
//       }
//     }
//   }, [refundPolicyData, methods]);

//   const {
//     handleSubmit,
//     control,
//     formState: { isSubmitting },
//   } = methods;

//   const {
//     mutateAsync: saveRefundPolicy,
//     isPending,
//     error: saveRefundPolicyError,
//   } = useSaveRefundPolicy();

//   const onSubmit = (data: any) => {
//     saveRefundPolicy({
//       zone,
//       subCategory,
//       data,
//     });
//   };

//   const disabled = isLoading || zoneLoading || refundPolicyLoading || isPending;

//   return (
//     <FormProvider {...methods}>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div className="space-y-2">
//             <Label>{t("zone")}</Label>
//             <Select value={zone} onValueChange={setZone} disabled={isLoading}>
//               <SelectTrigger className="w-full" disabled={isLoading}>
//                 <SelectValue
//                   placeholder={isLoading ? t("loading") : t("selectZone")}
//                 />
//               </SelectTrigger>
//               <SelectContent>
//                 {zones?.map((zone: any) => (
//                   <SelectItem key={zone._id} value={zone._id}>
//                     {zone.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//           <div className="space-y-2">
//             <Label>{t("subCategory")}</Label>
//             <div>
//               <Select
//                 value={subCategory}
//                 onValueChange={setSubCategory}
//                 disabled={isLoading || zoneLoading}
//               >
//                 <SelectTrigger
//                   className="w-full"
//                   disabled={isLoading || zoneLoading}
//                 >
//                   <SelectValue
//                     placeholder={
//                       isLoading || zoneLoading
//                         ? t("loading")
//                         : t("selectCategory")
//                     }
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {subCategories?.map((subCategory: any) => (
//                     <SelectItem key={subCategory._id} value={subCategory._id}>
//                       {subCategory.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               {zoneError && (
//                 <p className="text-red-500">{zoneError?.message}</p>
//               )}
//             </div>
//           </div>

//           <Switch name="allowFund" label="allowRefund" control={control} />

//           <div className="grid grid-cols-2 gap-4">
//             <TextInput
//               name="cancellationCutoffTime.days"
//               label="cutoffTimeDays"
//               type="number"
//               control={control}
//               placeholder={t("days")}
//               min={0}
//             />
//             <TextInput
//               name="cancellationCutoffTime.hours"
//               label="hours"
//               type="number"
//               control={control}
//               placeholder={t("hours")}
//               min={0}
//             />
//           </div>

//           <Separator className="md:col-span-2 mt-4" />
//           <div className="space-y-2 grid md:col-span-2">
//             <H4>{t("flatFee")}</H4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <TextInput
//                 name="flatFee.amount"
//                 label="amountSymbol"
//                 type="number"
//                 control={control}
//                 placeholder={t("amount")}
//                 min={0}
//               />
//               <div className="grid grid-cols-2 gap-4">
//                 <TextInput
//                   name="flatFee.days"
//                   label="timeDays"
//                   type="number"
//                   control={control}
//                   placeholder={t("days")}
//                   min={0}
//                 />
//                 <TextInput
//                   name="flatFee.hours"
//                   label="timeHours"
//                   type="number"
//                   control={control}
//                   placeholder={t("hours")}
//                   min={0}
//                 />
//               </div>
//             </div>
//             <Separator className="mt-4" />
//           </div>

//           <SelectInput
//             name="refundWindow"
//             label="refundWindow"
//             control={control}
//             options={[
//               { value: "full", label: t("full") },
//               { value: "partial", label: t("partial") },
//               { value: "custom", label: t("custom") },
//             ]}
//             disabled={!zone || zoneLoading}
//             isTranslations={false}
//             loading={zoneLoading}
//           />
//           <TextInput
//             name="noteText"
//             label="noteText"
//             control={control}
//             placeholder={t("enterValue", { value: t("noteText") })}
//             type="textarea"
//           />
//         </div>

//         <div className="flex items-center justify-end gap-4">
//           <Button type="submit" variant="button" disabled={disabled}>
//             {isPending ? t("saving") : t("saveInformation")}
//           </Button>
//         </div>
//       </form>
//     </FormProvider>
//   );
// };

// export default RefundPoliciesForm;
