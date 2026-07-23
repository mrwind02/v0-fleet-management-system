"use client"

import { useEffect, useState } from "react"
import { vehicleService } from "../../services/api"
import { Pencil, Trash2, UserPlus, MoreVertical } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/utils/utils"

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color?: string
  loadCapacity?: number
  driverName?: string
}

interface VehicleListProps {
  onEdit?: (vehicle: Vehicle) => void
  onAssign?: (vehicle: Vehicle) => void
}

export function VehicleList({ onEdit, onAssign }: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await vehicleService.getAll(true)
      setVehicles(response.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao carregar veículos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este veículo?")) return

    try {
      await vehicleService.delete(id)
      fetchVehicles()
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      alert("Erro ao excluir veículo")
    }
  }

  if (isLoading) return <div className="p-8 text-center text-[11px] font-medium text-muted-foreground animate-pulse">Carregando frota...</div>
  if (error) return <div className="p-8 text-center text-[11px] font-medium text-destructive">{error}</div>

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow className="bg-transparent hover:bg-transparent border-b">
            <TableHead className="w-[30px] px-3 py-1"><Checkbox className="rounded-[4px] opacity-70" /></TableHead>
            <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Veículo</TableHead>
            <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Placa</TableHead>
            <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Ano</TableHead>
            <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Motorista Atual</TableHead>
            <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Capacidade</TableHead>
            <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
            <TableHead className="w-[30px] py-1 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center text-[11px] text-muted-foreground">
                Nenhum veículo cadastrado.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle) => (
              <TableRow key={vehicle.id} className="border-b/50 h-8">
                <TableCell className="px-3 py-1">
                  <Checkbox className="rounded-[4px] border-muted-foreground/30" />
                </TableCell>
                <TableCell className="py-1">
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="font-semibold text-[10px] text-foreground">{vehicle.brand}</span>
                    <span className="text-[8px] text-muted-foreground">{vehicle.model}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[10px] font-medium text-foreground py-1 whitespace-nowrap">
                  {vehicle.plate.toUpperCase()}
                </TableCell>
                <TableCell className="text-[10px] text-muted-foreground py-1">
                  {vehicle.year}
                </TableCell>
                <TableCell className="py-1">
                  {vehicle.driverName ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-700">
                        {vehicle.driverName.charAt(0)}
                      </div>
                      <span className="text-[10px] text-foreground">{vehicle.driverName}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground italic">Sem motorista</span>
                  )}
                </TableCell>
                <TableCell className="text-[10px] py-1 whitespace-nowrap">
                  {vehicle.loadCapacity ? `${vehicle.loadCapacity} kg` : '-'}
                </TableCell>
                <TableCell className="py-1">
                  <Badge variant="outline" className={cn(
                    "border-0 rounded-full text-[8px] px-1.5 py-0 h-3.5 font-semibold whitespace-nowrap",
                    "text-green-700 bg-green-100" // Simulated Active status
                  )}>
                    Ativo
                  </Badge>
                </TableCell>
                <TableCell className="py-1 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40 text-[11px]">
                      <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Ações do Veículo</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onAssign?.(vehicle)} className="text-[11px] cursor-pointer">
                        <UserPlus className="mr-2 h-3 w-3" /> Atribuir Motorista
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit?.(vehicle)} className="text-[11px] cursor-pointer">
                        <Pencil className="mr-2 h-3 w-3" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(vehicle.id)} className="text-[11px] text-destructive focus:bg-destructive/10 cursor-pointer">
                        <Trash2 className="mr-2 h-3 w-3" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {/* Pagination footer (mock) */}
      <div className="p-2 border-t flex items-center justify-between bg-muted/10">
        <span className="text-[10px] text-muted-foreground px-1">Mostrando {vehicles.length} registros</span>
      </div>
    </div>
  )
}
