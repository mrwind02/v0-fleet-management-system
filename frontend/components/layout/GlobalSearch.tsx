"use client"

import * as React from "react"
import { Search, Calculator, Calendar, CreditCard, Settings, User, Truck, Wrench } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <div className="w-full sm:w-auto">
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Busca Global"
        aria-keyshortcuts="Control+K"
        className="relative h-9 w-full justify-start rounded-[0.5rem] bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-64 lg:w-80"
      >
        <span className="hidden lg:inline-flex">Buscar veículos, motoristas...</span>
        <span className="inline-flex lg:hidden">Buscar...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.45rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex" aria-hidden="true">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite um comando ou busque..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Ações Rápidas">
            <CommandItem>
              <Truck className="mr-2 h-4 w-4" />
              <span>Novo Veículo</span>
            </CommandItem>
            <CommandItem>
              <Wrench className="mr-2 h-4 w-4" />
              <span>Nova Ordem de Serviço</span>
            </CommandItem>
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Cadastrar Motorista</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Módulos">
            <CommandItem>
              <Calculator className="mr-2 h-4 w-4" />
              <span>Financeiro</span>
            </CommandItem>
            <CommandItem>
              <Calendar className="mr-2 h-4 w-4" />
              <span>Manutenções Preventivas</span>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Despesas e Abastecimentos</span>
            </CommandItem>
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações do Sistema</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
