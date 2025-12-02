"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/authStore"

export function Sidebar() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", roles: ["admin", "manager", "driver"] },
    { href: "/vehicles", label: "Veículos", roles: ["admin", "manager"] },
    { href: "/drivers", label: "Motoristas", roles: ["admin", "manager"] },
    { href: "/maintenance", label: "Manutenção", roles: ["admin", "manager", "driver"] },
    { href: "/questionnaire", label: "Status", roles: ["driver"] },
    { href: "/reports", label: "Relatórios", roles: ["admin", "manager"] },
  ]

  const filteredItems = menuItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <aside className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Fleet Manager</h2>
      </div>

      <nav className="space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition ${
                isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
