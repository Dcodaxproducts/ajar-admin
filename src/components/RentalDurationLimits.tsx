"use client";

import {
  useGetRentalDurationLimits,
  useUpdateRentalDurationLimits,
} from "@/hooks/useRentalPolicies";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import SelectInput from "./forms/fields/SelectInput";
import Switch from "./forms/fields/Switch";
import TextInput from "./forms/fields/TextInput";
import Loader from "./Loader";
import ResponseError from "./ResponseError";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";
import { Trash2, Plus } from "lucide-react";

const priceUnitOptions = [
  { label: "hours", value: "hour" },
  { label: "days", value: "day" },
  { label: "months", value: "month" },
  { label: "years", value: "year" },
];

const schema = z.object({
  extensionAllowed: z.boolean(),
  rentalDurationLimits: z.array(
    z.object({
      appliesToPriceUnit: z.string().min(1),
      minimumDuration: z.object({
        value: z.coerce.number().min(1),
        unit: z.string(),
      }),
      maximumDuration: z.object({
        value: z.coerce.number().min(1),
        unit: z.string(),
      }),
    })
  ),
});

type RentalDurationFormValues = z.infer<typeof schema>;

const RentalDurationLimits = ({
  zone,
  subCategory,
}: {
  zone: string;
  subCategory: string;
}) => {
  const t = useTranslations("translation");
  const { data, isLoading, error } = useGetRentalDurationLimits(
    zone,
    subCategory
  );

  const methods = useForm<RentalDurationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      extensionAllowed: true,
      rentalDurationLimits: [],
    },
  });

  const { handleSubmit, control, reset, watch, setValue } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rentalDurationLimits",
  });

  const watchedLimits = watch("rentalDurationLimits") || [];
  const selectedUnits = watchedLimits.map((item) => item?.appliesToPriceUnit).filter(Boolean);

  const handlePriceUnitChange = (index: number, value: string, fieldOnChange: (v: string) => void) => {
    // Correctly update the form state for the target field
    fieldOnChange(value);
    // Sync the unit types for min/max
    setValue(`rentalDurationLimits.${index}.minimumDuration.unit`, value, { shouldDirty: true });
    setValue(`rentalDurationLimits.${index}.maximumDuration.unit`, value, { shouldDirty: true });
  };

  useEffect(() => {
    if (data?.data) {
      reset({
        extensionAllowed: data.data.extensionAllowed ?? true,
        rentalDurationLimits: Array.isArray(data.data.rentalDurationLimits) 
          ? data.data.rentalDurationLimits 
          : [],
      });
    }
  }, [reset, data]);

  const { mutate: update, isPending: updating } = useUpdateRentalDurationLimits();

  const onSubmit = (values: RentalDurationFormValues) => {
    update({ zoneId: zone, subCategoryId: subCategory, data: values });
  };

  if (isLoading) return <Loader />;
  if (error) return <ResponseError error={error?.message} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="p-4 border rounded-lg bg-white shadow-sm flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">{t("extensionPolicy")}</h3>
            <p className="text-xs text-muted-foreground">{t("globalExtensionNote")}</p>
          </div>
          <Switch name="extensionAllowed" label="extensionAllowed" control={control} />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-700 text-sm uppercase">{t("unitSpecificLimits")}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedUnits.length >= priceUnitOptions.length}
              onClick={() => {
                const remaining = priceUnitOptions.find(u => !selectedUnits.includes(u.value));
                const unitValue = remaining?.value || "day";
                append({
                  appliesToPriceUnit: unitValue,
                  minimumDuration: { value: 1, unit: unitValue },
                  maximumDuration: { value: 10, unit: unitValue },
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> {t("addPolicy")}
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg bg-gray-50/50 relative">
              <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
                <div>
                  <label className="text-xs font-bold mb-1 block">{t("appliesToPriceUnit")}</label>
                  <Controller
                    name={`rentalDurationLimits.${index}.appliesToPriceUnit`}
                    control={control}
                    render={({ field: controllerField }) => (
                      <SelectInput
                        {...controllerField}
                        onChange={(val: string) => handlePriceUnitChange(index, val, controllerField.onChange)}
                        options={priceUnitOptions.filter(
                          (opt) => !selectedUnits.includes(opt.value) || opt.value === controllerField.value
                        )}
                        labelKey="label"
                        valueKey="value"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold mb-1 block">{t("minimumDuration")}</label>
                  <div className="flex gap-2">
                    <TextInput name={`rentalDurationLimits.${index}.minimumDuration.value`} control={control} type="number" />
                    <SelectInput 
                      name={`rentalDurationLimits.${index}.minimumDuration.unit`} 
                      control={control} 
                      options={priceUnitOptions} 
                      labelKey="label" 
                      valueKey="value"
                      disabled={true}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold mb-1 block">{t("maximumDuration")}</label>
                  <div className="flex gap-2">
                    <TextInput name={`rentalDurationLimits.${index}.maximumDuration.value`} control={control} type="number" />
                    <SelectInput 
                      name={`rentalDurationLimits.${index}.maximumDuration.unit`} 
                      control={control} 
                      options={priceUnitOptions} 
                      labelKey="label" 
                      valueKey="value"
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" variant="button" disabled={updating}>
            {updating ? t("saving") : t("save")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default RentalDurationLimits;
