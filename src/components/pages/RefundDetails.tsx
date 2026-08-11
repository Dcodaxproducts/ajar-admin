"use client";

import MyImage from "@/components/custom/MyImage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetRefundRequest,
  useUpdateRefundRequest,
} from "@/hooks/useRefundManagement";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Loader from "../Loader";
import ResponseError from "../ResponseError";
import Status from "../StatusBadge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, CheckCircle2 } from "lucide-react";

const RefundDetail = ({ id }: { id: string }) => {
  const t = useTranslations("translation");
  const { data: refundResponse, isLoading, error } = useGetRefundRequest(id);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateRefundRequest();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionNote, setRejectionNote] = useState("");

  if (isLoading) return <Loader />;
  if (error) return <ResponseError error={error.message} />;

  const {
    reason,
    user,
    deduction,
    totalRefundAmount,
    securityDeposit,
    status,
    note,
    createdAt,
    policy,
    booking,
    isEarlyReturn,
    breakdown,
  } = refundResponse?.data || {};

  const priceDetails = booking?.priceDetails;
  const penaltyPercentage = policy?.tiers?.[0]?.percentage;

  const adminFee = priceDetails?.adminFee ?? 0;
  const tax = priceDetails?.tax ?? 0;
  const secDep = securityDeposit ?? 0;

  // An early return keeps the platform fee — the rental actually ran — and the
  // deposit settles later through the damage dispute window instead.
  const totalToRenter = isEarlyReturn
    ? totalRefundAmount ?? 0
    : (totalRefundAmount ?? 0) + adminFee + tax + secDep;

  const lines = breakdown ?? [];
  const hasExtensions = lines.length > 1;

  const handleUpdateStatus = (newStatus: "accept" | "reject", adminNote?: string) => {
    updateStatus(
      { id, data: { status: newStatus, adminNote } },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectionNote("");
        },
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold">{t("refundRequest")}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{new Date(createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <Status value={status} />
                {isEarlyReturn && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                    Early Return
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                Renter Refund
              </p>
              <p className="text-3xl font-bold text-green-600">
                ${totalToRenter.toFixed(2)}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left — Reason & Note */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{t("reasonForRefund")}</h3>
                <p className="text-muted-foreground bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border italic break-words whitespace-pre-wrap">
                  &quot;{reason}&quot;
                </p>
              </div>

              {note && (
                <div>
                  <h4 className="text-lg font-semibold mb-1">{t("additionalNotes")}</h4>
                  <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap">
                    {note}
                  </p>
                </div>
              )}

              {isEarlyReturn && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 p-4 rounded-lg space-y-1.5">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                    Item was already picked up
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-500">
                    Platform fees are retained and the security deposit stays on hold
                    until the damage dispute window closes. Approving refunds each
                    booking and extension separately.
                  </p>
                </div>
              )}
            </div>

            {/* Right — Refund Breakdown */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border">
              <h3 className="text-lg font-semibold text-muted-foreground">{t("breakdown")}</h3>

              {/* Each extension is its own booking with its own PaymentIntent */}
              {hasExtensions && (
                <div className="space-y-1.5 pb-2 mb-1 border-b">
                  {lines.map((line: any) => (
                    <div key={line.booking} className="flex justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        {line.refundedAt && (
                          <CheckCircle2 size={12} className="text-emerald-600" />
                        )}
                        {line.isExtension ? "Extension" : "Booking"}
                      </span>
                      <span className="text-muted-foreground">
                        ${line.price?.toFixed(2)} − ${line.deductedAmount?.toFixed(2)} ={" "}
                        <span className="font-medium text-foreground">
                          ${line.refundAmount?.toFixed(2)}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Refundable Amount</span>
                <span className="font-medium">${totalRefundAmount?.toFixed(2)}</span>
              </div>

              {deduction > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cancellation Deduction</span>
                  <span className="text-red-500 font-medium">−${deduction.toFixed(2)}</span>
                </div>
              )}

              {adminFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Admin Fee {isEarlyReturn ? "(retained)" : "(returned)"}
                  </span>
                  {isEarlyReturn ? (
                    <span className="text-muted-foreground font-medium">${adminFee.toFixed(2)}</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">+${adminFee.toFixed(2)}</span>
                  )}
                </div>
              )}

              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tax {isEarlyReturn ? "(retained)" : "(returned)"}
                  </span>
                  {isEarlyReturn ? (
                    <span className="text-muted-foreground font-medium">${tax.toFixed(2)}</span>
                  ) : (
                    <span className="text-emerald-600 font-medium">+${tax.toFixed(2)}</span>
                  )}
                </div>
              )}

              {secDep > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Security Deposit {isEarlyReturn ? "(on hold)" : "(returned)"}
                  </span>
                  {isEarlyReturn ? (
                    <span className="text-amber-600 font-medium flex items-center gap-1">
                      <Clock size={13} />
                      ${secDep.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-emerald-600 font-medium">+${secDep.toFixed(2)}</span>
                  )}
                </div>
              )}

              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold">Total to Renter Wallet</span>
                <span className="text-xl font-bold text-green-600">
                  ${totalToRenter.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      {user && typeof user === "object" && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">{t("requesterInformation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <MyImage
                src={user?.profilePicture || ""}
                alt={user?.name || "User"}
                width={256}
                height={256}
                className="w-14 h-14 rounded-full object-cover border"
              />
              <div>
                <p className="text-base font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {status === "pending" && (
        <div className="flex justify-end gap-4 pt-2">
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
            onClick={() => handleUpdateStatus("accept")}
          >
            {isUpdating ? t("processing") : t("approve")}
          </Button>
        </div>
      )}

      {/* Rejection Dialog */}
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
              onClick={() => handleUpdateStatus("reject", rejectionNote)}
            >
              {isUpdating ? t("rejecting") : t("confirmReject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RefundDetail;
