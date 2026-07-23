"use client"

import { useAuthStore } from "@/store/authStore"
import { useRouter } from "next/navigation"
import { Shield, LogOut, User, ChevronDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function UserNav() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 flex items-center gap-3 hover:bg-transparent px-2">
          <div className="flex flex-col items-end text-right">
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold overflow-hidden">
            {/* If we had an image it would go here. Fallback to initials */}
            {initials}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          {user.role === "admin" && (
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Painel Admin</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
