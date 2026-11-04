"use client";

import { useTranslations } from "next-intl";
import type { ListingParameter } from "@/types";
import { getImageUrl } from "@/utils/getImageUrl";
import MyImage from "@/components/custom/MyImage";

const isAttachmentType = (type: string) =>
  ["file", "document", "image", "images"].includes(type.toLowerCase());

const displayValue = (parameter: ListingParameter): unknown =>
  parameter.displayValue ?? parameter.value;

const hasValue = (value: unknown) =>
  value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length > 0);

const safeText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (["number", "bigint"].includes(typeof value)) return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const safeAttachmentUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("/")) return getImageUrl(trimmed);
  try {
    const url = new URL(trimmed);
    return ["http:", "https:"].includes(url.protocol) ? trimmed : undefined;
  } catch {
    return undefined;
  }
};

const isImageAttachment = (type: string, value: string) =>
  ["image", "images"].includes(type.toLowerCase()) || /\.(png|jpe?g|gif|webp|bmp)(\?.*)?$/i.test(value);

export default function ListingReviewParameters({ parameters }: { parameters: ListingParameter[] }) {
  const t = useTranslations("translation");
  const ordered = [...parameters].sort((left, right) => left.order - right.order);

  if (ordered.length === 0) return null;

  return (
    <section className="space-y-3" aria-labelledby="listing-parameters-title">
      <h3 id="listing-parameters-title" className="text-lg font-semibold">
        {t("listingParameters")}
      </h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ordered.map((parameter) => {
          const value = displayValue(parameter);
          const values = Array.isArray(value) ? value : [value];
          const missing = parameter.submitted === false || !hasValue(value);

          return (
            <div key={parameter.fieldId || parameter.key} className="rounded-lg border bg-muted/20 p-4">
              <p className="text-xs text-muted-foreground">{parameter.label}</p>
              {missing ? (
                <p className="mt-1 font-medium text-muted-foreground">{t("notProvided")}</p>
              ) : isAttachmentType(parameter.type) ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {values.map((item, index) => {
                    const url = safeAttachmentUrl(item);
                    if (!url) {
                      return <span key={index} className="text-sm text-muted-foreground">{t("invalidValue")}</span>;
                    }
                    return isImageAttachment(parameter.type, url) ? (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                        <MyImage src={typeof item === "string" ? item : url} alt={parameter.label} width={96} height={96} className="h-24 w-24 rounded-md border object-cover" />
                      </a>
                    ) : (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                        {t("viewAttachment")} {values.length > 1 ? index + 1 : ""}
                      </a>
                    );
                  })}
                </div>
              ) : typeof value === "boolean" ? (
                <p className="mt-1 font-medium">{value ? t("yes") : t("no")}</p>
              ) : Array.isArray(value) ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {value.map((item, index) => (
                    <span key={`${safeText(item)}-${index}`} className="rounded-full border bg-background px-2.5 py-1 text-sm">
                      {safeText(item)}
                    </span>
                  ))}
                </div>
              ) : typeof value === "object" ? (
                <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words text-sm font-medium">{safeText(value)}</pre>
              ) : (
                <p className="mt-1 break-words font-medium">{safeText(value)}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
