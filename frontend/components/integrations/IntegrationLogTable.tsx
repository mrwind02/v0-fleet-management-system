"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { IntegrationLog } from "@/types/integrations"

interface IntegrationLogTableProps {
  logs: IntegrationLog[]
}

export function IntegrationLogTable({ logs }: IntegrationLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="p-8 text-center border rounded-xl bg-muted/10 text-xs text-muted-foreground">
        Nenhum registro de log encontrado para esta integração.
      </div>
    )
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted/50 border-b font-semibold text-muted-foreground">
          <tr>
            <th className="p-3">Data / Hora</th>
            <th className="p-3">Evento</th>
            <th className="p-3">Status</th>
            <th className="p-3">Tempo</th>
            <th className="p-3">Mensagem / Detalhes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border font-mono text-[11px]">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-muted/30 transition-colors">
              <td className="p-3 font-semibold text-foreground whitespace-nowrap">{log.date}</td>
              <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">{log.event}</td>
              <td className="p-3">
                <Badge
                  variant="outline"
                  className={
                    log.status === "sucesso"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                      : log.status === "erro"
                      ? "bg-red-500/10 text-red-600 border-red-500/20 text-[10px]"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                  }
                >
                  {log.status}
                </Badge>
              </td>
              <td className="p-3 text-muted-foreground whitespace-nowrap">{log.timeMs}ms</td>
              <td className="p-3 text-foreground font-sans truncate max-w-md">{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
