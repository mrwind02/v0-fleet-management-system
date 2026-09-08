"use client"

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

const STORAGE_KEY = "frotaone_sidebar_collapsed"

// Global in-memory cache to maintain state across Next.js client navigation
let memorySidebarCollapsed: boolean | null = null

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState<boolean>(() => {
    if (memorySidebarCollapsed !== null) {
      return memorySidebarCollapsed
    }
    return false
  })

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved !== null) {
        const val = saved === "true"
        memorySidebarCollapsed = val
        setIsSidebarCollapsed(val)
      }
    } catch (e) {
      // localStorage may fail in restricted environments
    }
  }, [])

  const setCollapsed = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setIsSidebarCollapsed((prev) => {
      const next = typeof value === "function" ? value(prev) : value
      memorySidebarCollapsed = next
      try {
        localStorage.setItem(STORAGE_KEY, String(next))
      } catch (e) {}
      return next
    })
  }, [])

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setCollapsed} 
        className="hidden md:flex shrink-0 h-full" 
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header 
          toggleSidebar={() => setCollapsed(!isSidebarCollapsed)} 
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/10 p-3 sm:p-4 lg:p-5 flex flex-col justify-between">
          <div className="mx-auto max-w-7xl w-full flex-1">
            {children}
          </div>
          
          {/* Discreet Footer */}
          <footer className="shrink-0 border-t py-4 text-center text-xs text-muted-foreground/60 bg-transparent mt-6">
            <p>© {new Date().getFullYear()} FrotaOne - Todos os direitos reservados.</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
