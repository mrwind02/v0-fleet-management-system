import type React from "react"
import type { Metadata } from "next"
import { Inter, Outfit } from "next/font/google"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/utils/utils"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], display: "swap" })
const outfit = Outfit({ 
  subsets: ["latin"], 
  display: "swap",
  weight: ["500", "600", "700", "800", "900"],
  variable: "--font-outfit"
})

export const metadata: Metadata = {
  title: "FrotaOne - Gestão Inteligente de Frotas",
  description: "Plataforma inteligente de gerenciamento de frota, manutenção e despesas operacionais.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className={cn(inter.className, outfit.variable, "h-full antialiased")}>
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
