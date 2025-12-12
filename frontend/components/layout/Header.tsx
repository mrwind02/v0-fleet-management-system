import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/authStore"
import { LayoutDashboard, Truck, Users, Wrench, Activity, FileText, LogOut, ChevronDown } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuthStore()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "driver"] },
    { href: "/vehicles", label: "Veículos", icon: Truck, roles: ["admin", "manager"] },
    { href: "/drivers", label: "Motoristas", icon: Users, roles: ["admin", "manager"] },
    { href: "/maintenance", label: "Manutenção", icon: Wrench, roles: ["admin", "manager", "driver"] },
    { href: "/questionnaire", label: "Status", icon: Activity, roles: ["driver"] },
    { href: "/reports", label: "Relatórios", icon: FileText, roles: ["admin", "manager"] },
  ]

  const filteredItems = menuItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm/50 backdrop-blur-md bg-white/90">
      <div className="w-full" style={{ paddingLeft: '6mm', paddingRight: '6mm' }}>
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center gap-3 text-blue-600 w-64 transition-transform hover:scale-105">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Truck className="h-8 w-8" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">Fleet Manager</span>
          </div>

          {/* Centered Navigation - 10mm spacing approx 40px (gap-10) */}
          <nav className="hidden md:flex items-center gap-6">
            {filteredItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                       relative flex items-center gap-2 px-9 py-3.5 rounded-full text-base font-medium transition-colors duration-300 z-10
                       ${isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                    }
                      `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-blue-50/80 ring-1 ring-blue-100 shadow-sm rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-600"}`} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Profile Section */}
          <div className="flex items-center justify-end w-64">
            {user && (
              <div className="relative ml-3">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 bg-white rounded-full pl-2 pr-1 py-1 hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 focus:outline-none"
                >
                  <div className="flex flex-col items-end mr-1">
                    <p className="text-xs font-semibold text-gray-700 leading-none">{user.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-gray-500 capitalize leading-none pt-0.5">{user.role}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold text-xs uppercase shadow-md shadow-blue-200">
                    {user.name.substring(0, 2)}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
