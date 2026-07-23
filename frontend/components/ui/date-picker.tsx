"use client"

import * as React from "react"
import { cn } from "@/utils/utils"

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        type="date"
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
DatePicker.displayName = "DatePicker"
