"use client"

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
        className="hidden md:flex shrink-0" 
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-muted/10 p-3 sm:p-4 lg:p-5">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
        
        {/* Discreet Footer */}
        <footer className="shrink-0 border-t py-4 text-center text-xs text-muted-foreground/60 bg-muted/10">
          <p>© {new Date().getFullYear()} FrotaOne - Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  )
}
