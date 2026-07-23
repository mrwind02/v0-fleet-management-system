"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./empty-state"
import { cn } from "@/utils/utils"

export type TableDensity = "compact" | "comfortable" | "spaced"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  density?: TableDensity
  searchKey?: string
  searchValue?: string
  onRowClick?: (row: TData) => void
  emptyStateTitle?: string
  emptyStateDescription?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  density = "comfortable",
  searchKey,
  searchValue = "",
  onRowClick,
  emptyStateTitle = "Nenhum registro",
  emptyStateDescription = "Não há dados para exibir nesta tabela no momento."
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  // Apply search filter if searchKey is provided
  React.useEffect(() => {
    if (searchKey) {
      table.getColumn(searchKey)?.setFilterValue(searchValue)
    }
  }, [searchKey, searchValue, table])

  // Map density to tailwind padding classes
  const densityClasses = {
    compact: "py-1.5 px-3 text-[11px]",
    comfortable: "py-3 px-4 text-xs",
    spaced: "py-4 px-5 text-sm"
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyStateTitle}
        description={emptyStateDescription}
      />
    )
  }

  return (
    <div className="flex flex-col w-full space-y-4">
      <div className="rounded-md border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-hidden">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30 border-b-border">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className={cn("font-semibold text-muted-foreground", densityClasses[density])}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      onClick={() => onRowClick?.(row.original)}
                      className={cn(
                        "border-b transition-colors hover:bg-muted/40",
                        onRowClick && "cursor-pointer"
                      )}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className={cn(densityClasses[density])}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Sem resultados.
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-xs text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-xs font-medium text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Voltar</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Avançar</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
