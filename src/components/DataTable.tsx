
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
import { Loader2 } from "lucide-react";

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
  isLoading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  filter,
  isLoading = false,
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
            disabled={isLoading}
          />
          {filter.value && (
            <Button
              variant="ghost"
              onClick={() => filter.onChange("")}
              className="h-10"
              disabled={isLoading}
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
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin mr-2" />
                    <span>Carregando dados...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
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
