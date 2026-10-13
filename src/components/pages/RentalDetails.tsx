"use client";

import MyImage from "@/components/custom/MyImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useRentalListing,
  useUpdateRentalListing,
} from "@/hooks/useRentalListings";
import { User } from "@/types";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import Loader from "../Loader";
import ResponseError from "../ResponseError";
import { Button } from "../ui/button";
import { getImageUrl } from "@/utils/getImageUrl";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ListingReviewParameters from "@/components/ListingReviewParameters";
import type { ListingParameter } from "@/types";

type ListingDocument = {
  _id: string;
  name: string;
  fileUrl: string;
  expiryDate?: string;
  isExpired?: boolean;
  reminderSent?: boolean;
};

type DynamicPricing = {
  price?: number;
  startDate?: string;
  endDate?: string;
};

const RentalListingDetail = ({ id }: { id: string }) => {
  const t = useTranslations("translation");
  const { data: rentalRequest, isLoading, error } = useRentalListing(id);
  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateRentalListing();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");

  if (isLoading) return <Loader />;
  if (error) return <ResponseError error={error.message} />;
  const {
    name,
    subTitle,
    description,
    price,
    priceUnit,
    images,
    rentalImages,
    createdAt,
    subCategory,
    leaser: leaser,
    zone,
    location,
    status,
    rejectionNote: listingRejectionNote,
    documents,
    unavailability,
    dynamicPricing,
    parameters,
  }: {
    name?: string;
    subTitle?: string;
    description?: string;
    price?: number;
    priceUnit?: string;
    images?: string[];
    rentalImages?: string[];
    createdAt?: string;
    subCategory?: { name?: string; category?: { name?: string } };
    leaser?: User;
    zone?: { name?: string };
    location?: { address?: string };
    status?: "pending" | "approved" | "rejected" | string;
    rejectionNote?: string | null;
    documents?: ListingDocument[];
    unavailability?: string[];
    dynamicPricing?: DynamicPricing | DynamicPricing[];
    parameters?: ListingParameter[];
  } = rentalRequest?.data || {};
  const cleanedData = removeFields(rentalRequest?.data as any, [
    "_id", "leaser", "subCategory", "zone", "ratings", "name", "subTitle",
    "images", "rentalImages", "description", "price", "isActive", "language",
    "documents", "isAvailable", "currentBookingId", "status", "priceUnit",
    "createdAt", "updatedAt", "__v", "userDocuments", "leaserDocuments",
    "adminFee", "tax", "languages", "averageRating", "totalReviews", "rejectionNote", "location", "refundNote", "refundNote", "bookings", "reviews", "unavailability", "dynamicPricing", "dropoffLocation", "timezone", "rentalPolicy", "parameters", "approvalStatus"
  ]);
  const detailEntries = Object.entries(cleanedData).filter(([, value]) =>
    hasDisplayValue(value)
  );
  const dynamicPricingEntries = Array.isArray(dynamicPricing)
    ? dynamicPricing
    : dynamicPricing
      ? [dynamicPricing]
      : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{name}</CardTitle>
          {subTitle && (
            <p className="text-sm text-muted-foreground">{subTitle}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="font-medium text-muted-foreground">
              {subCategory?.category?.name} / {subCategory?.name}
            </span>
            <span className="text-muted-foreground">
              {new Date(createdAt || "").toLocaleDateString()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Images */}
          <PhotoProvider>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...(images || []), ...(rentalImages || [])]?.map(
                (image, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-lg border shadow hover:shadow-lg cursor-pointer"
                  >
                    <PhotoView src={getImageUrl(image)}>
                      <MyImage
                        src={image}
                        alt={`Image ${index + 1}`}
                        width={500}
                        height={500}
                        className="w-full h-40 object-cover hover:scale-105 transition-transform"
                      />
                    </PhotoView>
                  </div>
                )
              )}
            </div>
          </PhotoProvider>

          {/* Description */}
          {description && (
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{t("description")}</h3>
              <p className="text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Common Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <InfoItem label={t("zone")} value={zone?.name} />
            <InfoItem label={t("location")} value={location?.address} />
            <InfoItem label={t("status")} value={status} />
          </div>

          {listingRejectionNote && (
            <div className="space-y-1 rounded-lg border border-red-200 bg-red-50/70 p-4">
              <h3 className="text-sm font-semibold text-red-700">
                {t("rejectionNote")}
              </h3>
              <p className="text-sm text-red-700 whitespace-pre-line">
                {listingRejectionNote}
              </p>
            </div>
          )}

          <ListingReviewParameters parameters={parameters ?? []} />

          {detailEntries.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {detailEntries.map(([key, value]) => (
                <InfoItem
                  key={key}
                  label={formatDynamicLabel(key)}
                  value={formatDynamicValue(value)}
                />
              ))}
            </div>
          )}

          {/* Price */}
          <p className="text-2xl text-green-600">
            <span className="font-bold">${price?.toLocaleString()}</span>/{priceUnit}
          </p>
        </CardContent>
      </Card>

      {(dynamicPricingEntries.length > 0 ||
        (Array.isArray(unavailability) && unavailability.length > 0)) && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Availability & Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {dynamicPricingEntries.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Dynamic Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dynamicPricingEntries.map((item, index) => (
                    <div
                      key={`${item.startDate || "start"}-${item.endDate || "end"}-${index}`}
                      className="rounded-lg border bg-slate-50/50 p-4"
                    >
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <InfoItem
                          label="Price"
                          value={formatPrice(item.price, priceUnit)}
                        />
                        <InfoItem
                          label="Date Range"
                          value={formatDateRange(item.startDate, item.endDate)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Array.isArray(unavailability) && unavailability.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Unavailability</h3>
                <div className="flex flex-wrap gap-2">
                  {unavailability.map((date) => (
                    <span
                      key={date}
                      className="rounded-full border bg-slate-50 px-3 py-1 text-sm font-medium text-muted-foreground"
                    >
                      {formatDisplayDate(date)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Documents Card */}
      {Array.isArray(documents) && documents.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">
              {t("documents")}{" "}
              <span className="text-sm text-muted-foreground">
                ({documents.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {documents.map((doc: any) => {
              const url = normalizeSafeUrl(doc.fileUrl);
              const isExpired = doc.isExpired;
              const isExpiringSoon = doc.reminderSent && !doc.isExpired;

              return (
                <div key={doc._id} className="p-4 border rounded-lg space-y-3 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="text-base font-semibold capitalize flex items-center gap-2">
                      {doc.name?.replaceAll?.("_", " ") || "Document"}

                      {/* --- Status Badges --- */}
                      {isExpired && (
                        <span className="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 border border-red-200 rounded-full uppercase font-bold">
                          {t("expired")}
                        </span>
                      )}
                      {isExpiringSoon && (
                        <span className="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-600 border border-amber-200 rounded-full uppercase font-bold">
                          {t("expiringSoon")}
                        </span>
                      )}
                    </div>

                    {doc.expiryDate && (
                      <span className="text-xs text-muted-foreground">
                        {t("expiry")}: {new Date(doc.expiryDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {url && isImage(url) ? (
                      <PhotoProvider>
                        <PhotoView src={getImageUrl(url)}>
                          <div className="relative group">
                            <MyImage
                              width={120}
                              height={120}
                              src={url}
                              alt={doc.name}
                              className={`h-24 w-24 object-cover rounded-md border shadow-sm cursor-zoom-in transition-opacity ${isExpired ? 'opacity-50 grayscale' : ''}`}
                            />
                          </div>
                        </PhotoView>
                      </PhotoProvider>
                    ) : url ? (
                      <a
                        href={getImageUrl(url)}
                        target="_blank"
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span className="p-2 bg-blue-50 rounded">View Attachment</span>
                      </a>
                    ) : (
                      <span className="text-xs text-destructive italic">No file available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {leaser && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">{t("leaserInformation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <UserCard user={leaser} />
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {status === "pending" && !documents?.some((doc) => doc.isExpired) && (
        <div className="flex justify-end gap-4">
          <Button
            variant="destructive"
            disabled={isUpdating}
            onClick={() => setRejectDialogOpen(true)}
          >
            {t("reject")}
          </Button>
          <Button
            variant="success"
            disabled={isUpdating}
            onClick={() => updateStatus({ id, status: "approved" })}
          >
            {t("approve")}
          </Button>
        </div>
      )}

      {/* Rejection Note Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("rejectionNote")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Textarea
              id="rejectionNote"
              className="min-h-30"
              placeholder={t("rejectionNotePlaceholder")}
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionNote("");
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectionNote.trim() || isUpdating}
              onClick={() => {
                updateStatus(
                  { id, status: "rejected", rejectionNote },
                  {
                    onSuccess: () => {
                      setRejectDialogOpen(false);
                      setRejectionNote("");
                    },
                  }
                );
              }}
            >
              {isUpdating ? t("rejecting") : t("confirmReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentalListingDetail;

const UserCard = ({ user }: { user: User }) => (
  <div className="flex items-center gap-4">
    <PhotoProvider>
      <PhotoView src={getImageUrl(user?.profilePicture || "")}>
        <div className="cursor-pointer overflow-hidden rounded-full border shadow-sm hover:opacity-90 transition-opacity">
          <MyImage
            src={user?.profilePicture || ""}
            alt={user?.name || ""}
            width={256}
            height={256}
            className="w-14 h-14 object-cover"
          />
        </div>
      </PhotoView>
    </PhotoProvider>
    <div>
      <p className="text-base font-medium">{user.name}</p>
      <p className="text-sm text-muted-foreground">{user?.email}</p>
    </div>
  </div>
);

const InfoItem = ({ label, value }: { label: string; value?: ReactNode }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-medium">{value || "-"}</p>
  </div>
);

/** Utils (local to this component) */
const isImage = (u: string) => /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(u);
const isPdf = (u: string) => /\.pdf$/i.test(u);

const formatDisplayDate = (date?: string) => {
  if (!date) return "-";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return parsedDate.toLocaleDateString();
};

const formatDateRange = (startDate?: string, endDate?: string) => {
  const start = formatDisplayDate(startDate);
  const end = formatDisplayDate(endDate);

  if (start === "-" && end === "-") return "-";
  if (start === end) return start;
  return `${start} - ${end}`;
};

const formatPrice = (price?: number, unit?: string) => {
  if (price === null || price === undefined) return "-";
  return `$${price.toLocaleString()}${unit ? `/${unit}` : ""}`;
};

const removeFields = <T extends Record<string, any>>(
  data: T | null | undefined,
  fields: string[]
) => {
  if (!data || typeof data !== "object") return {};

  return Object.fromEntries(
    Object.entries(data).filter(([key]) => !fields.includes(key))
  );
};

const hasDisplayValue = (value: any) => {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
};

const formatDynamicLabel = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const formatDynamicValue = (value: any): ReactNode => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    if (value.every((item) => ["string", "number", "boolean"].includes(typeof item))) {
      return value.map(formatDynamicValue).join(", ");
    }

    return (
      <span className="whitespace-pre-wrap break-words">
        {JSON.stringify(value, null, 2)}
      </span>
    );
  }
  if (typeof value === "object") {
    return (
      <span className="whitespace-pre-wrap break-words">
        {JSON.stringify(value, null, 2)}
      </span>
    );
  }

  return String(value);
};

/**
 * Normalize and guard against obviously bad URLs (e.g., "www://...").
 * We keep uploads (/uploads/...) and http(s) and data URLs.
 */
function normalizeSafeUrl(u: string) {
  if (!u || typeof u !== "string") return "";
  const trimmed = u.trim();
  const allowed =
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/uploads/") ||
    trimmed.startsWith("data:");
  if (!allowed) return ""; // skip weird schemes like "www://"
  return trimmed;
}
