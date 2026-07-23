"use client"

import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/layout/AppLayout"
import { PageHeader } from "@/components/ui/page-header"
import { DriverForm } from "@/components/drivers/DriverForm"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NewDriverPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/drivers')
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 pb-4 w-full animate-in fade-in duration-300">
        
        <PageHeader 
          breadcrumbs={[{ label: "Frota", href: "/vehicles" }, { label: "Motoristas", href: "/drivers" }, { label: "Novo Cadastro" }]}
          title="Cadastro de Motorista"
          description="Preencha as informações iniciais para registrar um novo condutor."
          actions={
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-muted/50" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          }
        />

        <div className="bg-card border rounded-xl p-4 shadow-sm mt-2 w-full">
          {/* Assumindo que o DriverForm já existe, similar ao VehicleForm */}
          <DriverForm onSuccess={handleSuccess} />
        </div>

      </div>
    </AppLayout>
  )
}
