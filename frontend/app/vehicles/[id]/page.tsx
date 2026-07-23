"use client"

import { useParams, useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { ChevronRight, ArrowLeft, Settings2, FileText, Wrench, Shield, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VehicleDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center text-xs font-semibold text-muted-foreground mb-1">
              <span className="cursor-pointer hover:underline" onClick={() => router.push('/vehicles')}>Frota</span>
              <ChevronRight className="h-3 w-3 mx-1.5" />
              <span className="cursor-pointer hover:underline" onClick={() => router.push('/vehicles')}>Veículos</span>
              <ChevronRight className="h-3 w-3 mx-1.5" />
              <span className="text-foreground">Detalhes</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => router.push('/vehicles')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Visão 360º do Veículo</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 ml-11">Gerenciamento completo do ativo #{id}</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="outline" className="h-9 text-xs shadow-sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Reportar Incidente
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-9 text-xs font-semibold shadow-sm">
              <Settings2 className="mr-2 h-4 w-4" />
              Editar Dados
            </Button>
          </div>
        </div>

        {/* Content Skeleton / Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 ml-11">
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="bg-card border rounded-xl p-5 shadow-sm flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-muted rounded-full mb-4 flex items-center justify-center">
                <span className="text-muted-foreground text-xs">Sem Foto</span>
              </div>
              <h2 className="text-lg font-bold">Veículo</h2>
              <p className="text-sm text-muted-foreground">Placa / Modelo</p>
            </div>
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-sm border-b pb-2">Navegação</h3>
              <ul className="space-y-1 text-sm">
                <li className="p-2 bg-muted/50 rounded-lg text-foreground font-medium cursor-pointer">Visão Geral</li>
                <li className="p-2 hover:bg-muted/30 rounded-lg text-muted-foreground cursor-pointer flex items-center gap-2"><FileText className="w-4 h-4"/> Documentação</li>
                <li className="p-2 hover:bg-muted/30 rounded-lg text-muted-foreground cursor-pointer flex items-center gap-2"><Shield className="w-4 h-4"/> Seguros</li>
                <li className="p-2 hover:bg-muted/30 rounded-lg text-muted-foreground cursor-pointer flex items-center gap-2"><Wrench className="w-4 h-4"/> Plano de Manutenção</li>
              </ul>
            </div>
          </div>
          <div className="md:col-span-3 flex flex-col gap-4">
            <div className="bg-card border rounded-xl p-6 shadow-sm min-h-[400px] flex items-center justify-center">
               <div className="text-center">
                 <h3 className="text-lg font-semibold text-foreground mb-2">Desenvolvimento Futuro</h3>
                 <p className="text-muted-foreground text-sm">A tela completa de Visão 360º será implementada nesta página (id: {id}).</p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
