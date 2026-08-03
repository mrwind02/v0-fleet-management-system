"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserItem } from "@/types/settings"

interface EditUserModalProps {
  user: UserItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (updatedUser: UserItem) => void
}

export function EditUserModal({ user, isOpen, onClose, onSave }: EditUserModalProps) {
  const [form, setForm] = React.useState<Partial<UserItem>>({})

  React.useEffect(() => {
    if (user) {
      setForm({ ...user })
    }
  }, [user, isOpen])

  if (!user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...user,
      ...form,
      name: form.name || user.name,
      email: form.email || user.email,
      role: (form.role as UserItem["role"]) || user.role,
      status: (form.status as UserItem["status"]) || user.status
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Editar Usuário: {user.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Atualize as informações cadastrais, status e perfil de acesso do usuário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Nome Completo *</Label>
              <Input
                required
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">E-mail Corporativo *</Label>
              <Input
                required
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Perfil (RBAC)</Label>
                <select
                  value={form.role || "operacional"}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserItem["role"] })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="admin">Administrador Total</option>
                  <option value="gestor">Gestor de Operações</option>
                  <option value="financeiro">Analista Financeiro</option>
                  <option value="operacional">Operador de Pátio</option>
                  <option value="driver">Motorista / Condutor</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Status da Conta</Label>
                <select
                  value={form.status || "Ativo"}
                  onChange={(e) => setForm({ ...form, status: e.target.value as UserItem["status"] })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs mt-1"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Pendente 2FA">Pendente 2FA</option>
                </select>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs h-9">
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="text-xs h-9 bg-primary text-primary-foreground font-semibold">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
