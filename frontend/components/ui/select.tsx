"use client"

import * as React from "react"
import { cn } from "@/utils/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative inline-block w-full">
        <select
          className={cn(
            "flex h-9 w-full appearance-none items-center justify-between rounded-md border border-input bg-background px-2.5 py-1 pr-7 text-xs shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer leading-none",
            error && "border-destructive focus:ring-destructive",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-50 pointer-events-none text-muted-foreground" />
      </div>
    )
  }
)
Select.displayName = "Select"
