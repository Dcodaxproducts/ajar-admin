"use client";

import { useGetTickets } from "@/hooks/useTickets";
import { Ticket } from "@/types";
import { filterData } from "@/utils/filterData";
import { useMemo, useState } from "react";
import TableActions from "../Actions";
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

const TicketsList = () => {
  const t = useTranslations("translation");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { data, isLoading, error } = useGetTickets({ page, limit: 10, status: status || undefined });

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
    "actions",
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
        <TableCell>
          <TableActions
            id={ticket._id}
            baseRoute="/tickets"
            module="ticket"
            actions={["view"]}
          />
        </TableCell>
      </>
    );
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row" dir="auto">
        <SearchInput className="w-full ml-auto" onChange={(e) => setSearch(e)} placeholder="searchTicket" />
        <label className="sr-only" htmlFor="ticket-status-filter">{t("status")}</label>
        <select id="ticket-status-filter" className="h-10 rounded-md border bg-background px-3" value={status}
          onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">{t("allStatuses")}</option><option value="pending">{t("pendingAdminReview")}</option>
          <option value="approved">{t("approve")}</option><option value="rejected">{t("reject")}</option>
        </select>
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
