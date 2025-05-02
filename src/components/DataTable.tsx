
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    cell: (item: T) => React.ReactNode;
  }[];
  onRowClick?: (item: T) => void;
  filter?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  filter,
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {filter && (
        <div className="flex gap-2">
          <Input
            placeholder={filter.placeholder || "Filtrar..."}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="max-w-xs"
          />
          {filter.value && (
            <Button
              variant="ghost"
              onClick={() => filter.onChange("")}
              className="h-10"
            >
              Limpar
            </Button>
          )}
        </div>
      )}
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum dado encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={index}
                  className={onRowClick ? "cursor-pointer hover:bg-muted" : ""}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                >
                  {columns.map((column) => (
                    <TableCell key={`${index}-${column.key}`}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
