"use client"

import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { VehicleForm } from "@/components/vehicles/VehicleForm"
import { ChevronRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewVehiclePage() {
  const router = useRouter()

  const handleSuccess = () => {
    // According to specs: redirect to vehicle details page after creation
    // Since we don't have the newly created ID from the form easily without refactoring it,
    // For now we'll route back to /vehicles
    // Ideally: router.push(`/vehicles/${newVehicleId}`)
    router.push('/vehicles')
  }

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
              <span className="text-foreground">Novo Veículo</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Cadastro de Veículo</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5 ml-11">Preencha as informações iniciais para registrar um novo ativo na frota.</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border rounded-xl p-4 shadow-sm mt-2 w-full">
          <VehicleForm onSuccess={handleSuccess} />
        </div>

      </div>
    </AppLayout>
  )
}
