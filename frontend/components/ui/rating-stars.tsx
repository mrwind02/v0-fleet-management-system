import * as React from "react"
import { Star, StarHalf } from "lucide-react"
import { cn } from "@/utils/utils"

interface RatingStarsProps extends React.HTMLAttributes<HTMLDivElement> {
  rating: number
  maxRating?: number
  showValue?: boolean
  size?: "sm" | "md" | "lg"
}

export function RatingStars({
  rating = 5.0,
  maxRating = 5,
  showValue = true,
  size = "sm",
  className,
  ...props
}: RatingStarsProps) {
  const numericRating = Math.min(Math.max(Number(rating) || 0, 0), maxRating)
  const fullStars = Math.floor(numericRating)
  const hasHalfStar = numericRating % 1 >= 0.4 && numericRating % 1 < 0.9
  const emptyStars = Math.max(0, maxRating - fullStars - (hasHalfStar ? 1 : 0))

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div className={cn("inline-flex items-center gap-1 text-amber-500", className)} {...props}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className={cn(iconSizes[size], "fill-amber-400 text-amber-400")} />
        ))}
        {hasHalfStar && (
          <StarHalf key="half" className={cn(iconSizes[size], "fill-amber-400 text-amber-400")} />
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className={cn(iconSizes[size], "text-muted-foreground/30")} />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-bold text-foreground ml-0.5">
          {numericRating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
