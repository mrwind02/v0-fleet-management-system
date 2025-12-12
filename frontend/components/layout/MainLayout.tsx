"use client"

import { Header } from "./Header"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 w-full pb-8" style={{ paddingLeft: '6mm', paddingRight: '6mm', paddingTop: '3mm' }}>
        {children}
      </main>
    </div>
  )
}
