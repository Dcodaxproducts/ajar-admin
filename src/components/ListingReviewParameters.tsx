"use client";

import { useTranslations } from "next-intl";
import type { ListingParameter } from "@/types";
import { getImageUrl } from "@/utils/getImageUrl";
import MyImage from "@/components/custom/MyImage";

const asValues = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [value];

const isAttachmentType = (type: string) =>
  ["file", "document", "image", "images"].includes(type.toLowerCase());

const displayValue = (parameter: ListingParameter): unknown =>
  parameter.displayValue ?? parameter.value;

export const hasListingParameterValue = (parameter: ListingParameter) => {
  const value = displayValue(parameter);
  if (value === null || value === undefined || value === "") return false;
  return !Array.isArray(value) || value.length > 0;
};

export default function ListingReviewParameters({
  parameters,
}: {
  parameters: ListingParameter[];
}) {
  const t = useTranslations("translation");
  const visible = [...parameters]
    .filter(hasListingParameterValue)
    .sort((left, right) => left.order - right.order);

  if (visible.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="listing-parameters-title">
      <h3 id="listing-parameters-title" className="text-lg font-semibold">
        {t("listingParameters")}
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {visible.map((parameter) => {
          const value = displayValue(parameter);
          const values = asValues(value);
          const attachments = isAttachmentType(parameter.type);

          return (
            <div key={parameter.key} className="rounded-lg border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">{parameter.label}</p>
              {attachments ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {values.map((item, index) => {
                    const url = typeof item === "string" ? item : "";
                    if (!url) return null;
                    const isImage = /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(url);
                    return isImage ? (
                      <a key={url} href={getImageUrl(url)} target="_blank" rel="noreferrer">
                        <MyImage src={url} alt={parameter.label} width={96} height={96} className="h-24 w-24 rounded-md border object-cover" />
                      </a>
                    ) : (
                      <a key={url} href={getImageUrl(url)} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                        {t("viewAttachment")} {values.length > 1 ? index + 1 : ""}
                      </a>
                    );
                  })}
                </div>
              ) : typeof value === "boolean" ? (
                <p className="mt-1 font-medium">{value ? t("yes") : t("no")}</p>
              ) : Array.isArray(value) ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {value.map((item) => (
                    <span key={String(item)} className="rounded-full border bg-background px-2.5 py-1 text-sm">{String(item)}</span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 break-words font-medium">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
