"use client"

import { useEffect, useState } from "react"
import { driverService } from "../../services/api"
import { Pencil, Trash2, MoreVertical, FileText } from "lucide-react"
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

interface Driver {
    id: string
    name: string
    cnhNumber: string
    cnhCategory: string
    cnhExpiryDate: string
    phone?: string
    email?: string
    isActive: boolean
}

interface DriverListProps {
    onEdit?: (driver: Driver) => void
}

export function DriverList({ onEdit }: DriverListProps) {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        loadDrivers()
    }, [])

    const loadDrivers = async () => {
        try {
            const response = await driverService.getAll(undefined)
            setDrivers(response.data.data)
        } catch (error) {
            console.error("Error loading drivers:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este motorista?")) return

        try {
            await driverService.delete(id)
            loadDrivers()
        } catch (error) {
            console.error("Error deleting driver:", error)
            alert("Erro ao excluir motorista")
        }
    }

    if (isLoading) return <div className="p-8 text-center text-[11px] font-medium text-muted-foreground animate-pulse">Carregando motoristas...</div>

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    <TableRow className="bg-transparent hover:bg-transparent border-b">
                        <TableHead className="w-[30px] px-3 py-1"><Checkbox className="rounded-[4px] opacity-70" /></TableHead>
                        <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Motorista</TableHead>
                        <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">CNH</TableHead>
                        <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Categoria</TableHead>
                        <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Vencimento CNH</TableHead>
                        <TableHead className="text-[9px] py-1 font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                        <TableHead className="w-[30px] py-1 text-right"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {drivers.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-[11px] text-muted-foreground">
                                Nenhum motorista cadastrado no momento.
                            </TableCell>
                        </TableRow>
                    ) : (
                        drivers.map((driver) => {
                            const isExpiring = new Date(driver.cnhExpiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000;
                            return (
                            <TableRow key={driver.id} className="border-b/50 h-8">
                                <TableCell className="px-3 py-1">
                                    <Checkbox className="rounded-[4px] border-muted-foreground/30" />
                                </TableCell>
                                <TableCell className="py-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 shrink-0">
                                            {driver.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col whitespace-nowrap">
                                            <span className="font-semibold text-[11px] text-foreground">{driver.name}</span>
                                            <span className="text-[9px] text-muted-foreground">{driver.email || "Sem e-mail"}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-[10px] text-foreground py-1 font-medium whitespace-nowrap">
                                    {driver.cnhNumber}
                                </TableCell>
                                <TableCell className="text-[10px] font-bold text-foreground py-1">
                                    {driver.cnhCategory}
                                </TableCell>
                                <TableCell className="py-1">
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn("text-[10px] whitespace-nowrap", isExpiring ? "text-red-600 font-semibold" : "text-muted-foreground")}>
                                            {new Date(driver.cnhExpiryDate).toLocaleDateString()}
                                        </span>
                                        {isExpiring && <div className="w-1.5 h-1.5 rounded-full bg-red-500" title="CNH vencendo"></div>}
                                    </div>
                                </TableCell>
                                <TableCell className="py-1">
                                    <Badge variant="outline" className={cn(
                                        "border-0 rounded-full text-[8px] px-1.5 py-0 h-3.5 font-semibold whitespace-nowrap",
                                        driver.isActive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                                    )}>
                                        {driver.isActive ? 'Ativo' : 'Inativo'}
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
                                            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase">Ações do Motorista</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onEdit?.(driver)} className="text-[11px] cursor-pointer">
                                                <Pencil className="mr-2 h-3 w-3" /> Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-[11px] cursor-pointer">
                                                <FileText className="mr-2 h-3 w-3" /> Ver Documentos
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => handleDelete(driver.id)} className="text-[11px] text-destructive focus:bg-destructive/10 cursor-pointer">
                                                <Trash2 className="mr-2 h-3 w-3" /> Excluir
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )})
                    )}
                </TableBody>
            </Table>
            
            {/* Pagination footer (mock) */}
            <div className="p-2 border-t flex items-center justify-between bg-muted/10">
                <span className="text-[10px] text-muted-foreground px-1">Mostrando {drivers.length} registros</span>
            </div>
        </div>
    )
}
