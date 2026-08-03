"use client"

import * as React from "react"
import { Play, CheckCircle2, XCircle, Loader2, ShieldCheck, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ConnectionTestCardProps {
  integrationName: string
  onRunTest: (testType: string) => Promise<{ success: boolean; timeMs: number; message: string }>
}

export function ConnectionTestCard({ integrationName, onRunTest }: ConnectionTestCardProps) {
  const [testingType, setTestingType] = React.useState<string | null>(null)
  const [results, setResults] = React.useState<Record<string, { success: boolean; timeMs: number; message: string }>>({})

  const tests = [
    { type: "connection", title: "Teste de Conexão (Ping / Network)", desc: "Valida acessibilidade e tempo de resposta da URL da API externa." },
    { type: "auth", title: "Teste de Autenticação (OAuth / API Key)", desc: "Verifica se as credenciais fornecidas são aceitas e válidas." },
    { type: "sync", title: "Teste de Sincronização (Payload / Event)", desc: "Simula o envio/recebimento de um pacote de dados de teste." }
  ]

  const handleExecute = async (type: string) => {
    setTestingType(type)
    try {
      const res = await onRunTest(type)
      setResults((prev) => ({ ...prev, [type]: res }))
    } catch (err: any) {
      setResults((prev) => ({
        ...prev,
        [type]: { success: false, timeMs: 0, message: err?.message || "Falha ao conectar." }
      }))
    } finally {
      setTestingType(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-card border rounded-2xl space-y-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Zap className="h-4 w-4 text-blue-600" /> Executar Diagnósticos de Conexão
        </h3>
        <p className="text-xs text-muted-foreground">
          Valide a estabilidade e as permissões de acesso com o serviço <strong>{integrationName}</strong>. Os testes de validação não alteram dados de produção.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {tests.map((t) => {
            const isRunning = testingType === t.type
            const result = results[t.type]

            return (
              <div key={t.type} className="p-4 bg-muted/20 border rounded-xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{t.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                </div>

                {result && (
                  <div className={`p-2 rounded-lg border text-xs space-y-1 ${result.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"}`}>
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>{result.success ? "✓ SUCESSO" : "✕ FALHA"}</span>
                      <span className="font-mono">{result.timeMs}ms</span>
                    </div>
                    <p className="text-[10px] font-mono">{result.message}</p>
                  </div>
                )}

                <Button
                  size="sm"
                  disabled={isRunning}
                  onClick={() => handleExecute(t.type)}
                  className="w-full text-xs gap-1.5 bg-primary text-primary-foreground font-semibold h-8"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Testando...
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" /> Executar {t.type}
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
