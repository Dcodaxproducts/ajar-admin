"use client";

import { TableCell } from "@/components/ui/table";
import { useGetRefundRequests } from "@/hooks/useRefundManagement";
import { RefundRequest } from "@/types";
import { useMemo, useState } from "react";
import { DataTable } from "../custom/DataTable";
import { SearchInput } from "../custom/SearchInput";
import Loader from "../Loader";
import ResponseError from "../ResponseError";
import { Label } from "../Typography";
import Status from "../StatusBadge";
import { useTranslations } from "next-intl";
import TableActions from "../Actions";

const RefundRequests = () => {
  const t = useTranslations("translation");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, error } = useGetRefundRequests(page, 10);

  const {
    data: refundRequests = [],
    total,
    page: currentPage,
    limit,
  } = data || {};

  const filteredRefundRequests = useMemo(() => {
    if (!search) return refundRequests || [];

    const lower = search.toLowerCase();
    return (refundRequests || []).filter((request: RefundRequest) => {
      const listingName = request?.booking?.marketplaceListingId?.name?.toLowerCase() || "";
      const userName = request?.user?.name?.toLowerCase() || "";
      return listingName.includes(lower) || userName.includes(lower);
    });
  }, [refundRequests, search]);

  const cols = [
    "id",
    "listing",
    "user",
    "dateSubmitted",
    "amount",
    "status",
    "actions",
  ];

  const row = (request: RefundRequest, index: number) => {
    const priceDetails = request?.booking?.priceDetails;
    const refundAmount = request?.totalRefundAmount ?? 0;
    const securityDeposit = priceDetails?.securityDeposit ?? 0;
    const adminFee = priceDetails?.adminFee ?? 0;
    const tax = priceDetails?.tax ?? 0;

    // An early return keeps the platform fee and settles the deposit later
    // through the dispute window, so only the rental amount is refunded.
    const isEarlyReturn = Boolean(request?.isEarlyReturn);
    const totalRefundAmount = isEarlyReturn
      ? refundAmount
      : refundAmount + securityDeposit + adminFee + tax;

    return (
      <>
        <TableCell>{index + 1}</TableCell>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2">
            <span>{request?.booking?.marketplaceListingId?.name}</span>
          </div>
        </TableCell>
        <TableCell>{request?.user?.name}</TableCell>
        <TableCell>{new Date(request?.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>${totalRefundAmount.toFixed(2)}</TableCell>
        <TableCell>
          <Status value={request?.status} />
        </TableCell>
        <TableCell>
          <TableActions
            id={request._id}
            baseRoute="/refund-management"
            actions={["view"]}
            module="Refund"
          />
        </TableCell>
      </>
    );
  };

  const pagination = {
    total,
    page: currentPage,
    limit,
    setPage,
  };

  if (isLoading) return <Loader />;
  if (error) return <ResponseError error={error.message} />;

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="flex items-center justify-between mb-4">
        <Label className="text-xl font-semibold">
          {t("listRefundRequests")}
        </Label>
        <div className="flex gap-2">
          <SearchInput
            placeholder="searchRefundRequest"
            onChange={(e) => setSearch(e)}
            debounceDelay={500}
          />
        </div>
      </div>
      <DataTable
        data={filteredRefundRequests}
        cols={cols}
        row={row}
        pagination={pagination}
      />
    </div>
  );
};

export default RefundRequests;
