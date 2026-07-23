"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertTriangle, User, Car } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { CurrencyInput } from "@/components/ui/currency-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Autocomplete } from "@/components/ui/autocomplete"
import { UploadArea } from "@/components/ui/upload-area"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { fineService } from "@/services/fine.service"

const formSchema = z.object({
  autoNumber: z.string().min(1, "Número do Auto é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  organ: z.string().min(1, "Selecione o Órgão autuador"),
  category: z.string().min(1, "Selecione a categoria"),
  description: z.string().optional(),
  vehicleId: z.string().min(1, "Selecione o veículo"),
  driverId: z.string().min(1, "Selecione o motorista"),
  value: z.number().min(0.01, "Valor deve ser maior que zero"),
  points: z.number().min(0).max(20, "Pontos inválidos"),
  dueDate: z.string().min(1, "Prazo para pagamento é obrigatório"),
  status: z.string().min(1, "Selecione a situação"),
  file: z.any().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NewFineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewFineModal({ open, onOpenChange }: NewFineModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      autoNumber: "",
      date: "",
      organ: "",
      category: "",
      description: "",
      vehicleId: "",
      driverId: "",
      value: 0,
      points: 0,
      dueDate: "",
      status: "aberto",
      file: null,
      notes: "",
    },
  })

  const vehicleId = form.watch("vehicleId")
  const points = form.watch("points")

  // Simulate auto-filling driver when vehicle changes
  React.useEffect(() => {
    if (vehicleId === "1") {
      form.setValue("driverId", "1")
    } else if (vehicleId === "2") {
      form.setValue("driverId", "2")
    }
  }, [vehicleId, form])

  const onSubmit = async (data: FormValues) => {
    try {
      await fineService.createFine({
        auto_number: data.autoNumber,
        infraction_date: data.date,
        organ: data.organ,
        category: data.category,
        description: data.description,
        vehicle_id: data.vehicleId,
        driver_id: data.driverId,
        value: data.value,
        points: data.points,
        due_date: data.dueDate,
        status: data.status,
        notes: data.notes
      })
      toast.success("Multa cadastrada com sucesso!")
      onOpenChange(false)
      form.reset()
      window.location.reload()
    } catch (error) {
      toast.error("Erro ao salvar multa.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[820px] overflow-y-auto p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
        <SheetHeader className="p-6 border-b bg-card sticky top-0 z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle className="text-xl">Nova Multa</SheetTitle>
              <SheetDescription className="mt-1">
                Cadastre uma infração vinculando veículo, motorista e informações do auto.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 p-6">
          <Form {...form}>
            <form id="new-fine-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Informações da Multa</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="autoNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número do Auto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: AIT-123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Infração</FormLabel>
                      <FormControl>
                        <DatePicker {...field} error={!!form.formState.errors.date} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="organ" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Órgão Autuador</FormLabel>
                      <FormControl>
                        <Select {...field} error={!!form.formState.errors.organ}>
                          <option value="" disabled>Selecione...</option>
                          <option value="detran">DETRAN</option>
                          <option value="prf">PRF</option>
                          <option value="dnit">DNIT</option>
                          <option value="prefeitura">Prefeitura</option>
                          <option value="der">DER</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Select {...field} error={!!form.formState.errors.category}>
                          <option value="" disabled>Selecione...</option>
                          <option value="velocidade">Velocidade</option>
                          <option value="estacionamento">Estacionamento</option>
                          <option value="sinalizacao">Sinalização</option>
                          <option value="documentacao">Documentação</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva brevemente a infração..." className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Veículo</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="vehicleId" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Autocomplete
                            placeholder="Buscar veículo..."
                            options={[
                              { label: "Scania R450", value: "1", description: "Placa: PQF-3C53" },
                              { label: "Volvo FH540", value: "2", description: "Placa: ABC-1234" }
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            error={!!form.formState.errors.vehicleId}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <AnimatePresence>
                      {vehicleId && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-3 p-3 mt-2 border rounded-lg bg-muted/20">
                            <div className="w-10 h-10 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <Car className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Scania R450</p>
                              <p className="text-xs text-muted-foreground">PQF-3C53</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Motorista</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="driverId" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Autocomplete
                            placeholder="Buscar motorista..."
                            options={[
                              { label: "João Silva", value: "1", description: "CNH: 12345678" },
                              { label: "Carlos Oliveira", value: "2", description: "CNH: 87654321" }
                            ]}
                            value={field.value}
                            onChange={field.onChange}
                            error={!!form.formState.errors.driverId}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <AnimatePresence>
                      {form.watch("driverId") && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-3 p-3 mt-2 border rounded-lg bg-muted/20">
                            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">João Silva</p>
                              <p className="text-xs text-muted-foreground">CNH Válida (Cat E)</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Penalidade</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="value" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (R$)</FormLabel>
                      <FormControl>
                        <CurrencyInput 
                          value={field.value} 
                          onChange={field.onChange} 
                          error={!!form.formState.errors.value} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="points" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pontos na CNH</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Ex: 7" 
                          {...field} 
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prazo para pagamento</FormLabel>
                      <FormControl>
                        <DatePicker {...field} error={!!form.formState.errors.dueDate} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Situação</FormLabel>
                      <FormControl>
                        <Select {...field} error={!!form.formState.errors.status}>
                          <option value="aberto">Em aberto</option>
                          <option value="pago">Pago</option>
                          <option value="recurso">Recurso</option>
                          <option value="cancelado">Cancelado</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <AnimatePresence>
                    {points > 10 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="md:col-span-2 p-3 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2 text-sm"
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>⚠️ Atenção: Com esta infração o motorista acumulará alta pontuação na CNH.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Upload de Arquivos</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField control={form.control} name="file" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <UploadArea 
                          onFileSelect={(file) => field.onChange(file)} 
                          error={!!form.formState.errors.file}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Adicione observações relevantes..." className="resize-none h-24" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

            </form>
          </Form>
        </div>

        <SheetFooter className="p-6 border-t bg-card sticky bottom-0 z-10 flex-row justify-end gap-3 sm:gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" form="new-fine-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar Multa"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
