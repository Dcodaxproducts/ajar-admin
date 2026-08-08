"use client";

import MyImage from "@/components/custom/MyImage";
import ResponseError from "@/components/ResponseError";
import Status from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetTicket, useUpdateTicketStatus } from "@/hooks/useTickets";
import { format } from "date-fns";
import TicketDetailSkeleton from "../skeletons/TicketSkeleton";
import { useTranslations } from "next-intl";
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { getImageUrl } from "@/utils/getImageUrl";
import { useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays, CalendarCheck, DollarSign,
  AlertCircle, Mail, FileText, Paperclip, Users,
} from "lucide-react";

type TicketAction = "approved" | "rejected" | "partially_approved";

const TicketDetail = ({ id }: { id: string }) => {
  const t = useTranslations("translation");
  const tStatus = useTranslations("status");
  const { data, isLoading, error } = useGetTicket(id, true);
  const { mutate: updateTicketStatus, isPending } = useUpdateTicketStatus();
  const [partialDialogOpen, setPartialDialogOpen] = useState(false);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [pendingAction, setPendingAction] = useState<TicketAction | null>(null);
  const ticket = data?.data;

  if (isLoading) return <TicketDetailSkeleton />;
  if (error) return <ResponseError error={error.message} />;
  if (!ticket) return null;

  const { booking, rentalText, issueType, damagedCharges, attachments, status, createdAt } = ticket;
  const securityDeposit = Number(booking?.priceDetails?.securityDeposit || 0);
  const partialAmount = Number(approvedAmount);
  const isPartialAmountValid = partialAmount > 0 && partialAmount <= securityDeposit;

  // renter and leaser from populated booking
  const renter = booking?.renter;
  const leaser = booking?.leaser;

  const handlePartialAmountChange = (value: string) => {
    if (value === "") {
      setApprovedAmount("");
      return;
    }

    const nextAmount = Number(value);
    if (Number.isNaN(nextAmount)) return;

    setApprovedAmount(String(Math.min(nextAmount, securityDeposit)));
  };

  const handlePartialApproval = () => {
    if (!isPartialAmountValid) {
      toast.error(t("partialApprovalAmountError"));
      return;
    }

    setPendingAction("partially_approved");
    updateTicketStatus(
      { id, status: "partially_approved", approvedAmount: partialAmount },
      {
        onSuccess: () => {
          setPartialDialogOpen(false);
          setApprovedAmount("");
        },
        onSettled: () => setPendingAction(null),
      }
    );
  };

  const handleStatusUpdate = (nextStatus: "approved" | "rejected") => {
    setPendingAction(nextStatus);
    updateTicketStatus(
      { id, status: nextStatus },
      { onSettled: () => setPendingAction(null) }
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <Card className="shadow-lg gap-2">
        <CardHeader className="border-b">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold">
                {t("tickets")} #{id.slice(-8).toUpperCase()}
              </CardTitle>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {createdAt && (
                  <>
                    <span>{format(new Date(createdAt), "PPp")}</span>
                    <span>•</span>
                  </>
                )}
                <Status value={tStatus(status.toLowerCase())} />
              </div>
            </div>
            {damagedCharges > 0 && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  {t("damagedCharges")}
                </p>
                <p className="text-3xl font-bold text-destructive">
                  ${Number(damagedCharges).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Issue Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem icon={<AlertCircle className="w-4 h-4" />} label={t("type")} value={issueType} />
            <InfoItem icon={<DollarSign className="w-4 h-4" />} label={t("damagedCharges")} value={`$${Number(damagedCharges || 0).toFixed(2)}`} />
            {ticket.approvedAmount !== undefined && (
              <InfoItem icon={<DollarSign className="w-4 h-4" />} label={t("approvedAmount")} value={`$${Number(ticket.approvedAmount || 0).toFixed(2)}`} />
            )}
          </div>

          {rentalText && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">{t("details")}</h3>
              </div>
              <p className="text-sm text-muted-foreground bg-muted p-4 rounded-lg border break-words whitespace-pre-wrap first-letter:uppercase">
                {rentalText}
              </p>
            </div>
          )}

          {attachments && attachments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold">
                  {t("attachments")}{" "}
                  <span className="text-muted-foreground font-normal">({attachments.length})</span>
                </h3>
              </div>
              <PhotoProvider>
                <div className="flex flex-wrap gap-3">
                  {attachments.map((img: string, index: number) => (
                    <PhotoView key={index} src={getImageUrl(img)}>
                      <div className="cursor-pointer overflow-hidden rounded-lg border shadow-sm hover:shadow-md transition-all">
                        <MyImage src={img} alt={`attachment-${index}`} width={256} height={256}
                          className="h-24 w-24 object-cover hover:scale-105 transition-transform" />
                      </div>
                    </PhotoView>
                  ))}
                </div>
              </PhotoProvider>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Booking Details ── */}
      {booking && (
        <Card className="shadow-md gap-2">
          <CardHeader>
            <CardTitle className="text-xl">{t("bookingDetails")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoItem icon={<CalendarDays className="w-4 h-4" />} label={t("checkIn")}
                value={format(new Date(booking.dates.checkIn), "PPp")} />
              <InfoItem icon={<CalendarCheck className="w-4 h-4" />} label={t("checkOut")}
                value={format(new Date(booking.dates.checkOut), "PPp")} />
              <InfoItem icon={<DollarSign className="w-4 h-4" />} label={t("totalPrice")}
                value={`$${Number(booking.priceDetails?.totalPrice || 0).toFixed(2)}`} />
              <InfoItem icon={<DollarSign className="w-4 h-4" />} label={t("securityDeposit")}
                value={`$${securityDeposit.toFixed(2)}`} />
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("status")}</p>
                <Status value={booking.status?.toLowerCase()} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Renter & Leaser ── */}
      <Card className="shadow-md gap-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-xl">{t("parties")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Leaser — the one who filed (user on ticket) */}
            <UserCard
              label={t("leaser")}
              person={typeof leaser === "object" ? leaser : null}         // always populated — ticket's user field
              badgeColor="bg-blue-50 text-blue-700 border-blue-100"
            />

            {/* Renter — from booking.renter (needs backend populate) */}
            <UserCard
              label={t("renter")}
              person={typeof renter === "object" ? renter : null}
              badgeColor="bg-violet-50 text-violet-700 border-violet-100"
            />

          </div>
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      {status === "pending" && (
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
              {t("ticketActionNote")}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button onClick={() => handleStatusUpdate("rejected")} disabled={isPending} variant="destructive">
              {pendingAction === "rejected" ? t("processing") : t("reject")}
            </Button>
            <Dialog open={partialDialogOpen} onOpenChange={setPartialDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  disabled={isPending || securityDeposit <= 0}
                  variant="outline"
                  onClick={() => setApprovedAmount(securityDeposit ? String(securityDeposit) : "")}
                >
                  {t("partiallyApprove")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("partiallyApprove")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <Label htmlFor="approvedAmount">{t("approvedAmount")}</Label>
                    <Input
                      id="approvedAmount"
                      type="number"
                      min={0.01}
                      max={securityDeposit}
                      step="0.01"
                      value={approvedAmount}
                      onChange={(event) => handlePartialAmountChange(event.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("partialApprovalLimit", { amount: securityDeposit.toFixed(2) })}
                  </p>
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button type="button" variant="outline" onClick={() => setPartialDialogOpen(false)}>
                    {t("cancel")}
                  </Button>
                  <Button type="button" onClick={handlePartialApproval} disabled={isPending || !isPartialAmountValid} variant="success">
                    {pendingAction === "partially_approved" ? t("processing") : t("submit")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button onClick={() => handleStatusUpdate("approved")} disabled={isPending} variant="success">
              {pendingAction === "approved" ? t("processing") : t("approve")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Reusable user card ──
const UserCard = ({ label, person, badgeColor }: { label: string; person: any; badgeColor: string }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
    <PhotoProvider>
      <PhotoView src={getImageUrl(person?.profilePicture || "")}>
        <div className="cursor-pointer hover:opacity-90 transition-opacity shrink-0">
          <MyImage
            src={person?.profilePicture || ""}
            width={256} height={256} alt={person?.name || label}
            className="rounded-full w-14 h-14 object-cover border shadow-sm"
          />
        </div>
      </PhotoView>
    </PhotoProvider>
    <div className="space-y-1 min-w-0">
      <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
        {label}
      </span>
      <p className="font-semibold text-sm text-foreground truncate capitalize">{person?.name || "—"}</p>
      {person?.email && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="w-3 h-3 shrink-0" />
          <span className="truncate">{person.email}</span>
        </div>
      )}
    </div>
  </div>
);

// ── Reusable info item ──
const InfoItem = ({ icon, label, value }: { icon?: React.ReactNode; label: string; value?: string | number }) => (
  <div>
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
      {icon}
      <span>{label}</span>
    </div>
    <p className="font-medium text-sm capitalize break-words">{value || "-"}</p>
  </div>
);

export default TicketDetail;
