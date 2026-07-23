"use client"

import React from "react"
import { ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  title: string
  description?: string
  actions?: React.ReactNode
}

export function PageHeader({ breadcrumbs, title, description, actions }: PageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 w-full mb-4">
      <div>
        {breadcrumbs.length > 0 && (
          <div className="flex items-center text-xs font-semibold text-muted-foreground mb-1">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <ChevronRight className="h-3 w-3 mx-1.5" />}
                {item.href ? (
                  <span 
                    className="cursor-pointer hover:underline transition-colors hover:text-foreground"
                    onClick={() => router.push(item.href!)}
                  >
                    {item.label}
                  </span>
                ) : (
                  <span className="text-foreground">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      
      {actions && (
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  )
}
