"use client";

import { useGetTickets } from "@/hooks/useTickets";
import { Ticket } from "@/types";
import { filterData } from "@/utils/filterData";
import { useMemo, useState } from "react";
import { DataTable } from "../custom/DataTable";
import { SearchInput } from "../custom/SearchInput";
import ResponseError from "../ResponseError";
import TableSkeleton from "../skeletons/TableSkeleton";
import Tooltip from "../Tooltip";
import { TableCell } from "../ui/table";
import Status from "../StatusBadge";
import Link from "next/link";
import HighlightCell from "../HighlightCell";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

const TicketsList = () => {
  const [page, setPage] = useState(1);
  const t = useTranslations("translation");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "partially_approved" | "rejected" | undefined>();
  const { data, isLoading, error } = useGetTickets({ page, limit: 10, status });

  const tickets = useMemo(() => {
    const raw = data?.data?.tickets || [];
    
    const flattened = raw.map((t: any) => ({
      ...t,
      name: t.user?.name || "",
      email: t.user?.email || "",
    }));

    return filterData({
      data: flattened,
      search,
      searchKeys: ["rentalText", "status", "name", "email"],
    });
  }, [data, search]);

  const cols = [
    "id",
    "sender",
    "email",
    "subject",
    "createdAt",
    "status",
  ];

  if (isLoading) {
    return <TableSkeleton cols={cols.length} rows={10} />;
  }

  if (error) {
    return <ResponseError error={error.message} />;
  }

  const row = (ticket: Ticket) => {
    return (
      <>
        <TableCell>
          <Link href={`/tickets/${ticket._id}`}>
            <span className="underline">{ticket._id?.slice(-4)}</span>
          </Link>
        </TableCell>
        <HighlightCell text={ticket.user?.name || "Unknown"} query={search} />
        <HighlightCell
          className=""
          text={ticket.user?.email || "Unknown"}
          query={search}
        />

        <Tooltip content={ticket.rentalText}>
          <HighlightCell text={ticket.rentalText || "Unknown"} query={search} />
        </Tooltip>
        <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>
          <Status value={ticket.status} />
        </TableCell>
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:justify-end">
        <Select value={status ?? "all"} onValueChange={(value) => { setPage(1); setStatus(value === "all" ? undefined : value as typeof status); }}>
          <SelectTrigger className="w-full md:w-[200px]"><SelectValue placeholder={t("status")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allStatuses")}</SelectItem>
            <SelectItem value="pending">{t("pending")}</SelectItem>
            <SelectItem value="approved">{t("approved")}</SelectItem>
            <SelectItem value="partially_approved">{t("partiallyApproved")}</SelectItem>
            <SelectItem value="rejected">{t("rejected")}</SelectItem>
          </SelectContent>
        </Select>
      <SearchInput
        className="w-full md:max-w-sm"
        onChange={(e) => setSearch(e)}
        placeholder="searchTicket"
      />
      </div>
      <DataTable
        cols={cols}
        data={tickets}
        row={row}
        pagination={{
          total: data?.data?.total || 0,
          page: data?.data?.page || 1,
          limit: data?.data?.limit || 10,
          setPage,
        }}
      />
    </div>
  );
};

export default TicketsList;
