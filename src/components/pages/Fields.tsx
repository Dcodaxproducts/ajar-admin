"use client";

import { TableCell } from "@/components/ui/table";
import { limit } from "@/config/constants";
import { useDeleteField, useGetFields } from "@/hooks/useFields";
import { useCallback, useState } from "react";
import TableActions from "../Actions";
import { DataTable } from "../custom/DataTable";
import { SearchInput } from "../custom/SearchInput";
import HighlightCell from "../HighlightCell";
import ResponseError from "../ResponseError";
import TableSkeleton from "../skeletons/TableSkeleton";

const Fields = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useGetFields({ page, limit, search });
  const { mutate: deleteField, isPending: deleteLoading } = useDeleteField();
  const cols = ["label", "name", "type", "actions"];
  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  if (isLoading) {
    return <TableSkeleton cols={cols.length} rows={10} />;
  }

  if (error) {
    return <ResponseError error={error.message} />;
  }

  const row = (field: any) => (
    <>
      <HighlightCell text={field.label ?? "—"} query={search} className="capitalize" />
      <HighlightCell text={field.name} query={search} className="capitalize" />
      <TableCell className="capitalize">{field.type}</TableCell>
      <TableCell className="flex gap-4">
        <TableActions
          id={field._id}
          baseRoute="/field-management"
          module="Field"
          actions={["edit", "delete"]}
          onDelete={(id, closeDialog) =>
            deleteField(id, {
              onSuccess: () => {
                closeDialog();
              },
            })
          }
          deleteLoading={deleteLoading}
        />
      </TableCell>
    </>
  );

  return (
    <div className="flex flex-col gap-4 md:gap-8 h-full">
      <div className="flex items-center justify-end">
        <SearchInput
          className="w-full"
          onChange={handleSearch}
          placeholder="searchField"
        />
      </div>
      <DataTable
        data={data?.data?.fields || []}
        cols={cols}
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

export default Fields;