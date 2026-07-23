"use client"

import * as React from "react"
import { cn } from "@/utils/utils"

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  error?: boolean
  value?: number
  onChange?: (value: number) => void
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, error, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("")

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value).replace('R$', '').trim())
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let rawValue = e.target.value.replace(/\D/g, "")
      if (!rawValue) {
        setDisplayValue("")
        onChange?.(0)
        return
      }
      
      const numericValue = parseInt(rawValue, 10) / 100
      setDisplayValue(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(numericValue))
      onChange?.(numericValue)
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">R$</span>
        <input
          type="text"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          placeholder="0,00"
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"
