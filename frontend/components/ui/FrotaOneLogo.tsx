"use client"

import * as React from "react"

export interface FrotaOneLogoProps {
  className?: string
  iconOnly?: boolean
  variant?: "dark" | "light" | "blue" | "default"
  showTagline?: boolean
  size?: "sm" | "md" | "lg" | "xl"
}

export function FrotaOneIconMark({
  className = "w-9 h-9",
  variant = "default"
}: {
  className?: string
  variant?: "default" | "dark" | "blue" | "light"
}) {
  if (variant === "blue") {
    return (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Blue Squircle Background */}
        <rect width="120" height="120" rx="28" fill="#0066ff" />
        
        {/* Upper Arch of 'F' - White Fill with Dark Navy Outline */}
        <path
          d="M 24 54 C 23 35 34 16 54 16 L 98 16 C 104 16 106 22 101 28 L 92 36 C 86 40 78 40 66 40 L 46 40 C 38 40 34 46 32 52 Z"
          fill="#ffffff"
          stroke="#0b132b"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        
        {/* Lower Road Leg of 'F' - White Road */}
        <path
          d="M 12 102 C 10 88 16 70 30 58 C 40 48 56 44 92 44 C 98 44 100 50 94 57 L 86 65 C 82 68 75 68 65 68 L 42 68 C 32 68 28 78 26 102 Z"
          fill="#ffffff"
        />

        {/* Electric Blue Dashed Centerline */}
        <path
          d="M 19 98 C 21 82 28 58 52 56 L 84 56"
          fill="none"
          stroke="#0066ff"
          strokeWidth="4"
          strokeDasharray="7 4"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (variant === "dark") {
    return (
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Dark Navy Squircle Background */}
        <rect width="120" height="120" rx="28" fill="#0b132b" />
        
        {/* Upper Arch of 'F' - White Fill with Dark Navy Outline */}
        <path
          d="M 24 54 C 23 35 34 16 54 16 L 98 16 C 104 16 106 22 101 28 L 92 36 C 86 40 78 40 66 40 L 46 40 C 38 40 34 46 32 52 Z"
          fill="#ffffff"
          stroke="#0b132b"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        
        {/* Lower Road Leg of 'F' - Electric Blue */}
        <path
          d="M 12 102 C 10 88 16 70 30 58 C 40 48 56 44 92 44 C 98 44 100 50 94 57 L 86 65 C 82 68 75 68 65 68 L 42 68 C 32 68 28 78 26 102 Z"
          fill="#0066ff"
        />

        {/* White Dashed Centerline */}
        <path
          d="M 19 98 C 21 82 28 58 52 56 L 84 56"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4"
          strokeDasharray="7 4"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Default Transparent Icon - Upper arch is WHITE fill with Dark Navy Outline
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Upper Arch of 'F' - White Fill + Dark Navy Outline (Exactly like user photo) */}
      <path
        d="M 24 54 C 23 35 34 16 54 16 L 98 16 C 104 16 106 22 101 28 L 92 36 C 86 40 78 40 66 40 L 46 40 C 38 40 34 46 32 52 Z"
        fill="#ffffff"
        stroke="#0b132b"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      
      {/* Lower Road Leg of 'F' - Electric Blue Sweeping Shape */}
      <path
        d="M 12 102 C 10 88 16 70 30 58 C 40 48 56 44 92 44 C 98 44 100 50 94 57 L 86 65 C 82 68 75 68 65 68 L 42 68 C 32 68 28 78 26 102 Z"
        fill="#0066ff"
      />

      {/* White Dashed Centerline on the Blue Road */}
      <path
        d="M 19 98 C 21 82 28 58 52 56 L 84 56"
        fill="none"
        stroke="#ffffff"
        strokeWidth="4"
        strokeDasharray="7 4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function FrotaOneLogo({
  className = "",
  iconOnly = false,
  variant = "light",
  showTagline = true,
  size = "md"
}: FrotaOneLogoProps) {
  const sizeMap = {
    sm: { icon: "w-8 h-8", text: "text-xl", tagline: "text-[7.5px]" },
    md: { icon: "w-10 h-10", text: "text-2xl", tagline: "text-[9px]" },
    lg: { icon: "w-12 h-12", text: "text-3xl", tagline: "text-[10.5px]" },
    xl: { icon: "w-16 h-16", text: "text-4xl", tagline: "text-[12px]" }
  }

  const currentSize = sizeMap[size]

  if (iconOnly) {
    return <FrotaOneIconMark className={`${currentSize.icon} ${className}`} variant={variant === "dark" ? "dark" : "default"} />
  }

  return (
    <div className={`flex items-center gap-3.5 font-brand select-none ${className}`}>
      {/* Official 'F' Highway Icon Mark */}
      <FrotaOneIconMark className={`${currentSize.icon} shrink-0`} variant={variant === "dark" ? "dark" : "default"} />

      {/* Typography: FrotaOne + GESTÃO INTELIGENTE DE FROTAS */}
      <div className="flex flex-col justify-center">
        <div className={`flex items-center leading-none tracking-tight font-extrabold ${currentSize.text}`}>
          <span className={variant === "dark" ? "text-white" : "text-[#0b132b]"}>
            Frota
          </span>
          <span className="text-[#0066ff]">
            One
          </span>
        </div>

        {showTagline && (
          <span
            className={`${currentSize.tagline} font-bold uppercase tracking-[0.22em] mt-1.5 ${
              variant === "dark" ? "text-slate-400" : "text-[#64748b]"
            }`}
          >
            GESTÃO INTELIGENTE DE FROTAS
          </span>
        )}
      </div>
    </div>
  )
}

