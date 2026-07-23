import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/utils/utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FrotaOne - Gerenciamento de Frota",
  description: "Sistema completo de gerenciamento de frota e manutenção",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn(inter.className, "overflow-hidden")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster position="bottom-right" duration={3500} expand={true} richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
