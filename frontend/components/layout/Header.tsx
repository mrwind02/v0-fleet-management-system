"use client"

import * as React from "react"
import { Bell, HelpCircle, Menu } from "lucide-react"

import { GlobalSearch } from "./GlobalSearch"
import { ThemeToggle } from "./ThemeToggle"
import { UserNav } from "./UserNav"
import { MobileSidebar } from "./MobileSidebar"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  toggleSidebar?: () => void
}

export function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
        
        <MobileSidebar />

        {/* Desktop Hamburger toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:flex h-9 w-9 text-muted-foreground" 
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Left aligned Search */}
        <div className="flex flex-1 sm:flex-initial items-center">
          <GlobalSearch />
        </div>

        {/* Filler to push right controls */}
        <div className="hidden sm:flex flex-1" />

        {/* Right side controls */}
        <div className="flex items-center justify-end gap-x-2 lg:gap-x-4">
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-muted-foreground" aria-label="Notificações">
            <Bell className="h-5 w-5" aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white">
              5
            </span>
          </Button>
          
          <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full text-muted-foreground hidden sm:flex" aria-label="Ajuda">
            <HelpCircle className="h-5 w-5" aria-hidden="true" />
          </Button>

          <ThemeToggle />
          
          <div className="hidden sm:block border-l border-border pl-2 lg:pl-4 ml-2">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  )
}
