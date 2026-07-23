"use client"

import * as React from "react"
import { cn } from "@/utils/utils"
import { Search, ChevronDown, Check } from "lucide-react"

export interface AutocompleteOption {
  label: string
  value: string
  description?: string
  avatar?: string
}

export interface AutocompleteProps {
  options: AutocompleteOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: boolean
  className?: string
}

export function Autocomplete({ options, value, onChange, placeholder = "Buscar...", error, className }: AutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  
  const selectedOption = React.useMemo(() => options.find(o => o.value === value), [options, value])
  
  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    return options.filter(o => 
      o.label.toLowerCase().includes(search.toLowerCase()) || 
      o.description?.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search])

  // Click outside to close (simplified for mock, normally use a custom hook)
  React.useEffect(() => {
    const handleClick = () => setOpen(false)
    if (open) {
      window.addEventListener('click', handleClick)
    }
    return () => window.removeEventListener('click', handleClick)
  }, [open])

  return (
    <div className={cn("relative w-full", className)} onClick={e => e.stopPropagation()}>
      <div 
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm cursor-text",
          error && "border-destructive ring-1 ring-destructive",
          open && "ring-1 ring-ring border-input"
        )}
        onClick={() => setOpen(true)}
      >
        {!open ? (
          <span className={cn("truncate", !selectedOption && "text-muted-foreground")}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        ) : (
          <input
            type="text"
            className="w-full h-full bg-transparent outline-none"
            placeholder={placeholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        )}
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
      </div>

      {open && (
        <div className="absolute top-full mt-1 w-full z-50 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-sm text-center text-muted-foreground">Nenhum resultado encontrado.</div>
          ) : (
            filteredOptions.map(option => (
              <div 
                key={option.value}
                className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer transition-colors"
                onClick={() => {
                  onChange?.(option.value)
                  setSearch("")
                  setOpen(false)
                }}
              >
                {option.avatar ? (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                    {option.avatar}
                  </div>
                ) : (
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    {value === option.value && <Check className="w-4 h-4" />}
                  </div>
                )}
                
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{option.label}</span>
                  {option.description && (
                    <span className="text-[10px] text-muted-foreground truncate">{option.description}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
