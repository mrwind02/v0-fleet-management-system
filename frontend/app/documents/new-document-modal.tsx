"use client"

import * as React from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText, Save, X } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Autocomplete } from "@/components/ui/autocomplete"
import { UploadArea } from "@/components/ui/upload-area"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { documentService } from "@/services/document.service"

const formSchema = z.object({
  type: z.string().min(1, "Selecione o tipo do documento"),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  number: z.string().optional(),
  responsible: z.string().min(1, "Selecione um responsável"),
  status: z.string().min(1, "Selecione o status"),
  relationType: z.enum(["veiculo", "motorista", "empresa", "fornecedor"], {
    required_error: "Selecione o tipo de vínculo",
  }),
  relationId: z.string().min(1, "Selecione o registro correspondente"),
  issueDate: z.string().optional(),
  expirationDate: z.string().min(1, "Data de validade é obrigatória"),
  alertDays: z.string().optional(),
  file: z.any().refine((val) => val !== null && val !== undefined, "Arquivo é obrigatório"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface NewDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewDocumentModal({ open, onOpenChange }: NewDocumentModalProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      name: "",
      number: "",
      responsible: "",
      status: "valido",
      relationType: "veiculo",
      relationId: "",
      issueDate: "",
      expirationDate: "",
      alertDays: "30",
      file: null,
      notes: "",
    },
  })

  const relationType = form.watch("relationType")

  const onSubmit = async (data: FormValues) => {
    try {
      let vId, dId;
      if (data.relationType === "veiculo") vId = data.relationId;
      else if (data.relationType === "motorista") dId = data.relationId;

      await documentService.createDocument({
        name: data.name,
        category: data.type,
        related_to: data.relationId, // Mapeado no backend pra ficar mockado ou pegar nome real
        number: data.number,
        issue_date: data.issueDate,
        expiry_date: data.expirationDate,
        status: data.status,
        responsible: data.responsible,
        notes: data.notes,
        vehicle_id: vId,
        driver_id: dId
      })
      toast.success("Documento cadastrado com sucesso!")
      onOpenChange(false)
      form.reset()
      // Force page reload to fetch new data (in a real app, use a callback or context)
      window.location.reload()
    } catch (error) {
      toast.error("Erro ao salvar documento.")
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[760px] overflow-y-auto p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
        <SheetHeader className="p-6 border-b bg-card sticky top-0 z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <SheetTitle className="text-xl">Novo Documento</SheetTitle>
              <SheetDescription className="mt-1">
                Cadastre um documento e vincule-o a um veículo, motorista ou outro registro da empresa.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 p-6">
          <Form {...form}>
            <form id="new-document-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <Select {...field} error={!!form.formState.errors.type}>
                          <option value="" disabled>Selecione...</option>
                          <option value="veiculo">Documento do Veículo</option>
                          <option value="motorista">Documento do Motorista</option>
                          <option value="seguro">Seguro</option>
                          <option value="contrato">Contrato</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Documento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Apólice 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="number" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select {...field} error={!!form.formState.errors.status}>
                          <option value="valido">Válido</option>
                          <option value="analise">Em análise</option>
                          <option value="pendente">Pendente</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="responsible" render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Responsável</FormLabel>
                      <FormControl>
                        <Select {...field} error={!!form.formState.errors.responsible}>
                          <option value="" disabled>Selecione um responsável...</option>
                          <option value="admin">Administrador Geral</option>
                          <option value="joao">João (Jurídico)</option>
                          <option value="maria">Maria (Frota)</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Relacionamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="relationType" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de vínculo</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="veiculo" id="r-veiculo" />
                            <Label htmlFor="r-veiculo">Veículo</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="motorista" id="r-motorista" />
                            <Label htmlFor="r-motorista">Motorista</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="empresa" id="r-empresa" />
                            <Label htmlFor="r-empresa">Empresa</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fornecedor" id="r-fornecedor" />
                            <Label htmlFor="r-fornecedor">Fornecedor</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={relationType}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FormField control={form.control} name="relationId" render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Autocomplete
                              placeholder={`Buscar ${relationType}...`}
                              options={[
                                { label: "Scania R450 (XYZ-9876)", value: "1", description: "Frota Principal" },
                                { label: "Volvo FH540 (ABC-1234)", value: "2", description: "Frota Secundária" },
                                { label: "Carlos Oliveira", value: "3", description: "CNH: 123456" }
                              ]}
                              value={field.value}
                              onChange={field.onChange}
                              error={!!form.formState.errors.relationId}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Datas e Vencimento</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="issueDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Emissão</FormLabel>
                      <FormControl>
                        <DatePicker {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="expirationDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Validade</FormLabel>
                      <FormControl>
                        <DatePicker {...field} error={!!form.formState.errors.expirationDate} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="alertDays" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primeiro Alerta</FormLabel>
                      <FormControl>
                        <Select {...field}>
                          <option value="15">15 dias antes</option>
                          <option value="30">30 dias antes</option>
                          <option value="60">60 dias antes</option>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Upload de Arquivo</CardTitle>
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
          <Button type="submit" form="new-document-form" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar Documento"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
