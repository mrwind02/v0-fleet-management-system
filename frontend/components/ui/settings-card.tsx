"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/utils/utils"

interface SettingsCardProps {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  badgeText?: string
  badgeVariant?: "default" | "secondary" | "outline"
  onClick: () => void
  iconBgColor?: string
  iconColor?: string
}

export function SettingsCard({
  id,
  title,
  description,
  icon,
  badgeText,
  badgeVariant = "secondary",
  onClick,
  iconBgColor = "bg-primary/10 dark:bg-primary/20",
  iconColor = "text-primary"
}: SettingsCardProps) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="h-full"
    >
      <Card
        onClick={onClick}
        className="h-full flex flex-col justify-between overflow-hidden border border-border/70 hover:border-primary/40 bg-card hover:shadow-md transition-all cursor-pointer group"
      >
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-xl border border-border/40 transition-transform group-hover:scale-105", iconBgColor, iconColor)}>
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {title}
                </h3>
                {badgeText && (
                  <Badge variant={badgeVariant} className="text-[10px] px-1.5 py-0 mt-0.5 font-semibold">
                    {badgeText}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs font-semibold text-primary">
            <span>Gerenciar</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
