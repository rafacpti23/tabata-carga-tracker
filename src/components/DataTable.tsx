
import React from "react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  filter?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({ 
  data, 
  columns, 
  filter, 
  onRowClick,
  isLoading = false
}: DataTableProps<T>) {
  return (
    <div className="space-y-4">
      {filter && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
          <Input
            placeholder={filter.placeholder || "Filtrar..."}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="pl-8 input-dark"
          />
        </div>
      )}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 dark:text-gray-100">
              {columns.map((column) => (
                <TableHead key={column.key} className="dark:text-gray-300">
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                    <span className="text-gray-500 dark:text-gray-400">Carregando dados...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10">
                  <span className="text-gray-500 dark:text-gray-400">Nenhum dado encontrado</span>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800" : ""}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={`${rowIndex}-${column.key}`} 
                      className="dark:border-gray-700"
                    >
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
