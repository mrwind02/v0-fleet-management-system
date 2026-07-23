"use client"

import * as React from "react"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./Sidebar"

export function MobileSidebar() {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-[280px]">
        {/* We pass a dummy state setter since the mobile sidebar is never collapsed visually */}
        <Sidebar isCollapsed={false} setIsCollapsed={() => {}} className="w-full border-r-0" />
      </SheetContent>
    </Sheet>
  )
}
