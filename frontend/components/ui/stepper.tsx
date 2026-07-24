"use client"

import * as React from "react"
import { cn } from "@/utils/utils"
import { Check } from "lucide-react"

export interface StepperStep {
  label: string
  description?: string
}

interface StepperProps {
  steps: StepperStep[]
  currentStep: number // 0-indexed
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex items-start w-full", className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isActive = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Circle */}
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300",
                  isCompleted
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isActive
                    ? "border-blue-600 bg-white text-blue-600 shadow-md shadow-blue-100 dark:bg-background dark:shadow-none ring-4 ring-blue-100 dark:ring-blue-900/30"
                    : "border-muted-foreground/30 bg-muted/30 text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {/* Label */}
              <div className="mt-1.5 text-center">
                <p
                  className={cn(
                    "text-[10px] font-semibold leading-none whitespace-nowrap",
                    isActive ? "text-blue-600" : isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {step.description && (
                  <p className="text-[9px] text-muted-foreground mt-0.5">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className="flex-1 mx-1 mt-4">
                <div
                  className={cn(
                    "h-0.5 w-full rounded-full transition-all duration-500",
                    isCompleted ? "bg-blue-600" : "bg-muted-foreground/20"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
